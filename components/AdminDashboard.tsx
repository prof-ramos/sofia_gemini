import React, { useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { 
  Save, Upload, User, FileText, Settings, Shield, 
  Trash2, ArrowLeft, CheckCircle, Info 
} from 'lucide-react';
import { Button } from './ui/Button';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { config, updateConfig, addKnowledgeFile, removeKnowledgeFile } = useConfig();
  
  const [instruction, setInstruction] = useState(config.systemInstruction);
  const [botName, setBotName] = useState(config.botName);
  const [activeTab, setActiveTab] = useState<'prompts' | 'knowledge' | 'settings'>('prompts');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simula salvamento
    setTimeout(() => {
      updateConfig({ 
        systemInstruction: instruction,
        botName: botName
      });
      setIsSaving(false);
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => addKnowledgeFile(file));
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 fade-in overflow-hidden">
      {/* Top Header do Admin */}
      <div className="bg-primary text-white p-4 flex items-center justify-between border-b border-primary-light">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10" aria-label="Voltar">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
             <Shield className="text-accent" size={24} />
             <h2 className="font-serif font-bold text-xl tracking-tight">Painel de Controle ASOF</h2>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          variant="accent" 
          size="md" 
          isLoading={isSaving}
          className="shadow-none min-h-0 py-2 h-10"
        >
          <Save size={16} className="mr-2" /> Salvar
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Local */}
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-4 gap-2">
          <button 
            onClick={() => setActiveTab('prompts')}
            className={`flex items-center gap-3 p-3 rounded-md text-sm transition-all ${activeTab === 'prompts' ? 'bg-neutral text-primary font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <FileText size={18} /> Gerenciar Prompts
          </button>
          
          <button 
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center gap-3 p-3 rounded-md text-sm transition-all ${activeTab === 'knowledge' ? 'bg-neutral text-primary font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Upload size={18} /> Base de Conhecimento
          </button>
          
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 p-3 rounded-md text-sm transition-all ${activeTab === 'settings' ? 'bg-neutral text-primary font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Settings size={18} /> Aparência e Atributos
          </button>
        </aside>

        {/* Área de Conteúdo */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-slate-50 scrollbar-thin">
          <div className="max-w-4xl mx-auto">
            
            {/* Título de Seção Mobile */}
            <div className="md:hidden flex overflow-x-auto gap-2 mb-6 pb-2 no-scrollbar">
               {['prompts', 'knowledge', 'settings'].map((tab) => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all ${activeTab === tab ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 border-slate-200'}`}
                 >
                   {tab === 'prompts' ? 'Persona' : tab === 'knowledge' ? 'Arquivos' : 'Visuais'}
                 </button>
               ))}
            </div>

            {/* TAB: PROMPTS */}
            {activeTab === 'prompts' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Persona da Sofia</h3>
                    <div className="bg-accent/20 text-primary-light text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">IA Experimental</div>
                  </div>
                  <p className="text-slate-500 mb-6 text-sm leading-relaxed max-w-2xl">
                    Configure as diretrizes de comportamento, o tom de voz diplomático e as regras éticas que a Sofia deve seguir ao interagir com Oficiais de Chancelaria.
                  </p>
                  
                  <div className="relative group">
                    <textarea
                      className="w-full h-[500px] p-6 border border-slate-200 rounded-xl shadow-sm focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all font-mono text-sm leading-relaxed bg-white text-slate-700"
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      placeholder="Instruções do sistema aqui..."
                    />
                    <div className="absolute top-4 right-4 text-slate-300 pointer-events-none group-focus-within:opacity-0 transition-opacity">
                      <FileText size={24} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: KNOWLEDGE BASE */}
            {activeTab === 'knowledge' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Base de Referência (RAG)</h3>
                  <p className="text-slate-500 mb-8 text-sm max-w-2xl">
                    Suba documentos oficiais, cartilhas da ASOF ou decretos do MRE. A Sofia consultará estes arquivos antes de responder ao usuário para garantir precisão técnica.
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Upload Area */}
                    <div className="lg:col-span-1">
                      <label 
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:bg-white hover:border-accent hover:shadow-xl transition-all cursor-pointer bg-slate-100 group h-64"
                      >
                        <div className="p-4 bg-white rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="h-6 w-6 text-slate-400 group-hover:text-accent" />
                        </div>
                        <p className="text-sm text-slate-700 font-bold mb-1">Upload de Arquivos</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">PDF, DOCX, TXT</p>
                        <input 
                          type="file" 
                          className="hidden" 
                          id="file-upload" 
                          multiple
                          onChange={handleFileUpload}
                        />
                      </label>
                    </div>

                    {/* File List */}
                    <div className="lg:col-span-2 space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-slate-700 uppercase tracking-widest text-[11px]">Arquivos em Contexto ({config.knowledgeBaseFiles.length})</h4>
                        {config.knowledgeBaseFiles.length > 0 && <span className="text-[10px] text-green-600 font-bold flex items-center gap-1"><CheckCircle size={10}/> Indexação OK</span>}
                      </div>

                      {config.knowledgeBaseFiles.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
                           <Info className="mx-auto text-slate-300 mb-3" size={32} />
                           <p className="text-slate-400 text-sm italic">Nenhuma fonte de dados extra foi carregada.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-2">
                          {config.knowledgeBaseFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm group hover:border-red-200 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-neutral rounded-md text-primary">
                                  <FileText size={16} />
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-slate-700">{file.name}</span>
                                  <span className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB • Pronto para RAG</span>
                                </div>
                              </div>
                              <Button 
                                variant="danger" 
                                size="icon" 
                                onClick={() => removeKnowledgeFile(idx)}
                                className="min-h-0 min-w-0 p-2 border-none bg-transparent hover:bg-red-50"
                                aria-label="Remover arquivo"
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Atributos Visuais</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Nome de Exibição</label>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-accent shadow-lg shadow-primary/20">
                        <User size={28} />
                      </div>
                      <input
                        type="text"
                        value={botName}
                        onChange={(e) => setBotName(e.target.value)}
                        className="flex-1 p-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all font-semibold"
                        placeholder="Ex: Sofia"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Segurança da API</label>
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <span className="text-xs font-mono text-slate-400">process.env.API_KEY</span>
                       <span className="bg-green-100 text-green-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">Ativo</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2">As chaves de API são gerenciadas via variáveis de ambiente para máxima segurança.</p>
                  </div>
                </div>

                <div className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
                   <h4 className="font-serif font-bold text-lg text-primary mb-2">Dica de Produtividade</h4>
                   <p className="text-sm text-primary-light opacity-80 leading-relaxed">
                     A Sofia funciona melhor quando suas instruções são divididas em "Persona", "Regras" e "Restrições". Tente manter a instrução do sistema abaixo de 4.000 tokens para garantir respostas rápidas.
                   </p>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};
