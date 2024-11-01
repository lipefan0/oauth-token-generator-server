import ExcelJS from 'exceljs';

export async function processExcelProducts(buffer, token) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    
    const worksheet = workbook.getWorksheet(1);
    const results = {
        total: worksheet.rowCount - 1, // -1 para excluir o cabeçalho
        success: 0,
        errors: [],
        processedItems: []
    };

    // Começar da linha 2 para pular o cabeçalho
    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        
        try {
            const product = {
                nome: row.getCell('A').value,
                codigo: row.getCell('B').value,
                preco: Number(row.getCell('C').value),
                descricao: row.getCell('D').value || '',
                unidade: row.getCell('E').value || 'UN'
            };

            // Validação
            if (!product.nome || !product.codigo || !product.preco) {
                throw new Error('Campos obrigatórios ausentes');
            }

            const response = await createProduct(product, token);
            results.success++;
            results.processedItems.push({
                index: rowNumber - 1,
                status: 'success',
                produto: response
            });
        } catch (error) {
            results.errors.push({
                index: rowNumber - 1,
                row: rowNumber,
                error: error.message
            });
            results.processedItems.push({
                index: rowNumber - 1,
                status: 'error',
                error: error.message
            });
        }
    }

    return results;
}

export async function getExcelTemplate(req, res) {
    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Bling Integration';
        workbook.lastModifiedBy = 'System';
        workbook.created = new Date();
        workbook.modified = new Date();

        const worksheet = workbook.addWorksheet('Produtos', {
            properties: {defaultColWidth: 20}
        });

        // Definir cabeçalhos com estilo
        worksheet.columns = [
            { header: 'Nome*', key: 'nome', width: 40 },
            { header: 'Código*', key: 'codigo', width: 20 },
            { header: 'Preço*', key: 'preco', width: 15, style: { numFmt: 'R$ #,##0.00' } },
            { header: 'Descrição', key: 'descricao', width: 50 },
            { header: 'Unidade', key: 'unidade', width: 15 }
        ];

        // Estilizar cabeçalhos
        const headerRow = worksheet.getRow(1);
        headerRow.font = {
            name: 'Arial',
            size: 11,
            bold: true
        };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Adicionar dados de exemplo
        worksheet.addRow({
            nome: 'Produto Exemplo',
            codigo: 'PROD001',
            preco: 99.90,
            descricao: 'Descrição detalhada do produto exemplo',
            unidade: 'UN'
        });

        // Adicionar informações de ajuda
        worksheet.addRow([]); // Linha em branco
        worksheet.addRow(['* Campos obrigatórios']);
        worksheet.getRow(4).font = { italic: true, color: { argb: 'FF808080' } };

        // Congelar primeira linha
        worksheet.views = [
            { state: 'frozen', xSplit: 0, ySplit: 1 }
        ];

        return await workbook.xlsx.writeBuffer();
    } catch (error) {
        console.error('Erro ao gerar template:', error);
        throw error;
    }
}

export async function createProduct(product, token) {
    try {
        const response = await fetch('https://www.bling.com.br/Api/v3/produtos', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                nome: product.nome,
                codigo: product.codigo,
                preco: product.preco,
                tipo: 'P',
                situacao: 'A',
                formato: 'S',
                descricao: product.descricao,
                unidade: product.unidade || 'UN'
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData);
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
}