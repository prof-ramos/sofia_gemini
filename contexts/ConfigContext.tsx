import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SOFIA_SYSTEM_INSTRUCTION } from '../constants';

interface AppConfig {
  systemInstruction: string;
  botName: string;
  avatarUrl: string;
  knowledgeBaseFiles: File[];
}

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  addKnowledgeFile: (file: File) => void;
  removeKnowledgeFile: (index: number) => void;
}

const defaultState: AppConfig = {
  systemInstruction: SOFIA_SYSTEM_INSTRUCTION,
  botName: 'Sofia',
  avatarUrl: 'sparkles',
  knowledgeBaseFiles: []
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(defaultState);

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const addKnowledgeFile = (file: File) => {
    setConfig(prev => ({
      ...prev,
      knowledgeBaseFiles: [...prev.knowledgeBaseFiles, file]
    }));
  };

  const removeKnowledgeFile = (index: number) => {
    setConfig(prev => ({
      ...prev,
      knowledgeBaseFiles: prev.knowledgeBaseFiles.filter((_, i) => i !== index)
    }));
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, addKnowledgeFile, removeKnowledgeFile }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig must be used within a ConfigProvider');
  return context;
};
