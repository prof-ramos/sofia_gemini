# Sofia - Assistente Virtual ASOF

![Status](https://img.shields.io/badge/Status-Em_Desenvolvimento-yellow)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-6.0-purple)
![Gemini](https://img.shields.io/badge/AI-Google_Gemini-orange)
![License](https://img.shields.io/badge/License-Private-red)

> **Sofia** é a interface de inteligência artificial oficial da Associação Nacional dos Oficiais de Chancelaria, projetada para auxiliar servidores com legislação, processos de remoção e cálculos de benefícios em tempo real.

---

## 📖 Descrição

A **Sofia** é uma Single Page Application (SPA) moderna que integra o modelo **Google Gemini 1.5 Pro** com dados específicos do Serviço Exterior Brasileiro. Diferente de um chatbot genérico, a Sofia possui acesso a ferramentas ("Function Calling") que permitem consultar dados simulados do MRE, calcular benefícios financeiros e citar legislação específica (Lei 11.440/2006).

### Principais Diferenciais
*   **Contexto Especializado:** Treinada (via System Instructions) para atuar como uma consultora diplomática.
*   **Ferramentas Ativas:** Capacidade de executar funções lógicas para buscar dados precisos.
*   **Design Diplomático:** Interface sóbria e institucional, utilizando Tailwind CSS.
*   **Respostas em Streaming:** Baixa latência percebida com respostas geradas token a token.

---

## 📑 Índice

- [Instalação](#-instalação)
- [Uso Rápido](#-uso-rápido)
- [Funcionalidades e Ferramentas (API)](#-funcionalidades-e-ferramentas-api)
- [Configuração](#-configuração)
- [Desenvolvimento](#-desenvolvimento)
- [Deploy](#-deploy)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 📦 Instalação

### Pré-requisitos
*   **Node.js** (versão 18 ou superior)
*   **Chave de API do Google Gemini** (Obtenha no [Google AI Studio](https://aistudio.google.com/))

### Passo a Passo

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/[ORG_NAME]/sofia-asof.git
    cd sofia-asof
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure o ambiente:**
    Copie o arquivo de exemplo e adicione sua chave.
    ```bash
    cp .env.example .env.local
    ```
    Edite o arquivo `.env.local`:
    ```env
    GEMINI_API_KEY=sua_chave_comeca_com_AIza...
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

---

## 🚀 Uso Rápido

Após iniciar a aplicação, acesse `http://localhost:3000`. Você verá a tela de boas-vindas da Sofia.

**Exemplos de perguntas suportadas:**

*   *"Qual é o status do processo de remoção da matrícula 12345?"*
*   *"Calcule o auxílio deslocamento para uma distância de 5000 km."*
*   *"O que a lei diz sobre a promoção de Oficiais de Chancelaria?"*
*   *"Quais são as últimas notícias da ASOF?"*

A IA identificará a intenção, executará a ferramenta correspondente e responderá em linguagem natural.

---

## 🛠 Funcionalidades e Ferramentas (API)

A inteligência da Sofia é expandida através de **Function Calling**. Abaixo estão as ferramentas disponíveis que o modelo pode invocar:

### 1. `consultar_status_remocao`
Verifica o andamento de processos de remoção.
*   **Parâmetros:** `matricula` (string)
*   **Retorno:** Status, destino e data prevista.
*   *Nota: Atualmente utiliza dados mockados.*

### 2. `calcular_auxilio_deslocamento`
Realiza a estimativa financeira baseada na distância.
*   **Parâmetros:** `distancia_km` (number)
*   **Retorno:** Valor estimado em BRL.
*   **Lógica:** Base fixa + (Km * fator multiplicador).

### 3. `consultar_legislacao`
Busca artigos específicos na Lei 11.440/2006.
*   **Parâmetros:** `tema` (string - ex: "promoção", "remuneração")
*   **Retorno:** Trecho da lei correspondente.

### 4. `obter_noticias_recentes`
Lista as últimas comunicações oficiais.
*   **Parâmetros:** `qtd` (number - default: 3)
*   **Retorno:** Lista de títulos e links.

---

## ⚙️ Configuração

As configurações principais residem no arquivo `constants.ts` e nas variáveis de ambiente.

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `GEMINI_API_KEY` | Chave de autenticação da Google AI | Sim |

---

## 💻 Desenvolvimento

### Comandos Disponíveis

*   **`npm run dev`**: Inicia servidor local (Vite).
*   **`npm run build`**: Compila para produção (TypeScript + Vite).
*   **`npm run preview`**: Visualiza a build de produção localmente.
*   **`npm run lint`**: Verifica problemas no código (ESLint).
*   **`npm run format`**: Formata o código (Prettier).

### Estrutura de Pastas Relevante

```
/src
  ├── components/      # Componentes React (Chat, Bubble, UI)
  ├── services/        # Integração com API (geminiService.ts)
  ├── contexts/        # Gerenciamento de estado global
  ├── constants.ts     # Configurações do modelo e prompts
  └── types.ts         # Definições de tipos TypeScript
```

---

## ☁️ Deploy

O projeto está otimizado para deploy na **Vercel**.

1.  Faça o push para seu repositório Git.
2.  Importe o projeto na Vercel.
3.  Nas configurações do projeto na Vercel, adicione a variável de ambiente `GEMINI_API_KEY`.
4.  O preset de build `Vite` será detectado automaticamente.

Consulte o arquivo `DEPLOYMENT.md` para detalhes sobre headers de segurança e otimizações.

---

## 🗺 Roadmap

- [ ] **Persistência:** Implementar histórico de chat (Local Storage ou Banco de Dados).
- [ ] **Autenticação:** Login exclusivo para associados ASOF.
- [ ] **Base de Conhecimento RAG:** Indexar todos os boletins e portarias do MRE para busca semântica.
- [ ] **Upload de Documentos:** Permitir que o usuário envie PDFs para análise da Sofia.

---

## 🤝 Contribuindo

Contribuições são bem-vindas, especialmente para aprimorar os prompts do sistema e a precisão das ferramentas.

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/NovaFeature`).
3.  Commit suas mudanças (`git commit -m 'Adiciona NovaFeature'`).
4.  Push para a Branch (`git push origin feature/NovaFeature`).
5.  Abra um Pull Request.

---

## 📄 Licença

Este projeto é de uso privado e proprietário da **Associação Nacional dos Oficiais de Chancelaria (ASOF)**.

---

## 📞 Suporte

Para suporte técnico ou dúvidas sobre as respostas da IA:

*   **Responsável Técnico:** Gabriel Ramos
*   **Canal ASOF:** contato@asof.org.br
