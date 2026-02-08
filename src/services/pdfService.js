import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

class PDFService {
  /**
   * Gera PDF com layout de impressão (4 OPs por página A4 em Landscape)
   * @param {Array} ops - Array de OPs a imprimir
   * @param {Function} getConfigItem - Função para buscar item de configuração
   * @returns {Promise<void>}
   */
  async generateOPsPDF(ops, getConfigItem) {
    try {
      // Página A4 em Landscape: 297mm x 210mm
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      const pageWidth = 297
      const pageHeight = 210
      const margin = 8
      const columns = 2
      const rows = 2
      const opWidth = (pageWidth - margin * 3) / columns
      const opHeight = (pageHeight - margin * 3) / rows

      let opIndex = 0
      let pageNum = 1

      for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
        for (let colIdx = 0; colIdx < columns; colIdx++) {
          if (opIndex >= ops.length) break

          const op = ops[opIndex]
          const x = margin + colIdx * (opWidth + margin)
          const y = margin + rowIdx * (opHeight + margin)

          this._drawOPBox(doc, op, x, y, opWidth, opHeight, getConfigItem)
          opIndex++
        }

        if (opIndex >= ops.length) break
      }

      // Adiciona página adicional se necessário
      while (opIndex < ops.length) {
        doc.addPage('a4', 'landscape')
        pageNum++

        for (let rowIdx = 0; rowIdx < rows; rowIdx++) {
          for (let colIdx = 0; colIdx < columns; colIdx++) {
            if (opIndex >= ops.length) break

            const op = ops[opIndex]
            const x = margin + colIdx * (opWidth + margin)
            const y = margin + rowIdx * (opHeight + margin)

            this._drawOPBox(doc, op, x, y, opWidth, opHeight, getConfigItem)
            opIndex++
          }
        }
      }

      doc.save(`OPs_${new Date().getTime()}.pdf`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      throw new Error('Não foi possível gerar o PDF')
    }
  }

  /**
   * Desenha uma caixa de OP no PDF
   * @private
   */
  _drawOPBox(doc, op, x, y, width, height, getConfigItem) {
    const fontSize = 7
    const headerHeight = 8
    const cellHeight = 3
    let currentY = y + 2

    doc.setFontSize(fontSize + 2)
    doc.setFont(undefined, 'bold')
    doc.text(`OP ${op.numero}`, x + 2, currentY)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(fontSize)

    currentY += 4

    // Informações da OP
    doc.text(`Data: ${this._formatDate(op.data)}`, x + 2, currentY)
    currentY += 3

    // Tabela de itens
    const tableX = x + 1
    const tableY = currentY
    const colWidths = {
      item: width * 0.25,
      qtdCones: width * 0.18,
      qtdRocas: width * 0.18,
      pesoTotal: width * 0.24
    }

    // Headers da tabela
    doc.setFillColor(240, 240, 240)
    doc.rect(tableX, tableY, colWidths.item, cellHeight, 'F')
    doc.rect(tableX + colWidths.item, tableY, colWidths.qtdCones, cellHeight, 'F')
    doc.rect(tableX + colWidths.item + colWidths.qtdCones, tableY, colWidths.qtdRocas, cellHeight, 'F')
    doc.rect(tableX + colWidths.item + colWidths.qtdCones + colWidths.qtdRocas, tableY, colWidths.pesoTotal, cellHeight, 'F')

    doc.setFontSize(fontSize - 1)
    doc.setFont(undefined, 'bold')
    doc.text('Item', tableX + 1, tableY + 2.5)
    doc.text('Qtd Cones', tableX + colWidths.item + 0.5, tableY + 2.5)
    doc.text('Qtd Rocas', tableX + colWidths.item + colWidths.qtdCones + 0.5, tableY + 2.5)
    doc.text('Peso Total', tableX + colWidths.item + colWidths.qtdCones + colWidths.qtdRocas + 0.5, tableY + 2.5)

    // Linhas dos itens
    doc.setFont(undefined, 'normal')
    doc.setFontSize(fontSize - 1)
    currentY = tableY + cellHeight

    op.itens.forEach((item, idx) => {
      if (idx >= 5) return // Limita a 5 itens por OP para caber na página

      const itemConfig = getConfigItem ? getConfigItem(item.itemId) : null
      const itemName = itemConfig ? itemConfig.nome || itemConfig.insumo : 'N/A'

      doc.text(itemName, tableX + 1, currentY + 2)
      doc.text(String(item.qtdCones), tableX + colWidths.item + 1, currentY + 2)
      doc.text(String(item.qtdRocas), tableX + colWidths.item + colWidths.qtdCones + 1, currentY + 2)
      doc.text(String((item.pesoTotal || 0).toFixed(2)), tableX + colWidths.item + colWidths.qtdCones + colWidths.qtdRocas + 1, currentY + 2)

      // Desenha linhas da tabela
      doc.setDrawColor(200)
      doc.line(tableX, currentY + cellHeight, tableX + width - 2, currentY + cellHeight)

      currentY += cellHeight
    })

    // Borda da caixa
    doc.setDrawColor(0)
    doc.rect(x, y, width, height)
  }

  /**
   * Formata a data para exibição
   * @private
   */
  _formatDate(dateString) {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }
}

export default new PDFService()
