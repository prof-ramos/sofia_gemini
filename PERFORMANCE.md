# Relatório de Análise de Performance - Sofia ASOF

## Resumo Executivo
A aplicação demonstra uma arquitetura SPA React moderna com boas práticas iniciais (uso de streams, lazy loading de componentes pesados não detectado mas arquitetura permite). O principal gargalo potencial reside no gerenciamento de estado do chat (`ChatInterface.tsx` e `MessageBubble.tsx`) e na renderização de listas longas.

---

## 1. Algorithmic Complexity & Rendering Performance

### 🔴 Critical Issues
**1. Renderização de Markdown em `MessageBubble.tsx` (Re-cálculo Excessivo)**
*   **Problema:** A função `parseInline` e a lógica de formatação (`formattedContent`) são executadas a cada renderização do componente `MessageBubble`. Embora use `useMemo`, a dependência é `message.text`. Durante o streaming, `message.text` muda a cada chunk (milisegundos), forçando o `formattedContent` a re-executar todo o parsing de regex e reconstrução da árvore React para *toda* a mensagem, não apenas o novo pedaço.
*   **Complexidade:** O2 (quadrática no pior caso de regex complexo) ou O(N) repetido M vezes (onde M é o número de chunks).
*   **Impacto:** Travamentos de UI (jank) durante respostas longas da IA em dispositivos móveis.
*   **Otimização:**
    *   Implementar um parser incremental ou memoizar partes já processadas.
    *   Para uma solução rápida: Usar `React.memo` no componente `MessageBubble` com uma comparação customizada que evite re-renderizar mensagens antigas (histórico) quando apenas a última mensagem está mudando.

### 🟡 High Priority
**2. Lista de Mensagens sem Virtualização em `ChatInterface.tsx`**
*   **Problema:** O chat renderiza todas as mensagens do histórico na DOM.
*   **Impacto:** Se a conversa ficar longa (50+ mensagens), a quantidade de nós DOM crescerá linearmente, afetando a memória e a performance de scroll/repaint.
*   **Otimização:** Implementar "Virtual Scrolling" (ex: `react-window` ou `react-virtuoso`). Isso manteria apenas as mensagens visíveis na DOM.

## 2. Memory Management

### 🟡 High Priority
**1. Crescimento do Histórico no `geminiService.ts`**
*   **Problema:** A variável `conversationHistory` é um array global que cresce indefinidamente.
    ```typescript
    let conversationHistory: HistoryEntry[] = [];
    ```
*   **Impacto:** Vazamento de memória em sessões longas (SPA não recarrega). O contexto enviado para a API também cresce, aumentando o custo (tokens) e latência.
*   **Otimização:**
    *   Implementar uma estratégia de "janela deslizante" (sliding window), mantendo apenas as últimas N mensagens (ex: 20 trocas) no contexto enviado para a API, embora possa manter mais no estado visual do React.
    *   Limpar o histórico explicitamente ao desmontar o componente principal ou iniciar novo chat.

### 🟢 Low Priority
**1. Clonagem de Objetos em Loops**
*   **Problema:** No `geminiService.ts`:
    ```typescript
    const historySnapshot = JSON.parse(JSON.stringify(conversationHistory));
    ```
*   **Impacto:** `JSON.parse(JSON.stringify(...))` é lento e consome CPU/Memória para clonagem profunda.
*   **Otimização:** Usar `structuredClone()` (nativo e mais eficiente) ou bibliotecas de imutabilidade se o estado ficar mais complexo.

## 3. Network Performance

### 🟡 High Priority
**1. Carregamento de CSS via CDN**
*   **Problema:** Tailwind CSS sendo carregado via script CDN (`<script src="https://cdn.tailwindcss.com"></script>`).
*   **Impacto:**
    *   Arquivo JS do Tailwind é grande (~3MB não gzippado) pois contém o compilador JIT inteiro no browser.
    *   Bloqueia a renderização inicial (FCP).
    *   Nenhum tree-shaking (CSS não utilizado não é removido).
*   **Otimização:** Instalar Tailwind via PostCSS no build do Vite. Isso gerará um arquivo CSS minúsculo (<10kb) apenas com as classes usadas.

## 4. Code Patterns & React Best Practices

### 🟡 Medium Priority
**1. Dependência de Layout Effect para Scroll**
*   **Problema:** Uso de `useLayoutEffect` para scroll no `ChatInterface.tsx`.
    ```typescript
    useLayoutEffect(() => { ... scrollToBottom ... }, [messages, isLoading]);
    ```
*   **Impacto:** `useLayoutEffect` é síncrono e bloqueia a pintura do browser. Pode causar "stuttering" visual durante o streaming rápido de texto.
*   **Otimização:** Mover para `useEffect` (assíncrono) para permitir que o browser pinte o quadro antes de ajustar o scroll, ou usar `requestAnimationFrame`.

### 🟢 Low Priority
**1. Definição de Ícones Lucide**
*   **Problema:** Ícones importados individualmente.
*   **Otimização:** O tree-shaking do Vite já deve lidar bem com isso, mas garantir que não estamos importando a biblioteca inteira é uma boa prática. (O código atual parece correto: `import { Send } from 'lucide-react'`).

---

## Code Examples (Otimizações)

### Otimização 1: Virtualização de Lista (Conceito)

```tsx
// Antes: Renderiza tudo
{messages.map((msg) => (
  <MessageBubble key={msg.id} message={msg} />
))}

// Depois: React Virtuoso (Exemplo)
import { Virtuoso } from 'react-virtuoso'

<Virtuoso
  style={{ height: '100%' }}
  data={messages}
  itemContent={(index, msg) => (
    <div className="py-2"> {/* Wrapper para padding correto na virtualização */}
       <MessageBubble message={msg} />
    </div>
  )}
  followOutput={'smooth'} // Auto-scroll inteligente
/>
```

### Otimização 2: Memoização de Mensagens Antigas

```tsx
// Em MessageBubble.tsx

// Envolva o export com React.memo
export const MessageBubble = React.memo(({ message }: MessageBubbleProps) => {
  // ... implementação ...
}, (prevProps, nextProps) => {
  // Retorna true se NÃO deve renderizar
  // Só renderiza se o texto mudou (streaming) ou se é uma mensagem nova
  return prevProps.message.text === nextProps.message.text && 
         prevProps.message.isError === nextProps.message.isError;
});
```

### Otimização 3: Janela Deslizante no Service

```typescript
// Em geminiService.ts

// Limite de contexto (ex: 10 últimos turnos)
const MAX_CONTEXT_TURNS = 10;

// Ao enviar para a API:
const contextToSend = conversationHistory.slice(-MAX_CONTEXT_TURNS * 2); // *2 pois tem user+model
// Mantenha a systemInstruction sempre
```

## Conclusão
A aplicação está funcional, mas a mudança do Tailwind CDN para build time é a otimização de infraestrutura mais urgente. Para UX, a virtualização do chat e a memoização dos bubbles garantirão que a aplicação continue fluida mesmo em conversas longas.
