import { GoogleGenAI, Chat, GenerateContentResponse, FunctionDeclaration, Type } from "@google/genai";
import { SOFIA_SYSTEM_INSTRUCTION } from "../constants";

let chatSession: Chat | null = null;
let aiClient: GoogleGenAI | null = null;

// --- Definição das Ferramentas (MCPs) ---

const consultarStatusRemocaoDoc: FunctionDeclaration = {
  name: 'consultar_status_remocao',
  description: 'Consulta o status atual do processo de remoção de um Oficial de Chancelaria no sistema do MRE. Retorna o posto de destino e a fase do processo.',
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
  description: 'Calcula o valor estimado do auxílio deslocamento baseada na distância entre a sede e o posto.',
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
  description: 'Consulta artigos da Lei 11.440/2006 sobre o regime jurídico do Serviço Exterior Brasileiro para tirar dúvidas legais.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      tema: {
        type: Type.STRING,
        description: 'Tema específico para busca na lei (ex: "promoção", "remuneração", "deveres", "férias").',
      },
    },
    required: ['tema'],
  },
};

const obterNoticiasDoc: FunctionDeclaration = {
  name: 'obter_noticias_recentes',
  description: 'Busca as notícias e comunicados mais recentes publicados no portal da ASOF.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      qtd: {
        type: Type.NUMBER,
        description: 'Quantidade de notícias a retornar (padrão: 3).',
      }
    },
  },
};

// --- Implementação das Funções (Simulação de Backend) ---

const functionsMap: Record<string, Function> = {
  consultar_status_remocao: ({ matricula }: { matricula: string }) => {
    console.log(`[System] Consultando remoção para matrícula: ${matricula}`);
    // Simulação de banco de dados
    const mockDb: Record<string, any> = {
      '12345': { status: 'Aprovado', destino: 'Embaixada em Paris', data_apresentacao: '2024-08-15' },
      '67890': { status: 'Em Análise', destino: 'Consulado em Nova York', fase: 'Validação Orçamentária' },
      '11111': { status: 'Pendente', destino: 'Não definido', observacao: 'Aguardando abertura de edital' }
    };
    
    const result = mockDb[matricula] || { status: 'Não encontrado', observacao: 'Matrícula inexistente ou sem processo ativo.' };
    return result;
  },
  
  calcular_auxilio_deslocamento: ({ distancia_km }: { distancia_km: number }) => {
    console.log(`[System] Calculando auxílio para: ${distancia_km}km`);
    // Lógica fictícia de cálculo baseada em tabela imaginária do Itamaraty
    const valorBase = 2000;
    const valorKm = 1.5;
    const total = valorBase + (distancia_km * valorKm);
    
    return {
      distancia: `${distancia_km} km`,
      valor_estimado_brl: total.toFixed(2),
      moeda: 'BRL',
      obs: 'Valor sujeito a tabelas oficiais do MRE vigentes na data da viagem.'
    };
  },

  consultar_legislacao: ({ tema }: { tema: string }) => {
    console.log(`[System] Consultando legislação: ${tema}`);
    const temaNormalizado = tema.toLowerCase();
    
    // Simulação de busca textual na lei (Lei 11.440/2006)
    const baseLegislacao: Record<string, string> = {
      'promoção': 'Art. 15. A promoção na Carreira de Oficial de Chancelaria obedecerá aos critérios de antiguidade e merecimento, alternadamente, conforme regulamento.',
      'remuneração': 'Art. 38. A remuneração dos servidores do SEB é constituída pelo Vencimento Básico e gratificações específicas (GDES).',
      'deveres': 'Art. 25. São deveres: I - lealdade às instituições; II - observância das normas legais; III - discrição sobre assuntos da repartição.',
      'remoção': 'Art. 18. A remoção é o deslocamento do servidor a pedido ou de ofício, no âmbito do quadro de pessoal, com ou sem mudança de sede.',
      'férias': 'Art. 42. O servidor servindo no exterior fará jus a 30 dias de férias anuais, podendo acumular até 2 períodos.',
      'auxílio': 'Art. 65. Será concedido auxílio-familiar aos servidores em missão permanente no exterior, para cobrir despesas com dependentes.'
    };

    const resultado = Object.entries(baseLegislacao).find(([key]) => temaNormalizado.includes(key));
    
    if (resultado) {
      return { encontrado: true, artigo: resultado[1], fonte: 'Lei 11.440/2006' };
    }
    return { encontrado: false, mensagem: 'Artigo específico não encontrado para este tema na base imediata. Recomenda-se busca no texto integral da Lei 11.440/2006.' };
  },

  obter_noticias_recentes: ({ qtd = 3 }: { qtd?: number }) => {
    console.log(`[System] Buscando ${qtd} notícias recentes da ASOF`);
    const noticias = [
      { data: '15/05/2024', titulo: 'ASOF reúne-se com Secretaria Geral para tratar de regulamentação', link: '/noticias/reuniao-sg' },
      { data: '10/05/2024', titulo: 'Novo edital de remoção publicado no Boletim de Serviço', link: '/noticias/edital-remocao' },
      { data: '02/05/2024', titulo: 'Campanha Salarial: Assembleia vota indicativo na próxima terça', link: '/noticias/assembleia' },
      { data: '28/04/2024', titulo: 'Concurso OfChan: MRE solicita 100 novas vagas ao Planejamento', link: '/noticias/concurso-2024' }
    ];
    return { noticias: noticias.slice(0, qtd) };
  }
};

// --- Configuração do Serviço ---

const getAiClient = () => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

export const initializeChat = () => {
  const ai = getAiClient();
  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: SOFIA_SYSTEM_INSTRUCTION,
      temperature: 0.5, // Reduzido para garantir precisão no uso das ferramentas
      tools: [
        {
          functionDeclarations: [
            consultarStatusRemocaoDoc,
            calcularAuxilioDeslocamentoDoc,
            consultarLegislacaoDoc,
            obterNoticiasDoc
          ]
        }
      ]
    },
  });
};

export const sendMessageStream = async function* (message: string | any[]) {
  if (!chatSession) {
    initializeChat();
  }

  if (!chatSession) {
    throw new Error("Failed to initialize chat session.");
  }

  try {
    // Inicializa o stream com a mensagem do usuário
    let currentStream = await chatSession.sendMessageStream(
      typeof message === 'string' ? { message } : message
    );

    while (true) {
      let functionCalls: any[] = [];
      let hasYieldedText = false;

      // Consumir o stream atual
      for await (const chunk of currentStream) {
        const c = chunk as GenerateContentResponse;
        
        // Se houver texto, envia para a UI
        if (c.text) {
          hasYieldedText = true;
          yield c.text;
        }

        // Coleta chamadas de função, se houver
        if (c.functionCalls && c.functionCalls.length > 0) {
          functionCalls.push(...c.functionCalls);
        }
      }

      // Se não houve chamadas de função, terminamos este turno
      if (functionCalls.length === 0) {
        break;
      }

      // Se houve chamadas de função, executamos e enviamos de volta ao modelo
      const functionResponses = await Promise.all(functionCalls.map(async (call) => {
        const fn = functionsMap[call.name];
        let result = { error: 'Function not found' };
        
        if (fn) {
          try {
            result = fn(call.args);
          } catch (e: any) {
            result = { error: e.message };
          }
        }

        // Formato exigido pelo SDK para resposta de ferramenta
        return {
          functionResponse: {
            name: call.name,
            response: { result: result },
            id: call.id // Importante para correlacionar se houver ID (depende da versão da API, mas bom manter)
          }
        };
      }));

      // Envia os resultados das funções de volta para o modelo gerar a resposta final (em texto)
      // O loop 'while' continuará para processar a resposta textual baseada nestes dados
      currentStream = await chatSession.sendMessageStream(functionResponses);
    }

  } catch (error) {
    console.error("Error in geminiService:", error);
    throw error;
  }
};

export const resetChat = () => {
  chatSession = null;
  initializeChat();
};