# Arquitetura do Sistema: Sofia - Chatbot ASOF

Este documento descreve a arquitetura técnica, os fluxos de dados e as decisões de design do chatbot Sofia, desenvolvido para a Associação Nacional dos Oficiais de Chancelaria (ASOF).

## 1. Visão Geral de Alto Nível

A Sofia é uma aplicação web "Single Page Application" (SPA) baseada em React, integrada ao modelo de linguagem de grande escala (LLM) da Google através da SDK **@google/genai**. 

O sistema foi projetado para atuar como uma interface de conversação inteligente que combina o conhecimento generalista da IA com dados específicos da carreira de Oficial de Chancelaria e legislação do Serviço Exterior Brasileiro (MRE), utilizando a técnica de **Function Calling** (Ferramentas) para estender as capacidades do modelo para além do seu treinamento base.

### Stack Tecnológica:
- **Frontend**: React 19 (Hooks, Context, Streaming).
- **IA**: Google Gemini 3 Pro Preview.
- **Estilização**: Tailwind CSS (Design System customizado para ASOF).
- **Ícones**: Lucide React.
- **Comunicação**: Streams de leitura assíncronos para baixa latência percebida.

---

## 2. Interações de Componentes

O sistema segue um modelo de componentes modularizado:

- **`App.tsx`**: Ponto de entrada que estabelece o layout principal e o container de contenção.
- **`Header.tsx`**: Componente estatístico que reforça a identidade visual da ASOF.
- **`WelcomeScreen.tsx`**: Interface inicial de engajamento que apresenta "Sugestões de Perguntas" para orientar o usuário.
- **`ChatInterface.tsx`**: O cérebro da interface. Gerencia o estado das mensagens (`messages`), o estado de carregamento (`isLoading`) e coordena a comunicação com o serviço de IA.
- **`MessageBubble.tsx`**: Componente de apresentação complexo. Responsável por:
    - Interpretação de Markdown (Listas, Negritos, Tabelas).
    - Detecção dinâmica de URLs.
    - Gerenciamento de interações (Copiar, Compartilhar).
- **`geminiService.ts`**: Camada de infraestrutura que abstrai a complexidade da API Gemini e implementa a lógica de execução de ferramentas locais.

---

## 3. Diagramas de Fluxo de Dados

### Fluxo de Mensagem (Conversa Padrão):
1. **Input**: O usuário digita no `ChatInterface`.
2. **Action**: `executeSendMessage` é chamado, atualizando o estado local e iniciando `sendMessageStream`.
3. **Stream**: O `geminiService` envia o prompt para a API Google.
4. **Chunking**: A API retorna pedaços (chunks) de texto.
5. **Update**: O `ChatInterface` itera sobre o stream e atualiza o estado da mensagem da Sofia em tempo real.

### Fluxo de Execução de Ferramentas (Function Calling):
1. **Intenção**: O modelo detecta que a pergunta do usuário requer dados específicos (ex: "Qual meu status de remoção?").
2. **Call**: O Gemini retorna uma `FunctionCall` em vez de texto.
3. **Execution**: O `geminiService` intercepta a chamada, executa a função local correspondente (simulada ou real) e obtém o resultado.
4. **Resubmission**: O resultado da função é enviado de volta ao Gemini.
5. **Final Text**: O Gemini gera uma resposta em linguagem natural baseada nos dados retornados pela ferramenta.

---

## 4. Decisões de Design e Justificativa

### 4.1. Design System "Diplomático"
- **Paleta de Cores**: Uso de azul marinho profundo (`#040920`) e acentos em azul claro (`#82b4d6`). A escolha visa transmitir seriedade, segurança e institucionalismo.
- **Tipografia**: Mix de *Inter* (Sans) para legibilidade técnica e *Playfair Display* (Serif) para títulos, remetendo à tradição diplomática.

### 4.2. Renderizador Markdown Customizado
- **Justificativa**: Em vez de usar bibliotecas pesadas de Markdown, implementamos um parser linear em `MessageBubble.tsx`. Isso permite:
    - Estilização de tabelas com cores da marca.
    - Detecção de URLs com limpeza de pontuação final.
    - Performance superior e zero dependências externas extras.

### 4.3. Gerenciamento de Stream 'Auto' vs 'Smooth'
- Durante o streaming da IA, o scroll automático é 'auto' (instantâneo) para evitar que o usuário perca o foco enquanto o texto "pula". Após o término, ações de scroll voltam para 'smooth' para uma experiência mais fluida.

---

## 5. Restrições e Limitações do Sistema

### 5.1. Statelessness (Estado sem Persistência)
- O histórico de conversas é mantido apenas em memória RAM (estado do React). Atualizar a página reinicia a sessão. Isso é uma medida de privacidade deliberada para esta versão.

### 5.2. Quotas de API
- O sistema depende das cotas da chave de API fornecida. Em cenários de alta demanda, pode haver erros de `429 (Too Many Requests)`.

### 5.3. Limitações do Parser de Markdown
- O parser atual é otimizado para os padrões gerados pelo Gemini (listas, tabelas GFM, negrito). Estruturas de Markdown muito complexas (como notas de rodapé ou HTML embutido) podem não ser renderizadas perfeitamente.

### 5.4. Contexto do Modelo
- Embora o modelo suporte contextos longos, a performance de resposta pode degradar ligeiramente em conversas extremamente extensas (acima de 50 interações) devido ao processamento de tokens.