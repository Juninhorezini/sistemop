import React, { useState, useEffect } from 'react'
import { useOPStore, useConfigStore, useUIStore } from '../store'
import { Button, Input, Select, Table, Modal, Alert, Card } from './UI'
import { calculateQtdRocas, calculatePesoTotal, formatDate, getTodayISO } from '../utils/helpers'
import { Trash2, Plus, Save, Printer, RefreshCw } from 'lucide-react'
import googleSheetsService from '../services/googleSheetsService'
import pdfService from '../services/pdfService'

export function GeradorOPTab() {
  const currentOP = useOPStore(state => state.currentOP)
  const setCurrentOP = useOPStore(state => state.setCurrentOP)
  const addItemToOP = useOPStore(state => state.addItemToOP)
  const updateItemInOP = useOPStore(state => state.updateItemInOP)
  const removeItemFromOP = useOPStore(state => state.removeItemFromOP)
  const resetOP = useOPStore(state => state.resetOP)
  const setLastOPNumber = useOPStore(state => state.setLastOPNumber)
  const lastOPNumber = useOPStore(state => state.lastOPNumber)

  const configItems = useConfigStore(state => state.getItems())
  
  const setLoading = useUIStore(state => state.setLoading)
  const loading = useUIStore(state => state.loading)

  const [showNewListModal, setShowNewListModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [newItemForm, setNewItemForm] = useState({
    itemId: '',
    qtdCones: ''
  })
  const [errors, setErrors] = useState({})

  // Inicializa a OP ao carregar
  useEffect(() => {
    if (!currentOP.numero) {
      setCurrentOP({
        ...currentOP,
        data: getTodayISO(),
        numero: lastOPNumber + 1
      })
      
      // Busca o último número de OP da planilha
      fetchLastOPNumber()
    }
  }, [])

  const fetchLastOPNumber = async () => {
    try {
      setLoading(true)
      const lastNumber = await googleSheetsService.getLastOPNumber()
      setLastOPNumber(lastNumber)
      setCurrentOP({
        ...currentOP,
        numero: lastNumber + 1,
        data: getTodayISO()
      })
    } catch (error) {
      console.error('Erro ao buscar último número de OP:', error)
      // Fallback: usar número sequencial local
      setCurrentOP({
        ...currentOP,
        numero: lastOPNumber + 1,
        data: getTodayISO()
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    const newErrors = {}

    if (!newItemForm.itemId) newErrors.itemId = 'Selecione um item'
    if (!newItemForm.qtdCones || newItemForm.qtdCones <= 0) newErrors.qtdCones = 'Quantidade inválida'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const selectedItem = configItems.find(item => item.id.toString() === newItemForm.itemId)
    if (!selectedItem) {
      setErrors({ itemId: 'Item não encontrado' })
      return
    }

    const qtdRocas = calculateQtdRocas(
      newItemForm.qtdCones,
      selectedItem.pesoCone,
      selectedItem.pesoRoca
    )

    const pesoTotal = calculatePesoTotal(qtdRocas, selectedItem.pesoRoca)

    const newItem = {
      itemId: selectedItem.id,
      itemName: selectedItem.nome,
      qtdCones: parseInt(newItemForm.qtdCones),
      qtdRocas: qtdRocas,
      pesoTotal: pesoTotal,
      pesoCone: selectedItem.pesoCone,
      pesoRoca: selectedItem.pesoRoca
    }

    addItemToOP(newItem)
    setNewItemForm({ itemId: '', qtdCones: '' })
    setErrors({})
    setSuccessMessage('Item adicionado com sucesso!')
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const handleRemoveItem = (index) => {
    removeItemFromOP(index)
    setSuccessMessage('Item removido!')
    setTimeout(() => setSuccessMessage(''), 2000)
  }

  const handleSaveOP = async () => {
    if (currentOP.itens.length === 0) {
      setErrorMessage('Adicione pelo menos um item antes de salvar')
      setTimeout(() => setErrorMessage(''), 3000)
      return
    }

    setShowSaveModal(true)
  }

  const confirmSave = async () => {
    try {
      setLoading(true)
      
      // Prepara dados para enviar ao Google Sheets
      const opData = {
        numero: currentOP.numero,
        data: currentOP.data,
        itens: currentOP.itens,
        dataEnvio: new Date().toISOString()
      }

      // Envia para Google Sheets
      await googleSheetsService.saveOP(opData)

      setSuccessMessage('OP salva com sucesso!')
      setShowSaveModal(false)
      
      // Aguarda um pouco e reseta para nova lista
      setTimeout(() => {
        setSuccessMessage('')
        resetOP()
        fetchLastOPNumber()
      }, 2000)
    } catch (error) {
      console.error('Erro ao salvar OP:', error)
      setErrorMessage(error.message || 'Erro ao salvar OP. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleNewList = () => {
    if (currentOP.isDirty && currentOP.itens.length > 0) {
      setShowNewListModal(true)
    } else {
      resetOP()
      fetchLastOPNumber()
    }
  }

  const confirmNewList = () => {
    setShowNewListModal(false)
    resetOP()
    fetchLastOPNumber()
  }

  const handlePrint = async () => {
    try {
      setLoading(true)
      
      // Busca função auxiliar para obter item por ID
      const getConfigItem = (id) => configItems.find(item => item.id === id)
      
      // Gera PDF com a OP atual
      await pdfService.generateOPsPDF([currentOP], getConfigItem)
      
      setSuccessMessage('PDF gerado com sucesso!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      setErrorMessage(error.message || 'Erro ao gerar PDF')
      setTimeout(() => setErrorMessage(''), 3000)
    } finally {
      setLoading(false)
    }
  }

  const itemOptions = configItems.map(item => ({
    value: item.id.toString(),
    label: `${item.nome} - ${item.insumo}`
  }))

  return (
    <div className="space-y-6">
      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
      )}

      {errorMessage && (
        <Alert type="error" message={errorMessage} onClose={() => setErrorMessage('')} />
      )}

      {/* Cabeçalho da OP */}
      <Card title="Informações da Ordem de Produção">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Nº OP"
            type="number"
            value={currentOP.numero || ''}
            onChange={(val) => setCurrentOP({ ...currentOP, numero: parseInt(val) })}
            disabled
          />
          <Input
            label="Data"
            type="date"
            value={currentOP.data}
            onChange={(val) => setCurrentOP({ ...currentOP, data: val })}
            required
          />
          <div className="flex items-end">
            <Button
              onClick={fetchLastOPNumber}
              variant="secondary"
              size="sm"
              className="w-full"
            >
              <RefreshCw className="w-4 h-4" /> Atualizar Nº
            </Button>
          </div>
        </div>
      </Card>

      {/* Formulário para Adicionar Itens */}
      <Card title="Adicionar Itens">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Item"
              options={itemOptions}
              value={newItemForm.itemId}
              onChange={(val) => setNewItemForm(prev => ({ ...prev, itemId: val }))}
              error={errors.itemId}
              required
              searchable
            />
            <Input
              label="Quantidade de Cones"
              type="number"
              value={newItemForm.qtdCones}
              onChange={(val) => setNewItemForm(prev => ({ ...prev, qtdCones: val }))}
              error={errors.qtdCones}
              required
            />
            <div className="flex items-end">
              <Button
                onClick={handleAddItem}
                variant="primary"
                className="w-full"
              >
                <Plus className="w-4 h-4" /> Adicionar
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabela de Itens */}
      {currentOP.itens.length > 0 && (
        <Card title={`Itens da OP (${currentOP.itens.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Item</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Qtd Cones</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Peso Cone</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Qtd Rocas</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Peso Total</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {currentOP.itens.map((item, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 text-sm font-medium">{item.itemName}</td>
                    <td className="px-4 py-3 text-sm">{item.qtdCones}</td>
                    <td className="px-4 py-3 text-sm">{item.pesoCone} kg</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">{item.qtdRocas}</td>
                    <td className="px-4 py-3 text-sm font-semibold">{item.pesoTotal.toFixed(2)} kg</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Remover"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Resumo */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Cones</p>
                <p className="text-xl font-bold">
                  {currentOP.itens.reduce((sum, item) => sum + item.qtdCones, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Rocas</p>
                <p className="text-xl font-bold text-green-600">
                  {currentOP.itens.reduce((sum, item) => sum + item.qtdRocas, 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Peso Total (kg)</p>
                <p className="text-xl font-bold">
                  {currentOP.itens.reduce((sum, item) => sum + item.pesoTotal, 0).toFixed(2)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Itens</p>
                <p className="text-xl font-bold">{currentOP.itens.length}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex flex-wrap gap-3 justify-center md:justify-end">
        <Button
          onClick={handleNewList}
          variant="secondary"
          className="flex-1 md:flex-none"
        >
          <RefreshCw className="w-4 h-4" /> Nova Lista
        </Button>
        {currentOP.itens.length > 0 && (
          <>
            <Button
              onClick={handlePrint}
              variant="secondary"
              className="flex-1 md:flex-none"
              loading={loading}
            >
              <Printer className="w-4 h-4" /> Imprimir
            </Button>
            <Button
              onClick={handleSaveOP}
              variant="success"
              className="flex-1 md:flex-none"
              loading={loading}
            >
              <Save className="w-4 h-4" /> Salvar OP
            </Button>
          </>
        )}
      </div>

      {/* Modal Nova Lista */}
      <Modal
        isOpen={showNewListModal}
        title="Descartar Alterações?"
        message="Existem alterações não salvas. Deseja descartar e iniciar uma nova lista?"
        onConfirm={confirmNewList}
        onCancel={() => setShowNewListModal(false)}
        isDanger
      />

      {/* Modal Salvar */}
      <Modal
        isOpen={showSaveModal}
        title="Confirmar Salvamento"
        message={`Deseja salvar a OP #${currentOP.numero} com ${currentOP.itens.length} item(ns)?`}
        onConfirm={confirmSave}
        onCancel={() => setShowSaveModal(false)}
      />
    </div>
  )
}
