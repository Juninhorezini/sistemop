import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Settings, 
  FilePlus, 
  Save, 
  Printer, 
  Trash2, 
  Edit2, 
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Loader2,
  X
} from 'lucide-react';
import googleSheetsService from './services/googleSheetsService';
import { fullSync } from './services/syncService';

/**
 * CONFIGURAÇÕES TÉCNICAS
 */
const GOOGLE_SHEETS_URL = "https://docs.google.com/spreadsheets/d/1CWw8zKMf1ww08gynis7qIAYFjaYJo3PYb8bghp35zYE/edit#gid=125558396";
const APP_ID = "op-manager-ff";

const App = () => {
  // --- Estados do App ---
  const [activeTab, setActiveTab] = useState('generator');
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [showModal, setShowModal] = useState({ type: null, data: null });

  // --- Estados de Configuração ---
  const [configItems, setConfigItems] = useState(() => {
    const saved = localStorage.getItem(`${APP_ID}_configs`);
    return saved ? JSON.parse(saved) : [
      { id: '1', name: '5000m', weightRoca: 1.42, weightCone: 0.143, supply: 'FO273' },
      { id: '2', name: '2000jds', weightRoca: 1.42, weightCone: 0.052, supply: 'FO273' },
      { id: '3', name: '150g', weightRoca: 2.8, weightCone: 0.15, supply: 'FO130' },
      { id: '4', name: '500g', weightRoca: 2.8, weightCone: 0.5, supply: 'FO130' }
    ];
  });

  // --- Estados do Gerador de OP ---
  const [currentList, setCurrentList] = useState([]);
  const [opHeader, setOpHeader] = useState({
    date: new Date().toISOString().split('T')[0],
    selectedItem: '',
    nextOpId: 1
  });

  // Refs para controle de foco dinâmico
  const inputRefs = useRef({});

  // --- Helpers (definir antes de usar em useEffect) ---
  const showAlert = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  /**
   * Sincroniza dados da Google Sheets ao abrir o app
   * Se houver dados na planilha, carrega deles. Senão, usa dados locais.
   */
  useEffect(() => {
    const initSync = async () => {
      try {
        const syncedConfigs = await fullSync();
        // Se houver dados sincronizados, recarrega as configurações
        if (syncedConfigs && syncedConfigs.length > 0) {
          setConfigItems(syncedConfigs);
          showAlert('Dados sincronizados com sucesso!', 'success');
        }
      } catch (error) {
        console.error('Erro ao sincronizar ao abrir:', error);
        // Não mostra erro, apenas usa dados locais
      }
    };

    // Executa apenas uma vez ao abrir o app
    initSync();
  }, []);

  // Salva configurações no localStorage quando muda
  useEffect(() => {
    localStorage.setItem(`${APP_ID}_configs`, JSON.stringify(configItems));
  }, [configItems]);

  // Inicializa o próximo OP ID
  useEffect(() => {
    const lastId = parseInt(localStorage.getItem(`${APP_ID}_last_id`) || '0');
    setOpHeader(prev => ({ ...prev, nextOpId: lastId + 1 }));
  }, []);

  const calculateRocas = (cones, itemId) => {
    const item = configItems.find(i => i.name === itemId);
    if (!item || !cones) return 0;
    return Math.ceil((cones * item.weightCone) / item.weightRoca);
  };

  // --- Ações ---
  const handleNewList = () => {
    if (isDirty && currentList.length > 0) {
      setShowModal({ type: 'confirm_new', data: null });
    } else {
      resetList();
    }
  };

  const resetList = () => {
    setCurrentList([]);
    setIsDirty(false);
    setOpHeader(prev => ({ 
      ...prev, 
      date: new Date().toISOString().split('T')[0],
      selectedItem: '' 
    }));
    setShowModal({ type: null, data: null });
  };

  const addOpRow = () => {
    if (!opHeader.selectedItem) {
      return showAlert("Selecione um item antes de adicionar OPs.", "error");
    }

    const newId = opHeader.nextOpId + currentList.length;
    const newRow = {
      id: newId,
      color: '',
      cones: '',
      rocas: 0,
      obs: ''
    };
    setCurrentList(prev => [...prev, newRow]);
    setIsDirty(true);

    // Timeout para focar no novo campo após renderização
    setTimeout(() => {
      const lastIdx = currentList.length;
      inputRefs.current[`color-${lastIdx}`]?.focus();
    }, 50);
  };

  const updateRow = (index, field, value) => {
    const newList = [...currentList];
    newList[index][field] = value;
    
    if (field === 'cones') {
      newList[index].rocas = calculateRocas(Number(value), opHeader.selectedItem);
      setIsDirty(true);
    }
    if (field === 'color') setIsDirty(true);
    
    setCurrentList(newList);
  };

  // Lógica de Navegação por Teclado
  const handleKeyDown = (e, index, field) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (field === 'color') {
        inputRefs.current[`cones-${index}`]?.focus();
      } else if (field === 'cones') {
        inputRefs.current[`obs-${index}`]?.focus();
      } else if (field === 'obs') {
        // Se for a última linha, adiciona uma nova. Se não, pula para a próxima cor.
        if (index === currentList.length - 1) {
          addOpRow();
        } else {
          inputRefs.current[`color-${index + 1}`]?.focus();
        }
      }
    }
  };

  const saveToSheets = async () => {
    if (currentList.length === 0) return showAlert("Adicione itens à lista primeiro.", "error");
    if (!opHeader.selectedItem) return showAlert("Selecione um Item de configuração.", "error");

    setLoading(true);
    try {
      // Find config item for weight calculation
      const selectedConfig = configItems.find(item => item.name === opHeader.selectedItem);
      const weightCone = selectedConfig ? selectedConfig.weightCone : 0;

      // Prepare all OPs data for batch save
      const opsToSave = currentList.map(row => ({
        numero: row.id,
        data: opHeader.date,
        color: row.color,
        obs: row.obs, // Adicionando observações
        itens: [
          {
            itemName: opHeader.selectedItem,
            qtdCones: Number(row.cones),
            qtdRocas: Number(row.rocas),
            pesoTotal: Number(row.cones) * weightCone
          }
        ]
      }));
      
      // Send all OPs in a single batch request
      await googleSheetsService.saveOPsBatch(opsToSave);
      
      const lastId = currentList[currentList.length - 1].id;
      localStorage.setItem(`${APP_ID}_last_id`, lastId.toString());
      setOpHeader(prev => ({ ...prev, nextOpId: lastId + 1 }));
      
      setIsDirty(false);
      showAlert("Todas as OPs foram salvas com sucesso!");
    } catch (e) {
      console.error(e);
      showAlert("Erro ao salvar dados: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const printOPs = () => window.print();

  const Modal = ({ title, children, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
          <div className="text-slate-600 mb-6">{children}</div>
          <div className="flex gap-3 justify-end">
            <button onClick={onCancel} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
            <button onClick={onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">Confirmar</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12 print:bg-white print:pb-0">
      <header className="bg-white border-b sticky top-0 z-40 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FilePlus className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-800 hidden sm:block">OP Manager <span className="text-blue-600 italic">FF</span></h1>
            </div>
            
            <nav className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('generator')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'generator' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Plus className="w-4 h-4" /> Gerador OP
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Settings className="w-4 h-4" /> Configurações
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0">
        {message && (
          <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg border animate-in slide-in-from-right duration-300 ${message.type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
            {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        {activeTab === 'generator' && (
          <div className="space-y-6 animate-in fade-in duration-500 print:space-y-0">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 print:hidden">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Item (Insumo)</label>
                  <div className="relative group">
                    <select 
                      value={opHeader.selectedItem}
                      onChange={(e) => {
                        setOpHeader({...opHeader, selectedItem: e.target.value});
                        const updated = currentList.map(row => ({
                          ...row,
                          rocas: calculateRocas(row.cones, e.target.value)
                        }));
                        setCurrentList(updated);
                        setIsDirty(true);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all"
                    >
                      <option value="">Selecione...</option>
                      {configItems.map(item => (
                        <option key={item.id} value={item.name}>{item.name} ({item.supply})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Data de Produção</label>
                  <input 
                    type="date" 
                    value={opHeader.date}
                    onChange={(e) => {setOpHeader({...opHeader, date: e.target.value}); setIsDirty(true);}}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2 flex items-end gap-3">
                  <button onClick={handleNewList} className="flex-1 bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                    <FilePlus className="w-4 h-4" /> Nova Lista
                  </button>
                  <button onClick={saveToSheets} disabled={loading} className="flex-1 bg-green-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Salvar
                  </button>
                  <button onClick={printOPs} className="bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                    <Printer className="w-4 h-4" /> Imprimir
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden print:hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nº OP</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cor</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qtd Cones</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Qtd Rocas (Ceil)</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Observações</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentList.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-blue-600 font-bold">#{row.id}</td>
                        <td className="px-6 py-4">
                          <input 
                            ref={el => inputRefs.current[`color-${idx}`] = el}
                            className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none py-1 transition-all"
                            placeholder="Cor"
                            value={row.color}
                            onChange={(e) => updateRow(idx, 'color', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'color')}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            ref={el => inputRefs.current[`cones-${idx}`] = el}
                            type="number"
                            className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none py-1 transition-all"
                            placeholder="0"
                            value={row.cones}
                            onChange={(e) => updateRow(idx, 'cones', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'cones')}
                          />
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-700">{row.rocas}</td>
                        <td className="px-6 py-4 text-sm">
                          <input 
                            ref={el => inputRefs.current[`obs-${idx}`] = el}
                            className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none py-1 transition-all"
                            placeholder="Obs..."
                            value={row.obs}
                            onChange={(e) => updateRow(idx, 'obs', e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, idx, 'obs')}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => {
                            const newList = currentList.filter((_, i) => i !== idx);
                            setCurrentList(newList);
                            setIsDirty(true);
                          }} className="text-slate-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-center">
                <button onClick={addOpRow} className="group flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 transition-all">
                  <Plus className="w-5 h-5 bg-blue-100 rounded-full p-1 group-hover:scale-110 transition-transform" />
                  ADICIONAR LINHA (OU APERTE ENTER NAS OBSERVAÇÕES)
                </button>
              </div>
            </div>

            {/* LAYOUT DE IMPRESSÃO */}
            <div className="hidden print:block print:landscape">
              {Array.from({ length: Math.ceil(currentList.length / 4) }).map((_, pageIdx) => (
                <div key={pageIdx} className="w-full h-screen grid grid-cols-2 grid-rows-2 gap-4 p-8 page-break-after-always">
                  {currentList.slice(pageIdx * 4, pageIdx * 4 + 4).map((op, i) => (
                    <div key={i} className="border-4 border-black p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start border-b-2 border-black pb-2">
                        <div>
                          <div className="text-2xl font-black uppercase">{opHeader.selectedItem || "---"}</div>
                          <div className="text-sm font-bold">Insumo: {configItems.find(it => it.name === opHeader.selectedItem)?.supply || "---"}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">Data: {opHeader.date.split('-').reverse().join('/')}</div>
                          <div className="text-xl font-black italic">Nº OP: {op.id}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="space-y-2">
                          <div className="flex items-baseline gap-2"><span className="text-lg font-bold">COR:</span><span className="text-3xl font-black underline">{op.color || "---"}</span></div>
                          <div className="flex items-baseline gap-2"><span className="text-lg font-bold">CONES:</span><span className="text-3xl font-black">{op.cones || "0"}</span></div>
                          <div className="flex items-baseline gap-2"><span className="text-lg font-bold">ROCAS:</span><span className="text-3xl font-black underline">{op.rocas}</span></div>
                        </div>
                        <div className="border-l-2 border-black pl-4 flex flex-col justify-center">
                          <div className="text-xs font-black mb-1 uppercase">OBS:</div>
                          <div className="text-sm flex-grow italic leading-tight">{op.obs || "---"}</div>
                        </div>
                      </div>
                      <div className="mt-auto flex justify-between gap-4 pt-2 border-t border-black">
                        <div className="flex-1 border-b border-black text-[8px] font-bold uppercase text-center pb-0.5">Produção</div>
                        <div className="flex-1 border-b border-black text-[8px] font-bold uppercase text-center pb-0.5">Embalagem</div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Itens e Fatores</h2>
                <p className="text-sm text-slate-500">Configuração de pesos para cálculo automático.</p>
              </div>
              <button onClick={() => setShowModal({ type: 'edit_config', data: { name: '', weightRoca: '', weightCone: '', supply: '' } })} className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" /> Novo Item
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {configItems.map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow relative group">
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setShowModal({ type: 'edit_config', data: item })} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setConfigItems(configItems.filter(i => i.id !== item.id))} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="text-blue-600 font-bold text-sm uppercase tracking-widest mb-1">{item.supply}</div>
                  <h3 className="text-2xl font-black text-slate-800 mb-4">{item.name}</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm pb-2 border-b border-slate-50"><span>Roca:</span><span className="font-bold">{item.weightRoca} kg</span></div>
                    <div className="flex justify-between text-sm pb-2 border-b border-slate-50"><span>Cone:</span><span className="font-bold">{item.weightCone} kg</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {showModal.type === 'confirm_new' && (
        <Modal title="Descartar Alterações?" onConfirm={resetList} onCancel={() => setShowModal({ type: null, data: null })}>
          Existem dados não salvos. Deseja descartar a lista atual?
        </Modal>
      )}

      {showModal.type === 'edit_config' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Configurar Item</h3>
              <button onClick={() => setShowModal({ type: null, data: null })}><X /></button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase">Nome</label>
              <input type="text" value={showModal.data.name} onChange={e => setShowModal({...showModal, data: {...showModal.data, name: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" /></div>
              <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase">Insumo</label>
              <input type="text" value={showModal.data.supply} onChange={e => setShowModal({...showModal, data: {...showModal.data, supply: e.target.value}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" /></div>
              <div><label className="text-xs font-bold text-slate-400 uppercase">Peso Roca</label>
              <input type="number" step="0.001" value={showModal.data.weightRoca} onChange={e => setShowModal({...showModal, data: {...showModal.data, weightRoca: Number(e.target.value)}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" /></div>
              <div><label className="text-xs font-bold text-slate-400 uppercase">Peso Cone</label>
              <input type="number" step="0.001" value={showModal.data.weightCone} onChange={e => setShowModal({...showModal, data: {...showModal.data, weightCone: Number(e.target.value)}})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" /></div>
            </div>
            <button onClick={() => {
              const data = showModal.data;
              if (data.id) setConfigItems(configItems.map(i => i.id === data.id ? data : i));
              else setConfigItems([...configItems, { ...data, id: Date.now().toString() }]);
              setShowModal({ type: null, data: null });
              showAlert("Item atualizado!");
            }} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl">Salvar</button>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: landscape; margin: 0; }
          body { background: white !important; }
          .page-break-after-always { page-break-after: always; }
          nav, header, button, .print:hidden { display: none !important; }
        }
      `}} />
    </div>
  );
};

export default App;
