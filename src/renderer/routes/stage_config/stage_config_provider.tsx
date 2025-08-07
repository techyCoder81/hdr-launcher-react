import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Page } from 'renderer/operations/stage_config';

interface StageConfigContextType {
  initialized: boolean;
  setInitialized: (enabled: boolean) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  pages: Page[];
  setPages: (pages: Page[]) => void;
  currentPage: number;
  setCurrentPage: (currentPage: number) => void;
}

// Create the context with undefined as default (we'll handle this in the hook)
const StageConfigContext = createContext<StageConfigContextType | undefined>(
  undefined
);

interface StageConfigProviderProps {
  children: ReactNode;
}

export const StageConfigProvider: React.FC<StageConfigProviderProps> = ({
  children,
}) => {
  const [initialized, setInitialized] = useState(false);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const value: StageConfigContextType = {
    initialized,
    setInitialized,
    enabled,
    setEnabled,
    pages,
    setPages,
    currentPage,
    setCurrentPage,
  };

  return (
    <StageConfigContext.Provider value={value}>
      {children}
    </StageConfigContext.Provider>
  );
};

// Custom hook to use the StageConfig context
export const useStageConfig = (): StageConfigContextType => {
  const context = useContext(StageConfigContext);
  if (context === undefined) {
    throw new Error('useStageConfig must be used within a StageConfigProvider');
  }
  return context;
};

export default StageConfigContext;
