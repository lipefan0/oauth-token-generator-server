import ExcelJS from "exceljs";

export async function processExcelPurchase(buffer, token) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.getWorksheet(1);
  const results = {
    message: "Processamento concluído",
    total: 0,
    success: 0,
    errors: [],
    processedItems: [],
  };

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    // Verificar campos obrigatórios
    const fornecedor = row.getCell("A").value;
    const data = row.getCell("B").value;
    const valor = row.getCell("C").value;

    if (!fornecedor && !data && !valor) continue;

    results.total++;

    try {
      const purchase = {
        fornecedor,
        data,
        valor: Number(valor),
        descricao: row.getCell("D").value || "",
        descricaoComplementar: row.getCell("E").value || "",
        unidade: row.getCell("F").value || "UN",
        marca: row.getCell("G").value || "",
        gtin: row.getCell("H").value?.toString() || "",
        ncm: row.getCell("I").value?.toString() || "",
        cest: row.getCell("J").value?.toString() || "",
        pesoLiquido: Number(row.getCell("K").value) || 0,
        pesoBruto: Number(row.getCell("L").value) || 0,
        altura: Number(row.getCell("M").value) || 0,
        largura: Number(row.getCell("N").value) || 0,
        profundidade: Number(row.getCell("O").value) || 0,
        categoriaId: Number(row.getCell("P").value) || undefined,
      };

      await delay(350);
      const response = await createPurchase(purchase, token);
      results.success++;
      results.processedItems.push({
        index: rowNumber - 1,
        status: "success",
        produto: response,
      });
    } catch (error) {
      let errorMessage = error.message;

      if (error.response?.data) {
        errorMessage = error.response.data.error;
      }

      results.errors.push({
        index: rowNumber - 1,
        status: "error",
        message: errorMessage,
      });
    }
  }
}
