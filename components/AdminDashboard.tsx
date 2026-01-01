import React, { useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { 
  Save, Upload, User, FileText, Settings, Shield, 
  Trash2, ArrowLeft, CheckCircle, Info, Cpu, Zap,
  Globe, Terminal
} from 'lucide-react';
import { Button } from './ui/Button';

interface AdminDashboardProps {
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const { config, updateConfig, addKnowledgeFile, removeKnowledgeFile } = useConfig();
  
  const [instruction, setInstruction] = useState(config.systemInstruction);
  const [botName, setBotName] = useState(config.botName);
  const [modelName, setModelName] = useState(config.modelName);
  const [activeTab, setActiveTab] = useState<'prompts' | 'knowledge' | 'settings'>('prompts');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      updateConfig({ 
        systemInstruction: instruction,
        botName: botName,
        modelName: modelName
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
      <div className="bg-primary text-white p-4 flex items-center justify-between border-b border-primary-light">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10" aria-label="Voltar">
            <ArrowLeft size={20} />
          </Button>
          <div className="flex items-center gap-3">
             <Shield className="text-accent" size={24} />
             <h2 className="font-serif font-bold text-xl tracking-tight">Painel de Controle Sofia</h2>
          </div>
        </div>
        <Button 
          onClick={handleSave} 
          variant="accent" 
          size="md" 
          isLoading={isSaving}
          className="shadow-none min-h-0 h-11 px-6"
        >
          <Save size={16} className="mr-2" /> Salvar Alterações
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-4 gap-2">
          {[
            { id: 'prompts', icon: Terminal, label: 'Persona e Prompts' },
            { id: 'knowledge', icon: Globe, label: 'Base de Conhecimento' },
            { id: 'settings', icon: Settings, label: 'Inteligência e Visuais' }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-3 p-4 rounded-sm text-sm transition-all min-h-[48px] ${activeTab === item.id ? 'bg-neutral text-primary font-bold shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </aside>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto bg-slate-50 scrollbar-thin">
          <div className="max-w-4xl mx-auto">
            
            {/* Mobile Tab Navigation */}
            <div className="md:hidden flex space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
               {['prompts', 'knowledge', 'settings'].map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={`whitespace-nowrap px-5 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all min-h-[44px] ${activeTab === tab ? 'bg-primary text-white border-primary' : 'bg-white text-slate-500 border-slate-200'}`}
                 >
                   {tab === 'prompts' ? 'Persona' : tab === 'knowledge' ? 'Dados' : 'IA'}
                 </button>
               ))}
            </div>

            {activeTab === 'prompts' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Instruções do Sistema</h3>
                    <div className="bg-accent/20 text-primary-light text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">IA Experimental</div>
                  </div>
                  <p className="text-slate-500 mb-6 text-sm leading-relaxed max-w-2xl">
                    Defina como a Sofia deve se comportar. O sistema utiliza os modelos da série Gemini 3 para processar estas instruções.
                  </p>
                  
                  <textarea
                    className="w-full h-[500px] p-6 border border-slate-200 rounded-sm shadow-inner focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all font-mono text-sm leading-relaxed bg-white text-slate-700"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    spellCheck={false}
                  />
                </div>
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Repositório de Dados</h3>
                  <p className="text-slate-500 mb-8 text-sm max-w-2xl">
                    A Sofia usará o contexto expandido para processar estes documentos durante a conversação.
                  </p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1">
                      <label htmlFor="file-upload" className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-sm p-8 text-center hover:bg-white hover:border-accent hover:shadow-xl transition-all cursor-pointer bg-slate-100 group min-h-[250px]">
                        <Upload className="h-6 w-6 text-slate-400 group-hover:text-accent mb-4" />
                        <p className="text-sm text-slate-700 font-bold mb-1 text-center">Arraste ou clique para upload</p>
                        <input type="file" className="hidden" id="file-upload" multiple onChange={handleFileUpload} />
                      </label>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                      {config.knowledgeBaseFiles.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-sm p-12 text-center shadow-sm text-slate-400 italic">
                          Nenhum arquivo indexado no momento.
                        </div>
                      ) : (
                        config.knowledgeBaseFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-sm shadow-sm">
                            <div className="flex items-center gap-3">
                              <FileText size={18} className="text-primary/40" />
                              <span className="text-sm font-semibold text-slate-700">{file.name}</span>
                            </div>
                            <Button variant="danger" size="icon" onClick={() => removeKnowledgeFile(idx)} className="border-none bg-transparent hover:bg-red-50">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Cérebro e Identidade</h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Nome do Chatbot</label>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary rounded-sm flex items-center justify-center text-accent shadow-lg shadow-primary/20">
                        <User size={28} />
                      </div>
                      <input
                        type="text"
                        value={botName}
                        onChange={(e) => setBotName(e.target.value)}
                        className="flex-1 p-4 border border-slate-200 rounded-sm focus:ring-4 focus:ring-accent/10 focus:border-accent transition-all font-semibold"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-sm border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Cpu size={20} className="text-primary" />
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest">Motor de Inteligência</label>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { id: 'gemini-3-flash-preview', icon: Zap, title: 'Flash (Agilidade)', desc: 'Instantâneo e eficiente. Perfeito para FAQs.' },
                        { id: 'gemini-3-pro-preview', icon: Cpu, title: 'Pro (Raciocínio)', desc: 'Diplomacia e lógica complexa. Recomendado para leis.' }
                      ].map((model) => (
                        <button 
                          key={model.id}
                          onClick={() => setModelName(model.id)}
                          className={`flex flex-col p-5 rounded-sm border-2 transition-all text-left group min-h-[140px] ${modelName === model.id ? 'border-accent bg-accent/5 ring-4 ring-accent/5' : 'border-slate-100 hover:border-slate-200'}`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <model.icon size={20} className={modelName === model.id ? 'text-accent' : 'text-slate-400'} />
                            <span className="font-bold text-slate-800">{model.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed mb-4">{model.desc}</p>
                          <div className="mt-auto pt-2 border-t border-slate-200/50">
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{model.id.includes('flash') ? 'Latência Baixa' : 'Alta Precisão'}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};