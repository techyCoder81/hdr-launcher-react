import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Page } from 'renderer/operations/stage_config';
import { Stage } from 'renderer/operations/stage_info';

interface StageConfigContextType {
  initialized: boolean;
  setInitialized: (enabled: boolean) => void;
  stages: Stage[];
  setStages: (stages: Stage[]) => void;
  hoveredStage: Stage | null;
  setHoveredStage: (stage: Stage | null) => void;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  pages: Page[];
  setPages: (pages: Page[]) => void;
  addPage: (page?: Page) => void;
  setPage: (idx: number, page: Page) => void;
  removePage: (idx: number) => void;
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
  const [stages, setStages] = useState<Stage[]>([]);
  const [hoveredStage, setHoveredStage] = useState(null as Stage | null);
  const [enabled, setEnabled] = useState<boolean>(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);

  const addPage = useCallback((page?: Page) => {
    const newPages = [...pages]
    newPages.push(page ?? {
      name: "Page " + (newPages.length + 1),
      useOfficial: false,
      starters: [],
      counterpicks: []
    })
    setPages(newPages);
    setCurrentPage(newPages.length - 1);
  },
  [initialized, pages, setPages, currentPage, setCurrentPage])

  const removePage = useCallback((idx: number) => {
    const newPages = [...pages]
    newPages.splice(idx, 1);
    if (newPages.length <= 0) {
      return;
    }
    setPages(newPages);

    let newCurrentPage = currentPage;
    if (idx <= currentPage) {
      newCurrentPage = currentPage - 1;
    }
    if (newCurrentPage < 0) {
      newCurrentPage = 0;
    }
    if (newCurrentPage >= newPages.length) {
      newCurrentPage = newPages.length - 1;
    }
    setCurrentPage(newCurrentPage);
  },
  [initialized, pages, setPages, currentPage, setCurrentPage])

  const setPage = useCallback((idx: number, page: Page) => {
    const newPages = [...pages]
    newPages[idx] = page;
    setPages(newPages);
  },
  [initialized, pages, setPages, currentPage, setCurrentPage])

  const value: StageConfigContextType = {
    initialized,
    setInitialized,
    stages,
    setStages,
    hoveredStage,
    setHoveredStage,
    enabled,
    setEnabled,
    pages,
    setPages,
    addPage,
    setPage,
    removePage,
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
