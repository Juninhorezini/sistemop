import React, { useState } from 'react'
import { useUIStore } from './store'
import { GeradorOPTab } from './components/GeradorOPTab'
import { ConfiguracoesTab } from './components/ConfiguracoesTab'
import { BarChart3, Settings } from 'lucide-react'

function App() {
  const activeTab = useUIStore(state => state.activeTab)
  const setActiveTab = useUIStore(state => state.setActiveTab)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Sistema de Gestão de Ordens de Produção
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0">
            <button
              onClick={() => setActiveTab('gerador')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'gerador'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-700 border-transparent hover:text-gray-900'
              }`}
              title="Gerar novas Ordens de Produção"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="hidden sm:inline">Gerador de OP</span>
              <span className="sm:hidden">OP</span>
            </button>
            <button
              onClick={() => setActiveTab('configs')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'configs'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-700 border-transparent hover:text-gray-900'
              }`}
              title="Configurar itens e pesos"
            >
              <Settings className="w-5 h-5" />
              <span className="hidden sm:inline">Configurações</span>
              <span className="sm:hidden">Config</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'gerador' && <GeradorOPTab />}
        {activeTab === 'configs' && <ConfiguracoesTab />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 Sistema de Gestão de OP. Todos os direitos reservados.</p>
            <p className="text-xs mt-2">
              Desenvolvido com React + Vite | Integração Google Sheets | Deploy Netlify
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
