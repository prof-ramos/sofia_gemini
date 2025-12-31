Com base nos arquivos fornecidos, compilei um arquivo `README.md` completo e profissional para o projeto. Ele aborda a configuração técnica, as funcionalidades (baseadas nos "Tools" do Gemini definidos no código) e a estrutura do projeto.

Como o projeto é explicitamente voltado para uma associação brasileira (ASOF - Serviço Exterior Brasileiro) e suas instruções de perfil exigem **Português do Brasil**, o documento foi redigido neste idioma para manter a coerência com o código fonte.

Aqui está o conteúdo sugerido para o arquivo:

```markdown
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

```

## 🛠️ Instalação e Configuração

Siga os passos abaixo para rodar o projeto localmente:

### 1. Pré-requisitos

* Node.js instalado (versão 18+ recomendada).
* Uma chave de API do Google Gemini (Google AI Studio).

### 2. Clonar e Instalar

```bash
# Clone o repositório
git clone [https://github.com/seu-usuario/sofia-chatbot-asof.git](https://github.com/seu-usuario/sofia-chatbot-asof.git)

# Entre na pasta
cd sofia-chatbot-asof

# Instale as dependências
npm install

```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto e adicione sua chave de API:

```env
GEMINI_API_KEY=sua_chave_api_aqui

```

> **Nota:** O arquivo `vite.config.ts` já está configurado para carregar esta variável e expô-la como `process.env.API_KEY`.

### 4. Executar

```bash
npm run dev

```

Acesse a aplicação em `http://localhost:3000`.

## ⚠️ Notas de Desenvolvimento

* **Mock Data:** Atualmente, as funções administrativas (como `consultar_status_remocao` e `consultar_legislacao`) operam com dados fictícios (mockados) no arquivo `services/geminiService.ts` para fins de demonstração e testes de *Function Calling*.
* **Persistência:** O chat não possui backend de persistência de histórico (banco de dados). Ao recarregar a página, a conversa é reiniciada.

## 📄 Arquitetura

Para detalhes profundos sobre as decisões de design, fluxo de dados e interações dos componentes, consulte o arquivo [ARCHITECTURE.md](https://www.google.com/search?q=./ARCHITECTURE.md).

---

Desenvolvido para a ASOF.

```

```
