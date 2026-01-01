import { GoogleGenAI, ApiError } from "@google/genai";
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

/**
 * Sends a message stream to Gemini with fallback mechanisms.
 */
export async function* sendMessageStream(
  userInput: string,
  systemInstruction: string,
  modelName: string,
) {
  const apiKey = process.env.API_KEY || "";
  const ai = new GoogleGenAI({ apiKey });

  // Deep clone history before user message to allow perfect rollback
  const historySnapshot = JSON.parse(JSON.stringify(conversationHistory));

  conversationHistory.push({
    role: Role.USER,
    parts: [{ text: userInput }],
  });

  async function* executeGeneration(
    currentModel: string,
    currentSystemInstruction: string,
  ) {
    let currentIteration = 0;
    const maxIterations = 5;

    // Local history snapshot for function call rollbacks
    const internalSnapshot = JSON.parse(JSON.stringify(conversationHistory));

    try {
      while (currentIteration < maxIterations) {
        currentIteration++;

        const response = await ai.models.generateContentStream({
          model: currentModel,
          contents: conversationHistory.map((h) => ({
            role: h.role,
            parts: h.parts,
          })),
          config: {
            systemInstruction: currentSystemInstruction,
            temperature: 0.35,
            tools: [
              {
                functionDeclarations: [
                  consultarStatusRemocaoDoc,
                  calcularAuxilioDeslocamentoDoc,
                  consultarLegislacaoDoc,
                  obterNoticiasDoc,
                ],
              } as any,
            ],
          },
        });

        let accumulatedText = "";
        const functionCalls: any[] = [];

        for await (const chunk of response) {
          if (chunk.text) {
            accumulatedText += chunk.text;
            yield chunk.text;
          }
          if (chunk.functionCalls) {
            functionCalls.push(...chunk.functionCalls);
          }
        }

        if (functionCalls.length === 0) {
          if (accumulatedText) {
            conversationHistory.push({
              role: Role.MODEL,
              parts: [{ text: accumulatedText }],
            });
          }
          break;
        }

        conversationHistory.push({
          role: Role.MODEL,
          parts: functionCalls.map((call) => ({
            functionCall: {
              name: call.name,
              args: call.args,
              id: call.id,
            },
          })),
        });

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
          role: Role.MODEL,
          parts: responses as any,
        });
      }
    } catch (e) {
      conversationHistory = JSON.parse(JSON.stringify(internalSnapshot));
      throw e;
    }
  }

  async function* attemptModel(
    model: string,
    instruction: string,
    retries = 2,
  ): AsyncGenerator<string, boolean, unknown> {
    for (let i = 0; i <= retries; i++) {
      try {
        for await (const chunk of executeGeneration(model, instruction)) {
          yield chunk;
        }
        return true;
      } catch (error: any) {
        console.error(
          `Error with model ${model} (attempt ${i + 1}/${retries + 1}):`,
          error,
        );

        const status =
          error.status ||
          (error instanceof ApiError
            ? error.status
            : (error as any).response?.status);
        const isRetriable = status === 429 || (status >= 500 && status < 600);

        if (isRetriable && i < retries) {
          const waitTime = Math.pow(2, i) * 1000 + Math.random() * 500;
          console.warn(`Retrying after ${waitTime}ms...`);
          await delay(waitTime);
          continue;
        }
        return false;
      }
    }
    return false;
  }

  try {
    const chosenPrimary = modelName || PRIMARY_MODEL;
    const success = yield* attemptModel(chosenPrimary, systemInstruction);

    if (!success) {
      conversationHistory = JSON.parse(JSON.stringify(historySnapshot));
      conversationHistory.push({
        role: Role.USER,
        parts: [{ text: userInput }],
      });

      console.warn("Primary model failed, switching to fallback...");
      const fallbackSuccess = yield* attemptModel(
        FALLBACK_MODEL,
        GEMMA_SYSTEM_INSTRUCTION,
        1,
      );
      if (!fallbackSuccess) throw new Error("Fallback model also failed");
    }
  } catch (error) {
    console.error("Critical error in sendMessageStream:", error);
    throw error;
  }
}
