/**
 * Calcula a quantidade de rocas baseado no número de cones e pesos
 * @param {number} qtdCones - Quantidade de cones
 * @param {number} pesoCone - Peso de cada cone
 * @param {number} pesoRoca - Peso de cada roca
 * @returns {number} Quantidade de rocas (arredondado para cima)
 */
export function calculateQtdRocas(qtdCones, pesoCone, pesoRoca) {
  if (!qtdCones || !pesoCone || !pesoRoca) return 0
  return Math.ceil((qtdCones * pesoCone) / pesoRoca)
}

/**
 * Calcula o peso total
 * @param {number} qtdRocas - Quantidade de rocas
 * @param {number} pesoRoca - Peso de cada roca
 * @returns {number} Peso total
 */
export function calculatePesoTotal(qtdRocas, pesoRoca) {
  if (!qtdRocas || !pesoRoca) return 0
  return qtdRocas * pesoRoca
}

/**
 * Formata número com 2 casas decimais
 * @param {number} value - Valor a formatar
 * @returns {string} Valor formatado
 */
export function formatNumber(value) {
  return Number(value || 0).toFixed(2)
}

/**
 * Formata data para padrão BR
 * @param {string|Date} date - Data a formatar
 * @returns {string} Data formatada (DD/MM/YYYY)
 */
export function formatDate(date) {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Formata data para formato ISO (YYYY-MM-DD)
 * @returns {string} Data de hoje em formato ISO
 */
export function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

/**
 * Valida se um objeto de OP tem dados válidos
 * @param {Object} op - Objeto OP
 * @returns {Object} { isValid: boolean, errors: Array }
 */
export function validateOP(op) {
  const errors = []

  if (!op.numero) errors.push('Número da OP é obrigatório')
  if (!op.data) errors.push('Data é obrigatória')
  if (!op.itens || op.itens.length === 0) errors.push('Adicione pelo menos um item')

  op.itens?.forEach((item, idx) => {
    if (!item.itemId) errors.push(`Item ${idx + 1}: Selecione um item`)
    if (!item.qtdCones || item.qtdCones <= 0) errors.push(`Item ${idx + 1}: Quantidade de cones inválida`)
  })

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Busca um item pelo ID
 * @param {string|number} id - ID do item
 * @param {Array} items - Array de itens
 * @returns {Object|null} Item encontrado ou null
 */
export function findItemById(id, items) {
  return items.find(item => item.id === id) || null
}

/**
 * Ordena items pela propriedade especificada
 * @param {Array} items - Array de itens
 * @param {string} property - Propriedade para ordenar
 * @param {string} direction - 'asc' ou 'desc'
 * @returns {Array} Array ordenado
 */
export function sortItems(items, property, direction = 'asc') {
  return [...items].sort((a, b) => {
    const valueA = a[property]
    const valueB = b[property]

    if (valueA < valueB) return direction === 'asc' ? -1 : 1
    if (valueA > valueB) return direction === 'asc' ? 1 : -1
    return 0
  })
}

/**
 * Filtra items baseado em termo de busca
 * @param {Array} items - Array de itens
 * @param {string} searchTerm - Termo de busca
 * @param {Array} searchFields - Campos para buscar
 * @returns {Array} Items filtrados
 */
export function searchItems(items, searchTerm, searchFields = ['nome', 'insumo']) {
  if (!searchTerm) return items

  const term = searchTerm.toLowerCase()
  return items.filter(item =>
    searchFields.some(field =>
      String(item[field] || '').toLowerCase().includes(term)
    )
  )
}

/**
 * Valida se um email é válido
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

/**
 * Debounce function para delays
 * @param {Function} func - Função a executar
 * @param {number} delay - Delay em millisegundos
 * @returns {Function} Função com debounce
 */
export function debounce(func, delay) {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Clona um objeto profundamente
 * @param {Object} obj - Objeto a clonar
 * @returns {Object} Objeto clonado
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}
