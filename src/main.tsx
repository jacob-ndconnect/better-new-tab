import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { HotkeysProvider } from "@tanstack/react-hotkeys"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <HotkeysProvider>
        <App />
      </HotkeysProvider>
    </ThemeProvider>
  </StrictMode>
)
