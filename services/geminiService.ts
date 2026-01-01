import { Role, HistoryEntry } from "../types";
import {
  PRIMARY_MODEL,
  FALLBACK_MODEL,
  GEMMA_SYSTEM_INSTRUCTION,
} from "../constants";

// --- Tool Definitions (Function Declarations) ---

const consultarStatusRemocaoDoc = {
  name: "consultar_status_remocao",
  description:
    "Consulta o status atual do processo de remoção de um Oficial de Chancelaria no sistema do MRE.",
  parameters: {
    type: "OBJECT",
    properties: {
      matricula: {
        type: "STRING",
        description: "Número da matrícula funcional do servidor (ex: 12345).",
      },
    },
    required: ["matricula"],
  },
};

const calcularAuxilioDeslocamentoDoc = {
  name: "calcular_auxilio_deslocamento",
  description:
    "Calcula o valor estimado do auxílio deslocamento baseada na distância em km.",
  parameters: {
    type: "OBJECT",
    properties: {
      distancia_km: {
        type: "NUMBER",
        description: "Distância em quilômetros entre a origem e o destino.",
      },
    },
    required: ["distancia_km"],
  },
};

const consultarLegislacaoDoc = {
  name: "consultar_legislacao",
  description:
    "Consulta a Lei 11.440/2006 sobre o regime jurídico do Serviço Exterior Brasileiro.",
  parameters: {
    type: "OBJECT",
    properties: {
      tema: {
        type: "STRING",
        description:
          'Tema específico (ex: "promoção", "remuneração", "remoção").',
      },
    },
    required: ["tema"],
  },
};

const obterNoticiasDoc = {
  name: "obter_noticias_recentes",
  description: "Busca as notícias mais recentes publicadas no portal da ASOF.",
  parameters: {
    type: "OBJECT",
    properties: {
      qtd: {
        type: "NUMBER",
        description: "Quantidade de notícias a retornar.",
      },
    },
  },
};

// --- Function Implementation (Backend Simulation) ---

const functionsMap: Record<string, (args: any) => any> = {
  consultar_status_remocao: ({ matricula }) => {
    const mockDb: Record<string, any> = {
      "12345": {
        status: "Aprovado",
        destino: "Embaixada em Paris",
        data_apresentacao: "2024-08-15",
      },
      "67890": {
        status: "Em Análise",
        destino: "Consulado em Nova York",
        fase: "Validação Orçamentária",
      },
    };
    return (
      mockDb[matricula] || {
        status: "Não encontrado",
        observacao: "Matrícula inexistente.",
      }
    );
  },
  calcular_auxilio_deslocamento: ({ distancia_km }) => ({
    valor_estimado_brl: (2000 + distancia_km * 1.5).toFixed(2),
    moeda: "BRL",
    obs: "Estimativa baseada em tabelas padrão.",
  }),
  consultar_legislacao: ({ tema }) => {
    const base: Record<string, string> = {
      promoção:
        "Art. 15. A promoção obedecerá aos critérios de antiguidade e merecimento.",
      remuneração:
        "Art. 38. A remuneração é constituída pelo Vencimento Básico e GDES.",
      remoção:
        "Art. 18. A remoção é o deslocamento do servidor a pedido ou de ofício.",
    };
    const key = Object.keys(base).find((k) => tema.toLowerCase().includes(k));
    return key
      ? { encontrado: true, artigo: base[key] }
      : { encontrado: false };
  },
  obter_noticias_recentes: ({ qtd = 3 }) => ({
    noticias: [
      {
        data: "15/05/2024",
        titulo: "ASOF reúne-se com Secretaria Geral",
        link: "/reuniao",
      },
      {
        data: "10/05/2024",
        titulo: "Novo edital de remoção publicado",
        link: "/edital",
      },
    ].slice(0, qtd),
  }),
};

// --- In-Memory Conversation History ---
let conversationHistory: HistoryEntry[] = [];

export const resetChat = () => {
  conversationHistory = [];
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function* sendMessageStream(
  userInput: string,
  systemInstruction: string,
  modelName: string,
) {
  // We keep history management here in the client for simplicity,
  // but we send the whole state to the serverless function.

  // Backup for rollback
  const historySnapshot = JSON.parse(JSON.stringify(conversationHistory));

  conversationHistory.push({
    role: Role.USER,
    parts: [{ text: userInput }],
  });

  async function* fetchStream(
    currentModel: string,
    currentInstruction: string,
  ) {
    // The proxy expects tools definition in the body to configure the model instance
    // We pass the tools defined in this file.
    const tools = [
      {
        functionDeclarations: [
          consultarStatusRemocaoDoc,
          calcularAuxilioDeslocamentoDoc,
          consultarLegislacaoDoc,
          obterNoticiasDoc,
        ],
      },
    ];

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        history: conversationHistory.map((h) => ({
          role: h.role,
          parts: h.parts,
        })),
        modelName: currentModel,
        systemInstruction: currentInstruction,
        tools: tools,
      }),
    });

    if (!response.ok) {
      let errorBody;
      try {
        errorBody = await response.json();
      } catch (e) {
        errorBody = { message: response.statusText };
      }
      throw new Error(
        errorBody.error || errorBody.message || `HTTP Error ${response.status}`,
      );
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("No response body");

    const decoder = new TextDecoder();
    let buffer = "";

    let accumulatedText = "";
    const functionCalls: any[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const chunk = JSON.parse(line);
          if (chunk.type === "text") {
            accumulatedText += chunk.content;
            yield chunk.content;
          } else if (chunk.type === "functionCalls") {
            if (Array.isArray(chunk.content)) {
              functionCalls.push(...chunk.content);
            } else if (chunk.content) {
              functionCalls.push(chunk.content);
            }
          }
        } catch (e) {
          console.warn("Error parsing chunk:", e);
        }
      }
    }

    // Handle function calls logic (mirroring previous implementation)
    if (functionCalls.length > 0) {
      conversationHistory.push({
        role: Role.MODEL,
        parts: functionCalls.map((call, idx) => ({
          functionCall: {
            name: call.name,
            args: call.args,
            id: call.id || `call_${Date.now()}_${idx}`,
          },
        })),
      });

      // Execute functions locally
      const responses = await Promise.all(
        functionCalls.map(async (call) => {
          const fn = functionsMap[call.name];
          let result;
          try {
            result = fn
              ? fn(call.args)
              : { error: "Ferramenta não encontrada" };
          } catch (e: any) {
            result = { error: e.message };
          }
          return {
            functionResponse: {
              name: call.name,
              response: { result },
              id: call.id,
            },
          };
        }),
      );

      conversationHistory.push({
        role: Role.MODEL, // Keeping Role.MODEL for consistency
        parts: responses as any,
      });

      // Recursive call for follow-up
      yield* fetchStream(currentModel, currentInstruction);
    } else if (accumulatedText) {
      conversationHistory.push({
        role: Role.MODEL,
        parts: [{ text: accumulatedText }],
      });
    }
  }

  try {
    const chosenPrimary = modelName || PRIMARY_MODEL;
    // simple retry logic for the fetch wrapper
    const retries = 2;
    for (let i = 0; i <= retries; i++) {
      try {
        yield* fetchStream(chosenPrimary, systemInstruction);
        break;
      } catch (e: any) {
        console.warn(`Attempt ${i + 1} failed:`, e);

        // Check for retriable errors from the proxy (which might wrap upstream errors)
        // Simple heuristic: if it mentions 429 or 5xx
        const errMsg = (e.message || "").toLowerCase();
        const isRetriable =
          errMsg.includes("429") ||
          errMsg.includes("503") ||
          errMsg.includes("500") ||
          errMsg.includes("fetch failed");

        if (i === retries || !isRetriable) throw e;
        await delay(1000 * Math.pow(2, i));
      }
    }
  } catch (error) {
    console.warn("Primary model failed, switching to fallback...", error);
    // Rollback
    conversationHistory = JSON.parse(JSON.stringify(historySnapshot));
    conversationHistory.push({
      role: Role.USER,
      parts: [{ text: userInput }],
    });

    try {
      yield* fetchStream(FALLBACK_MODEL, GEMMA_SYSTEM_INSTRUCTION);
    } catch (fallbackError) {
      console.error("All models failed:", fallbackError);
      throw fallbackError;
    }
  }
}
