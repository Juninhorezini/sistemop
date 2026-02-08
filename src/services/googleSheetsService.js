import axios from 'axios'

const SHEET_ID = '1CWw8zKMf1ww08gynis7qIAYFjaYJo3PYb8bghp35zYE'
const SHEET_NAME = 'OPs Produção'
const SHEET_API_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`

// Inicializar Google Sheets API
const API_KEY = import.meta.env.VITE_GOOGLE_SHEETS_API_KEY || 'AIzaSyDEOW_lTXxqxUgmXn4qm3FHSw7P_WQ_lE0'

// Para autenticação OAuth (necessário para escrita)
const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercopy'

class GoogleSheetsService {
  /**
   * Busca todas as OPs da planilha
   * @returns {Promise<Array>}
   */
  async getAllOPs() {
    try {
      // Este é um endpoint de exemplo. Você precisará configurar um Google Apps Script
      // que exponha uma função para ler os dados da planilha
      const response = await axios.get(GOOGLE_SCRIPT_URL, {
        params: {
          action: 'getAllOPs',
          range: `${SHEET_NAME}!A:H`
        }
      })
      return response.data || []
    } catch (error) {
      console.error('Erro ao buscar OPs:', error)
      throw new Error('Não foi possível buscar as OPs da planilha')
    }
  }

  /**
   * Busca o último ID de OP para incrementar
   * @returns {Promise<number>}
   */
  async getLastOPNumber() {
    try {
      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!A:A`,
        {
          params: { key: API_KEY }
        }
      )
      
      const values = response.data.values || []
      if (values.length <= 1) return 0
      
      // Remove cabeçalho e encontra o último número
      const numbers = values
        .slice(1)
        .map(row => parseInt(row[0]))
        .filter(n => !isNaN(n))
      
      return Math.max(0, ...numbers)
    } catch (error) {
      console.error('Erro ao buscar último ID:', error)
      return 0
    }
  }

  /**
   * Salva uma nova OP na planilha
   * @param {Object} op - Dados da OP
   * @returns {Promise<Object>}
   */
  async saveOP(op) {
    try {
      // Prepare data para enviar ao Google Apps Script
      const payload = {
        action: 'saveOP',
        op: op,
        sheetName: SHEET_NAME
      }

      const response = await axios.post(GOOGLE_SCRIPT_URL, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        return { success: true, data: response.data }
      } else {
        throw new Error(response.data.error || 'Erro ao salvar OP')
      }
    } catch (error) {
      console.error('Erro ao salvar OP:', error)
      throw new Error('Não foi possível salvar a OP. Tente novamente.')
    }
  }

  /**
   * Atualiza uma OP existente
   * @param {Object} op - Dados da OP
   * @returns {Promise<Object>}
   */
  async updateOP(op) {
    try {
      const payload = {
        action: 'updateOP',
        op: op,
        sheetName: SHEET_NAME
      }

      const response = await axios.post(GOOGLE_SCRIPT_URL, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        return { success: true, data: response.data }
      } else {
        throw new Error(response.data.error || 'Erro ao atualizar OP')
      }
    } catch (error) {
      console.error('Erro ao atualizar OP:', error)
      throw new Error('Não foi possível atualizar a OP.')
    }
  }

  /**
   * Deleta uma OP
   * @param {number} opNumber - Número da OP a deletar
   * @returns {Promise<Object>}
   */
  async deleteOP(opNumber) {
    try {
      const payload = {
        action: 'deleteOP',
        opNumber: opNumber,
        sheetName: SHEET_NAME
      }

      const response = await axios.post(GOOGLE_SCRIPT_URL, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (response.data.success) {
        return { success: true }
      } else {
        throw new Error(response.data.error || 'Erro ao deletar OP')
      }
    } catch (error) {
      console.error('Erro ao deletar OP:', error)
      throw new Error('Não foi possível deletar a OP.')
    }
  }

  /**
   * Autenticação com Google
   * @returns {Promise<Object>}
   */
  async authenticate() {
    // Implementar OAuth 2.0 flow aqui
    // Por enquanto, retornar um objeto vazio
    return {}
  }
}

export default new GoogleSheetsService()
