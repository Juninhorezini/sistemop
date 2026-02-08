import React, { useState } from 'react'
import { useConfigStore } from '../store'
import { Button, Input, Table, Modal, Alert, Card } from './UI'
import { Trash2, Plus, Edit2 } from 'lucide-react'

export function ConfiguracoesTab() {
  const items = useConfigStore(state => state.items)
  const addItem = useConfigStore(state => state.addItem)
  const updateItem = useConfigStore(state => state.updateItem)
  const deleteItem = useConfigStore(state => state.deleteItem)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    nome: '',
    idItem: '',
    pesoCone: '',
    pesoRoca: '',
    insumo: ''
  })
  const [errors, setErrors] = useState({})
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  const validateForm = () => {
    const newErrors = {}

    if (!formData.idItem.trim()) newErrors.idItem = 'ID do item é obrigatório'
    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório'
    if (!formData.pesoCone || formData.pesoCone <= 0) newErrors.pesoCone = 'Peso do cone deve ser maior que 0'
    if (!formData.pesoRoca || formData.pesoRoca <= 0) newErrors.pesoRoca = 'Peso da roça deve ser maior que 0'
    if (!formData.insumo.trim()) newErrors.insumo = 'Insumo é obrigatório'

    // Verifica se ID já existe (em adição)
    if (!editingId && items.some(item => item.idItem === formData.idItem)) {
      newErrors.idItem = 'Este ID já existe'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) return

    if (editingId) {
      updateItem(editingId, {
        ...formData,
        pesoCone: parseFloat(formData.pesoCone),
        pesoRoca: parseFloat(formData.pesoRoca)
      })
      setSuccessMessage('Item atualizado com sucesso!')
    } else {
      addItem({
        ...formData,
        pesoCone: parseFloat(formData.pesoCone),
        pesoRoca: parseFloat(formData.pesoRoca)
      })
      setSuccessMessage('Item adicionado com sucesso!')
    }

    resetForm()
    setTimeout(() => setSuccessMessage(''), 3000)
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      idItem: '',
      pesoCone: '',
      pesoRoca: '',
      insumo: ''
    })
    setEditingId(null)
    setShowForm(false)
    setErrors({})
  }

  const handleEdit = (item) => {
    setFormData({
      nome: item.nome,
      idItem: item.idItem,
      pesoCone: item.pesoCone,
      pesoRoca: item.pesoRoca,
      insumo: item.insumo
    })
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDeleteClick = (item) => {
    setDeleteTarget(item)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (deleteTarget) {
      deleteItem(deleteTarget.id)
      setSuccessMessage('Item deletado com sucesso!')
      setDeleteTarget(null)
      setShowDeleteModal(false)
      setTimeout(() => setSuccessMessage(''), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configurações de Itens</h2>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} variant="primary">
            <Plus className="w-4 h-4" /> Novo Item
          </Button>
        )}
      </div>

      {showForm && (
        <Card title={editingId ? 'Editar Item' : 'Novo Item'}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="ID do Item"
                placeholder="EX: ITEM001"
                value={formData.idItem}
                onChange={(val) => setFormData(prev => ({ ...prev, idItem: val }))}
                error={errors.idItem}
                required
                disabled={!!editingId}
              />
              <Input
                label="Nome do Item"
                placeholder="Nome descritivo"
                value={formData.nome}
                onChange={(val) => setFormData(prev => ({ ...prev, nome: val }))}
                error={errors.nome}
                required
              />
              <Input
                label="Peso do Cone (kg)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.pesoCone}
                onChange={(val) => setFormData(prev => ({ ...prev, pesoCone: val }))}
                error={errors.pesoCone}
                required
              />
              <Input
                label="Peso da Roça (kg)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.pesoRoca}
                onChange={(val) => setFormData(prev => ({ ...prev, pesoRoca: val }))}
                error={errors.pesoRoca}
                required
              />
              <Input
                label="Insumo"
                placeholder="Nome do insumo"
                value={formData.insumo}
                onChange={(val) => setFormData(prev => ({ ...prev, insumo: val }))}
                error={errors.insumo}
                required
              />
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button type="submit" variant="success">
                {editingId ? 'Atualizar' : 'Adicionar'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <Table
          columns={[
            { key: 'idItem', label: 'ID' },
            { key: 'nome', label: 'Nome' },
            { key: 'pesoCone', label: 'Peso Cone (kg)' },
            { key: 'pesoRoca', label: 'Peso Roça (kg)' },
            { key: 'insumo', label: 'Insumo' },
            {
              key: 'actions',
              label: 'Ações',
              render: (item) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(item)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Deletar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            }
          ]}
          data={items}
        />
      </Card>

      <Modal
        isOpen={showDeleteModal}
        title="Confirmar Deleção"
        message={`Tem certeza que deseja deletar o item "${deleteTarget?.nome}"?`}
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
        isDanger
      />
    </div>
  )
}
