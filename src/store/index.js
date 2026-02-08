import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Store para Configurações (Itens)
export const useConfigStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => ({
        items: [...state.items, { ...item, id: Date.now() }]
      })),
      
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map(item => item.id === id ? { ...item, ...updates } : item)
      })),
      
      deleteItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      getItemById: (id) => {
        const state = get()
        return state.items.find(item => item.id === id)
      },
      
      getItems: () => get().items,
    }),
    {
      name: 'config-storage'
    }
  )
)

// Store para OP em Edição
export const useOPStore = create(
  devtools((set, get) => ({
    currentOP: {
      id: null,
      data: new Date().toISOString().split('T')[0],
      numero: null,
      itens: [],
      isDirty: false
    },
    
    allOPs: [],
    lastOPNumber: 0,
    
    setCurrentOP: (op) => set({ currentOP: { ...op, isDirty: true } }),
    
    addItemToOP: (item) => set((state) => ({
      currentOP: {
        ...state.currentOP,
        itens: [...state.currentOP.itens, item],
        isDirty: true
      }
    })),
    
    updateItemInOP: (index, updates) => set((state) => ({
      currentOP: {
        ...state.currentOP,
        itens: state.currentOP.itens.map((item, i) => 
          i === index ? { ...item, ...updates } : item
        ),
        isDirty: true
      }
    })),
    
    removeItemFromOP: (index) => set((state) => ({
      currentOP: {
        ...state.currentOP,
        itens: state.currentOP.itens.filter((_, i) => i !== index),
        isDirty: true
      }
    })),
    
    saveOP: () => set((state) => ({
      allOPs: [...state.allOPs, { ...state.currentOP, isDirty: false }],
      currentOP: {
        ...state.currentOP,
        isDirty: false
      }
    })),
    
    resetOP: () => set({
      currentOP: {
        id: null,
        data: new Date().toISOString().split('T')[0],
        numero: null,
        itens: [],
        isDirty: false
      }
    }),
    
    setLastOPNumber: (number) => set({ lastOPNumber: number }),
    
    getCurrentOP: () => get().currentOP,
    getAllOPs: () => get().allOPs,
  }))
)

// Store para UI State
export const useUIStore = create(
  devtools((set) => ({
    activeTab: 'gerador',
    showModal: false,
    modalMessage: '',
    loading: false,
    error: null,
    
    setActiveTab: (tab) => set({ activeTab: tab }),
    setShowModal: (show) => set({ showModal: show }),
    setModalMessage: (message) => set({ modalMessage: message }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
  }))
)
