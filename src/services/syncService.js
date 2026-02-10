import googleSheetsService from './googleSheetsService'

const APP_ID = "op-manager-ff"

/**
 * Sincroniza configurações (itens) da Google Sheets para localStorage
 * Se houver dados na planilha, carrega deles. Senão, usa dados locais.
 */
export async function syncConfigFromSheets() {
  try {
    const allOPs = await googleSheetsService.getAllOPs()
    
    if (!allOPs || allOPs.length === 0) {
      console.log('[Sync] Nenhuma OP na planilha, usando dados locais')
      return null
    }

    // Extrai itens únicos das OPs existentes
    const itemsMap = new Map()
    allOPs.forEach(op => {
      if (op.itens && Array.isArray(op.itens)) {
        op.itens.forEach(item => {
          if (item.name) {
            itemsMap.set(item.name, {
              id: item.name,
              name: item.name,
              weightRoca: item.weightRoca || 0,
              weightCone: item.weightCone || 0,
              supply: item.supply || ''
            })
          }
        })
      }
    })

    if (itemsMap.size > 0) {
      const configs = Array.from(itemsMap.values())
      localStorage.setItem(`${APP_ID}_configs`, JSON.stringify(configs))
      console.log('[Sync] ✓ Configurações sincronizadas', configs.length, 'itens')
      return configs
    }

    return null
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
    await Promise.all([
      syncConfigFromSheets(),
      syncLastOPNumberFromSheets()
    ])
    
    console.log('[Sync] ✓ Sincronização completa!')
    return true
  } catch (error) {
    console.error('[Sync] Erro na sincronização:', error.message)
    return false
  }
}
