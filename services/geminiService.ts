import { GoogleGenAI, GenerateContentResponse, FunctionDeclaration, Type, Modality } from "@google/genai";
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
 */
export async function* sendMessageStream(userInput: string, systemInstruction: string, modelName: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  conversationHistory.push({
    role: Role.USER,
    parts: [{ text: userInput }]
  });

  try {
    let currentIteration = 0;
    const maxIterations = 5;

    while (currentIteration < maxIterations) {
      currentIteration++;

      const stream = await ai.models.generateContentStream({
        model: modelName,
        contents: conversationHistory.map(h => ({
          role: h.role,
          parts: h.parts
        })),
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.35,
          // O thinkingBudget é removido quando se usa tools para evitar o erro de 'thought signature'
          // O modelo decidirá o raciocínio automaticamente.
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

      if (functionCalls.length === 0) {
        if (accumulatedText) {
          conversationHistory.push({
            role: Role.MODEL,
            parts: [{ text: accumulatedText }]
          });
        }
        break;
      }

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

      conversationHistory.push({
        role: Role.MODEL,
        parts: responses as any
      });
    }
  } catch (error) {
    console.error("Gemini stream error:", error);
    throw error;
  }
}