# Sofia - Chatbot ASOF (Associação Nacional dos Oficiais de Chancelaria)

## Project Overview

Sofia is a Single Page Application (SPA) designed as a virtual assistant for the ASOF (Associação Nacional dos Oficiais de Chancelaria). It leverages Google's Gemini AI to provide intelligent responses combined with specific domain knowledge about the Brazilian Foreign Service (MRE) using Function Calling tools.

The application is built with React 19, TypeScript, and Vite, featuring a "Diplomatic" design system implemented with Tailwind CSS.

## Tech Stack

*   **Frontend Framework:** React 19
*   **Build Tool:** Vite
*   **Language:** TypeScript
*   **AI Integration:** `@google/genai` SDK (Google Gemini 3 Pro Preview)
*   **Styling:** Tailwind CSS (via CDN) with custom configuration
*   **Icons:** Lucide React
*   **Deployment:** Vercel

## Getting Started

### Prerequisites

*   Node.js (v18+)
*   Google Gemini API Key (get it [here](https://aistudio.google.com/app/apikey))

### Installation

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Configuration:**
    Create a `.env.local` file in the root directory:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
    > **⚠️ SECURITY WARNING:** Never commit `.env.local` to the repository. It contains sensitive credentials. Ensure it is listed in your `.gitignore` file.

### Running Locally

*   **Development Server:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

*   **Production Build:**
    ```bash
    npm run build
    npm run preview
    ```

## Project Architecture

### Core Components
*   **`App.tsx`**: Main entry point and layout container.
*   **`ChatInterface.tsx`**: Manages chat state, user input, and message streaming.
*   **`MessageBubble.tsx`**: Handles markdown rendering, URL detection, and message styling.
*   **`services/geminiService.ts`**: Handles all interactions with the Gemini API, including tool/function execution and retry logic.

### AI Integration (`geminiService.ts`)
The service manages a conversation history in memory (stateful) and uses the `generateContentStream` method. It implements **Function Calling** to provide specific data:
*   `consultar_status_remocao`: Checks removal status (Mocked Data).
*   `calcular_auxilio_deslocamento`: Calculates displacement aid (Simulation).
*   `consultar_legislacao`: Queries specific laws (Mocked Knowledge Base).
*   `obter_noticias_recentes`: Fetches recent ASOF news (Mocked Data).

### Styling
Tailwind CSS is loaded via CDN in `index.html` to allow for rapid prototyping without a complex build step for CSS. The configuration (colors, fonts) is defined directly in the `<script>` tag within `index.html`.

> **⚠️ PRODUCTION WARNING:** Using Tailwind via CDN is not recommended for production. It results in larger file sizes (no tree-shaking) and runtime configuration overhead. For a production deployment, please install Tailwind via `npm`, configure `postcss`, and use the standard build process.

## Development Conventions

*   **Linting & Formatting:** The project uses ESLint and Prettier.
    ```bash
    npm run lint
    npm run format
    ```
*   **State Management:** React Context (`ConfigContext`) and local state. No external state management libraries (Redux/Zustand) are currently used.
*   **Icons:** Use `lucide-react` components for all iconography.

## Deployment

The project is optimized for deployment on **Vercel**.
Refer to `DEPLOYMENT.md` for detailed instructions on headers, security, and environment variable configuration.
