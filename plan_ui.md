# Plano de Melhoria de UI/UX e Acessibilidade (Sofia)

Este plano visa corrigir violações de acessibilidade e melhorar a usabilidade da interface, com foco em semântica, alvos de toque e robustez para todos os usuários.

## Backlog Priorizado

### P0: Acessibilidade Crítica (Bloqueantes)
- [x] **Refatorar Logo do Header**
    *   **Data de Conclusão:** 05/01/2026
    *   **Arquivos:** `components/Header.tsx`
    *   **Mudança:** Conversão de `div` clicável para `<a>` semântico.
    *   **Verificação (WCAG 2.1 AA):**
        *   [x] **2.1.1 Keyboard:** Elemento recebe foco via Tab e ativa com Enter.
        *   [x] **4.1.2 Name, Role, Value:** Elemento possui role implícita de link e nome acessível via `aria-label`.
- [x] **Corrigir Tabelas no Chat**
    *   **Data de Conclusão:** 05/01/2026
    *   **Arquivos:** `components/MessageBubble.tsx`
    *   **Mudança:** Adição de `scope="col"` aos elementos `<th>`.
    *   **Verificação (WCAG 2.1 AA):**
        *   [x] **1.3.1 Info and Relationships:** Cabeçalhos de tabela associados corretamente às colunas de dados.

### P1: Usabilidade e Mobile (Alto Impacto)
- [x] **Aumentar Alvo de Toque (Admin)**
    *   **Data de Conclusão:** 05/01/2026
    *   **Arquivos:** `App.tsx`
    *   **Mudança:** Aumento do botão de configurações para `44x44px`.
    *   **Verificação (WCAG 2.1 AAA - Recomendado):**
        *   [x] **2.5.5 Target Size:** Alvo de toque atende ao mínimo de 44x44 CSS pixels.
- [x] **Padronizar Botões Pequenos**
    *   **Data de Conclusão:** 05/01/2026
    *   **Arquivos:** `components/ui/Button.tsx`
    *   **Mudança:** Atualização da variante `sm` para `min-h-[44px]`.
    *   **Verificação:**
        *   [x] **2.5.5 Target Size:** Botões pequenos agora possuem área clicável segura.
- [x] **Acessibilidade de Links Externos**
    *   **Data de Conclusão:** 05/01/2026
    *   **Arquivos:** `components/MessageBubble.tsx`
    *   **Mudança:** Adição de `aria-hidden="true"` ao ícone `ExternalLink`.
    *   **Verificação:**
        *   [x] **1.1.1 Non-text Content:** Ícones decorativos ignorados por tecnologias assistivas para reduzir verbosidade.

### P2: Refinamento e Motion (Qualidade)
- [x] **Suporte a Redução de Movimento**
    *   **Data de Conclusão:** 05/01/2026
    *   **Arquivos:** `index.html`
    *   **Mudança:** Envolvimento de animações em `@media (prefers-reduced-motion: no-preference)`.
    *   **Verificação:**
        *   [x] **2.3.3 Animation from Interactions:** Animações não essenciais desativadas quando o usuário solicita redução de movimento.
- [x] **Melhorar Contraste de Foco**
    *   **Data de Conclusão:** 05/01/2026
    *   **Arquivos:** `components/ChatInterface.tsx`
    *   **Mudança:** Aumento da espessura do anel de foco para `ring-2`.
    *   **Verificação:**
        *   [x] **2.4.7 Focus Visible:** Indicador de foco claramente visível e com bom contraste.

---

## Log de Execução

*   **Status Geral:** Concluído
*   **Última Atualização:** 05/01/2026

---

## Próximas Fases (Roadmap)

1.  **Auditoria Automatizada de Acessibilidade (CI/CD)**
    *   **Responsável:** Time de DevOps / QA
    *   **Prazo Previsto:** Q1 2026
    *   **Ação:** Integrar `axe-core` ou `pa11y` no pipeline de build para prevenir regressões.

2.  **Testes com Leitores de Tela Reais**
    *   **Responsável:** Time de UX / Acessibilidade
    *   **Prazo Previsto:** Q1 2026
    *   **Ação:** Validar fluxos críticos com NVDA (Windows) e VoiceOver (macOS/iOS).

3.  **Suporte a Alto Contraste (High Contrast Mode)**
    *   **Responsável:** Time de Frontend
    *   **Prazo Previsto:** Q2 2026
    *   **Ação:** Verificar e ajustar cores para garantir visibilidade em modo de alto contraste do sistema operacional.