import { GoogleGenAI, GenerateContentResponse, FunctionDeclaration, Type, Modality } from "@google/genai";
import { SOFIA_SYSTEM_INSTRUCTION } from "../constants";
import { Role, HistoryEntry, MessagePart } from "../types";

// --- Tool Definitions (Function Declarations) ---

const consultarStatusRemocaoDoc: FunctionDeclaration = {
  name: 'consultar_status_remocao',
  description: 'Consulta o status atual do processo de remoção de um Oficial de Chancelaria no sistema do MRE.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      matricula: {
        type: Type.STRING,
        description: 'Número da matrícula funcional do servidor (ex: 12345).',
      },
    },
    required: ['matricula'],
  },
};

const calcularAuxilioDeslocamentoDoc: FunctionDeclaration = {
  name: 'calcular_auxilio_deslocamento',
  description: 'Calcula o valor estimado do auxílio deslocamento baseada na distância em km.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      distancia_km: {
        type: Type.NUMBER,
        description: 'Distância em quilômetros entre a origem e o destino.',
      },
    },
    required: ['distancia_km'],
  },
};

const consultarLegislacaoDoc: FunctionDeclaration = {
  name: 'consultar_legislacao',
  description: 'Consulta a Lei 11.440/2006 sobre o regime jurídico do Serviço Exterior Brasileiro.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      tema: {
        type: Type.STRING,
        description: 'Tema específico (ex: "promoção", "remuneração", "remoção").',
      },
    },
    required: ['tema'],
  },
};

const obterNoticiasDoc: FunctionDeclaration = {
  name: 'obter_noticias_recentes',
  description: 'Busca as notícias mais recentes publicadas no portal da ASOF.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      qtd: {
        type: Type.NUMBER,
        description: 'Quantidade de notícias a retornar.',
      }
    },
  },
};

// --- Function Implementation (Backend Simulation) ---

const functionsMap: Record<string, (args: any) => any> = {
  consultar_status_remocao: ({ matricula }) => {
    const mockDb: Record<string, any> = {
      '12345': { status: 'Aprovado', destino: 'Embaixada em Paris', data_apresentacao: '2024-08-15' },
      '67890': { status: 'Em Análise', destino: 'Consulado em Nova York', fase: 'Validação Orçamentária' },
    };
    return mockDb[matricula] || { status: 'Não encontrado', observacao: 'Matrícula inexistente.' };
  },
  calcular_auxilio_deslocamento: ({ distancia_km }) => ({
    valor_estimado_brl: (2000 + (distancia_km * 1.5)).toFixed(2),
    moeda: 'BRL',
    obs: 'Estimativa baseada em tabelas padrão.'
  }),
  consultar_legislacao: ({ tema }) => {
    const base: Record<string, string> = {
      'promoção': 'Art. 15. A promoção obedecerá aos critérios de antiguidade e merecimento.',
      'remuneração': 'Art. 38. A remuneração é constituída pelo Vencimento Básico e GDES.',
      'remoção': 'Art. 18. A remoção é o deslocamento do servidor a pedido ou de ofício.'
    };
    const key = Object.keys(base).find(k => tema.toLowerCase().includes(k));
    return key ? { encontrado: true, artigo: base[key] } : { encontrado: false };
  },
  obter_noticias_recentes: ({ qtd = 3 }) => ({
    noticias: [
      { data: '15/05/2024', titulo: 'ASOF reúne-se com Secretaria Geral', link: '/reuniao' },
      { data: '10/05/2024', titulo: 'Novo edital de remoção publicado', link: '/edital' }
    ].slice(0, qtd)
  })
};

// --- In-Memory Conversation History ---
let conversationHistory: HistoryEntry[] = [];

export const resetChat = () => {
  conversationHistory = [];
};

/**
 * Sends a message stream to Gemini using the recommended generateContentStream approach.
 * Handles automatic tool call resolution and thinking budget for better reasoning.
 */
export async function* sendMessageStream(userInput: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Add user message to history
  conversationHistory.push({
    role: Role.USER,
    parts: [{ text: userInput }]
  });

  try {
    let currentIteration = 0;
    const maxIterations = 5; // Safety cap for tool call loops

    while (currentIteration < maxIterations) {
      currentIteration++;

      const stream = await ai.models.generateContentStream({
        model: 'gemini-3-pro-preview',
        contents: conversationHistory.map(h => ({
          role: h.role,
          parts: h.parts
        })),
        config: {
          systemInstruction: SOFIA_SYSTEM_INSTRUCTION,
          temperature: 0.4,
          thinkingConfig: { thinkingBudget: 8000 }, // Enable "deep thinking" for diplomatic accuracy
          tools: [{
            functionDeclarations: [
              consultarStatusRemocaoDoc,
              calcularAuxilioDeslocamentoDoc,
              consultarLegislacaoDoc,
              obterNoticiasDoc
            ]
          }]
        }
      });

      let accumulatedText = "";
      const functionCalls: any[] = [];

      for await (const chunk of stream) {
        if (chunk.text) {
          accumulatedText += chunk.text;
          yield chunk.text;
        }
        if (chunk.functionCalls) {
          functionCalls.push(...chunk.functionCalls);
        }
      }

      // If text was returned but no function calls, we are done
      if (functionCalls.length === 0) {
        if (accumulatedText) {
          conversationHistory.push({
            role: Role.MODEL,
            parts: [{ text: accumulatedText }]
          });
        }
        break;
      }

      // If function calls were returned, we need to process them and continue the loop
      // First, add the model's intent (the calls) to history
      conversationHistory.push({
        role: Role.MODEL,
        parts: functionCalls.map(call => ({
          functionCall: {
            name: call.name,
            args: call.args,
            id: call.id
          }
        }))
      });

      // Execute functions
      const responses = await Promise.all(functionCalls.map(async (call) => {
        const fn = functionsMap[call.name];
        let result;
        try {
          result = fn ? fn(call.args) : { error: 'Ferramenta não encontrada' };
        } catch (e: any) {
          result = { error: e.message };
        }
        return {
          functionResponse: {
            name: call.name,
            response: { result },
            id: call.id
          }
        };
      }));

      // Add function responses to history and loop back to model
      conversationHistory.push({
        role: Role.MODEL, // In many SDK versions, tool responses are considered parts of the model or user turn depending on context, but 'model' turn containing tool results is a common pattern for resubmission.
        parts: responses as any
      });
      
      // The loop will now call Gemini again with the tool results in context.
    }
  } catch (error) {
    console.error("Gemini stream error:", error);
    throw error;
  }
}
