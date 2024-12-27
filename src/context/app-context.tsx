import React, { createContext, useState } from "react";

import { AsciiConfig, DEFAULT_ASCII_CONFIG } from "@/lib/ascii";

type DisplayType = "webcam" | "upload";

type AppContextType = {
  display: DisplayType;
  setDisplay: React.Dispatch<React.SetStateAction<DisplayType>>;
  config: AsciiConfig;
  updateConfig: (newConfig: Partial<AsciiConfig>) => void;
  isConfigOpen: boolean;
  setIsConfigOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [display, setDisplay] = useState<DisplayType>("webcam");
  const [config, setConfig] = useState(DEFAULT_ASCII_CONFIG);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  function updateConfig(newConfig: Partial<AsciiConfig>) {
    setConfig((prevConfig) => ({ ...prevConfig, ...newConfig }));
  }

  const value = {
    display,
    setDisplay,
    config,
    updateConfig,
    isConfigOpen,
    setIsConfigOpen,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = React.useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
}
