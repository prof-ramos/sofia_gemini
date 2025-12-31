# Sofia - Assistente Virtual ASOF

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![React](https://img.shields.io/badge/React-19-blue)
![AI](https://img.shields.io/badge/Powered_by-Google_Gemini-orange)

A **Sofia** é a Assistente Virtual oficial da **Associação Nacional dos Oficiais de Chancelaria (ASOF)**. Desenvolvida como uma *Single Page Application* (SPA), ela utiliza a Inteligência Artificial do Google (Gemini 3 Pro) para auxiliar servidores do Itamaraty com dúvidas sobre legislação, processos de remoção e benefícios.

## 📋 Funcionalidades

O sistema combina a capacidade conversacional de um LLM com ferramentas específicas (Function Calling) para fornecer respostas precisas:

* **💬 Chat Interativo:** Interface amigável com suporte a *streaming* de texto e renderização de Markdown (tabelas, listas e links).
* **⚖️ Consulta à Legislação:** Busca artigos específicos na Lei 11.440/2006 (Regime Jurídico do SEB).
* **🌍 Status de Remoção:** Consulta (simulada) do status do processo de remoção do servidor e seu posto de destino.
* **💰 Calculadora de Auxílio:** Estimativa de valores de auxílio deslocamento baseada na distância entre sedes.
* **📰 Notícias ASOF:** Recuperação das últimas notícias e comunicados da associação.

## 🚀 Tecnologias Utilizadas

* **Frontend:** [React 19](https://react.dev/)
* **Build Tool:** [Vite](https://vitejs.dev/)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Ícones:** [Lucide React](https://lucide.dev/)
* **IA & SDK:** [Google GenAI SDK](https://www.npmjs.com/package/@google/genai) (`gemini-3-pro-preview`)

## 📂 Estrutura do Projeto

```text
/
├── components/         # Componentes React (ChatInterface, MessageBubble, etc.)
├── services/           # Integração com API do Gemini e definição das Ferramentas
├── constants.ts        # Prompts do sistema (System Instructions) e configurações
├── types.ts            # Definições de tipagem TypeScript (Interfaces de Mensagem)
├── App.tsx             # Componente raiz e Layout
└── vite.config.ts      # Configuração do Vite e variáveis de ambiente
