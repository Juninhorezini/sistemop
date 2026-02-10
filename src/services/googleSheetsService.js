import axios from 'axios'

const SHEET_NAME = 'OPs Produção'

// Configuração do Google Apps Script Standalone
const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/usercopy'

class GoogleSheetsService {

  /**
   * Helper privado para fazer requisições POST evitando preflight CORS
   * Google Apps Script não suporta OPTIONS (preflight), então usamos text/plain
   */
  async _post(payload) {
    const config = {
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      }
    };
    // Envia stringificado para garantir que axios não mude para application/json
    return axios.post(GOOGLE_SCRIPT_URL, JSON.stringify(payload), config);
  }

  /**
   * Busca todas as OPs da planilha
   * @returns {Promise<Array>}
   */
  async getAllOPs() {
    try {
      const response = await this._post({
        action: 'getAllOPs',
        sheetName: SHEET_NAME
      })

      if (response.data.success) {
        return response.data.ops || []
      } else {
        throw new Error(response.data.error || 'Erro ao buscar OPs')
      }
    } catch (error) {
      console.error('Erro ao buscar OPs:', error.message)
      throw new Error('Não foi possível buscar as OPs da planilha')
    }
  }

  /**
   * Busca o último ID de OP para incrementar
   * @returns {Promise<number>}
   */
  async getLastOPNumber() {
    try {
      const response = await this._post({
        action: 'getLastOPNumber',
        sheetName: SHEET_NAME
      })

      if (response.data.success) {
        return response.data.lastNumber || 0
      } else {
        throw new Error(response.data.error || 'Erro ao buscar último número')
      }
    } catch (error) {
      console.error('Erro ao buscar último ID:', error.message)
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
      const payload = {
        action: 'saveOP',
        op: op,
        sheetName: SHEET_NAME
      }

      const response = await this._post(payload)

      if (response.data.success) {
        return { success: true, data: response.data }
      } else {
        throw new Error(response.data.error || 'Erro ao salvar OP')
      }
    } catch (error) {
      console.error('Erro ao salvar OP:', error.message)
      throw new Error('Não foi possível salvar a OP. Tente novamente.')
    }
  }

  /**
   * Salva múltiplas OPs na planilha em lote (Batch)
   * @param {Array<Object>} ops - Lista de OPs
   * @returns {Promise<Object>}
   */
  async saveOPsBatch(ops) {
    try {
      const payload = {
        action: 'saveOPsBatch',
        ops: ops,
        sheetName: SHEET_NAME
      }

      const response = await this._post(payload)

      if (response.data.success) {
        return { success: true, data: response.data }
      } else {
        throw new Error(response.data.error || 'Erro ao salvar lote de OPs')
      }
    } catch (error) {
      console.error('Erro ao salvar lote de OPs:', error.message)
      throw new Error('Não foi possível salvar as OPs em lote.')
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

      const response = await this._post(payload)

      if (response.data.success) {
        return { success: true, data: response.data }
      } else {
        throw new Error(response.data.error || 'Erro ao atualizar OP')
      }
    } catch (error) {
      console.error('Erro ao atualizar OP:', error.message)
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

      const response = await this._post(payload)

      if (response.data.success) {
        return { success: true }
      } else {
        throw new Error(response.data.error || 'Erro ao deletar OP')
      }
    } catch (error) {
      console.error('Erro ao deletar OP:', error.message)
      throw new Error('Não foi possível deletar a OP.')
    }
  }

  /**
   * Busca todas as configurações (itens) da planilha
   * Colunas K:N da aba OPs Produção
   * @returns {Promise<Array>}
   */
  async getConfigs() {
    try {
      const response = await this._post({
        action: 'getConfigs',
        sheetName: SHEET_NAME
      })

      if (response.data.success) {
        return response.data.configs || []
      } else {
        throw new Error(response.data.error || 'Erro ao buscar configurações')
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error.message)
      return []
    }
  }

  /**
   * Salva as configurações (itens) na planilha
   * Colunas K:N da aba OPs Produção
   * @param {Array<Object>} configs - Lista de configurações
   * @returns {Promise<Object>}
   */
  async saveConfigs(configs) {
    try {
      const payload = {
        action: 'saveConfigs',
        configs: configs,
        sheetName: SHEET_NAME
      }

      const response = await this._post(payload)

      if (response.data.success) {
        return { success: true, data: response.data }
      } else {
        throw new Error(response.data.error || 'Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error.message)
      throw new Error('Não foi possível salvar as configurações.')
    }
  }

  /**
   * Verifica a conectividade com o Google Apps Script
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      const response = await this._post({
        action: 'getLastOPNumber',
        sheetName: SHEET_NAME
      })
      return response.data.success === true
    } catch (error) {
      console.error('Erro ao testar conexão:', error.message)
      return false
    }
  }
}

export default new GoogleSheetsService()
