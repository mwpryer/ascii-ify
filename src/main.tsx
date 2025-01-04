import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@/index.css";
import { AppProvider } from "@/context/app-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { App } from "@/app";
import { Footer } from "@/components/footer";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <TooltipProvider>
        <SidebarProvider>
          <div className="flex w-full flex-col">
            <div className="grid flex-1 place-items-center p-1 pb-0 sm:p-2 sm:pb-0">
              <App />
            </div>
            <Footer />
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </AppProvider>
  </StrictMode>,
);
