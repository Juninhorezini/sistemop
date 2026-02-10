import googleSheetsService from './googleSheetsService'

const APP_ID = "op-manager-ff"

/**
 * Sincroniza configurações (itens) da Google Sheets para localStorage
 * Busca diretamente da planilha usando o novo método getConfigs
 */
export async function syncConfigFromSheets() {
  try {
    const configs = await googleSheetsService.getConfigs()
    
    if (!configs || configs.length === 0) {
      console.log('[Sync] Nenhuma configuração na planilha')
      return null
    }

    localStorage.setItem(`${APP_ID}_configs`, JSON.stringify(configs))
    console.log('[Sync] ✓ Configurações sincronizadas:', configs.length, 'itens')
    return configs
  } catch (error) {
    console.error('[Sync] Erro ao sincronizar configurações:', error.message)
    return null
  }
}

/**
 * Carrega o último número de OP da Google Sheets
 * Garante que novos IDs não colidam com OPs existentes
 */
export async function syncLastOPNumberFromSheets() {
  try {
    const lastNumber = await googleSheetsService.getLastOPNumber()
    
    if (typeof lastNumber === 'number' && lastNumber > 0) {
      localStorage.setItem(`${APP_ID}_last_id`, lastNumber.toString())
      console.log('[Sync] ✓ Último OP sincronizado:', lastNumber)
      return lastNumber
    }

    return null
  } catch (error) {
    console.error('[Sync] Erro ao sincronizar último OP:', error.message)
    return null
  }
}

/**
 * Sincroniza todos os dados da Google Sheets
 * Executado ao abrir o app
 */
export async function fullSync() {
  console.log('[Sync] Iniciando sincronização...')
  
  try {
    const [syncedConfigs, syncedLastNumber] = await Promise.all([
      syncConfigFromSheets(),
      syncLastOPNumberFromSheets()
    ])
    
    console.log('[Sync] ✓ Sincronização completa!')
    return syncedConfigs
  } catch (error) {
    console.error('[Sync] Erro na sincronização:', error.message)
    return null
  }
}

/**
 * Salva as configurações na Google Sheets
 * Chamado quando usuário atualiza/adiciona/remove itens
 */
export async function saveConfigsToSheets(configs) {
  try {
    if (!configs || configs.length === 0) {
      throw new Error('Nenhuma configuração para salvar')
    }

    await googleSheetsService.saveConfigs(configs)
    console.log('[Sync] ✓ Configurações salvas na planilha')
    return true
  } catch (error) {
    console.error('[Sync] Erro ao salvar configurações:', error.message)
    throw error
  }
}
