import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/index.css";
import { AppProvider } from "@/context/app-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { App } from "@/app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      <SidebarProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </SidebarProvider>
    </TooltipProvider>
  </StrictMode>,
);
