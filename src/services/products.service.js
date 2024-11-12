import ExcelJS from 'exceljs';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function processExcelProducts(buffer, token) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    
    const worksheet = workbook.getWorksheet(1);
    const results = {
        message: 'Processamento concluído',
        total: 0,
        success: 0,
        errors: [],
        processedItems: []
    };

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        
        // Verificar campos obrigatórios
        const nome = row.getCell('A').value;
        const codigo = row.getCell('B').value;
        const preco = row.getCell('C').value;

        if (!nome && !codigo && !preco) continue;

        results.total++;

        try {
            const product = {
                nome,
                codigo,
                preco: Number(preco),
                descricao: row.getCell('D').value || '',
                descricaoComplementar: row.getCell('E').value || '',
                unidade: row.getCell('F').value || 'UN',
                marca: row.getCell('G').value || '',
                gtin: row.getCell('H').value?.toString() || '',
                ncm: row.getCell('I').value?.toString() || '',
                cest: row.getCell('J').value?.toString() || '',
                pesoLiquido: Number(row.getCell('K').value) || 0,
                pesoBruto: Number(row.getCell('L').value) || 0,
                altura: Number(row.getCell('M').value) || 0,
                largura: Number(row.getCell('N').value) || 0,
                profundidade: Number(row.getCell('O').value) || 0,
                categoriaId: Number(row.getCell('P').value) || undefined
            };

            await delay(350);
            const response = await createProduct(product, token);
            results.success++;
            results.processedItems.push({
                index: rowNumber - 1,
                status: 'success',
                produto: response
            });
        } catch (error) {
            let errorMessage = error.message;
            
            // Tentar fazer parse do erro se for uma string JSON
            try {
                if (typeof error.message === 'string' && error.message.includes('TOO_MANY_REQUESTS')) {
                    // Se for erro de limite, esperar mais tempo e tentar novamente
                    await delay(1000); // Espera 1 segundo
                    try {
                        const response = await createProduct(product, token);
                        results.success++;
                        results.processedItems.push({
                            index: rowNumber - 1,
                            status: 'success',
                            produto: response
                        });
                        continue; // Pula para o próximo item se a segunda tentativa for bem sucedida
                    } catch (retryError) {
                        errorMessage = retryError.message;
                    }
                }
            } catch (parseError) {
                errorMessage = error.message;
            }

            results.errors.push({
                index: rowNumber - 1,
                row: rowNumber,
                error: errorMessage
            });
            results.processedItems.push({
                index: rowNumber - 1,
                status: 'error',
                error: errorMessage
            });
        }
    }

    return results;
}

export async function getExcelTemplate() {
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
            { header: 'Descrição Curta', key: 'descricao', width: 50 },
            { header: 'Descrição Complementar', key: 'descricaoComplementar', width: 50 },
            { header: 'Unidade', key: 'unidade', width: 10 },
            { header: 'Marca', key: 'marca', width: 20 },
            { header: 'Código de Barras', key: 'gtin', width: 20 },
            { header: 'NCM', key: 'ncm', width: 15 },
            { header: 'CEST', key: 'cest', width: 15 },
            { header: 'Peso Líquido (kg)', key: 'pesoLiquido', width: 15 },
            { header: 'Peso Bruto (kg)', key: 'pesoBruto', width: 15 },
            { header: 'Altura (cm)', key: 'altura', width: 15 },
            { header: 'Largura (cm)', key: 'largura', width: 15 },
            { header: 'Profundidade (cm)', key: 'profundidade', width: 15 },
            { header: 'Categoria ID', key: 'categoriaId', width: 15 }
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
            descricao: 'Descrição curta do produto exemplo',
            descricaoComplementar: 'Informações adicionais do produto',
            unidade: 'UN',
            marca: 'Marca Exemplo',
            gtin: '7891234567890',
            ncm: '85167100',
            cest: '2103100',
            pesoLiquido: 0.5,
            pesoBruto: 0.6,
            altura: 10,
            largura: 15,
            profundidade: 20,
            categoriaId: 12345
        });

        // Adicionar legendas e informações de ajuda
        worksheet.addRow([]);
        worksheet.addRow(['* Campos obrigatórios']);
        worksheet.addRow(['Unidades aceitas: UN, PC, CX, KG, MT, M2, M3, etc']);
        worksheet.addRow(['NCM: Nomenclatura Comum do Mercosul - 8 dígitos']);
        worksheet.addRow(['CEST: Código Especificador da Substituição Tributária']);
        
        // Estilizar legendas
        for (let i = worksheet.rowCount - 3; i <= worksheet.rowCount; i++) {
            worksheet.getRow(i).font = { italic: true, color: { argb: 'FF808080' } };
        }

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

export async function listProducts(token) {
    try {
        const response = await fetch('https://www.bling.com.br/Api/v3/produtos', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
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

export async function createProduct(product, token) {
    try {
        const payload = {
            nome: product.nome,
            codigo: product.codigo,
            preco: product.preco,
            tipo: product.tipo || 'P',         // P = Produto, S = Serviço
            situacao: product.situacao || 'A',  // A = Ativo, I = Inativo
            formato: product.formato || 'S',    // S = Simples, K = Kit
            descricaoCurta: product.descricao,
            descricaoComplementar: product.descricaoComplementar,
            unidade: product.unidade || 'UN',
            gtin: product.gtin || '',           // Código de barras
            gtinEmbalagem: product.gtinEmbalagem || '',
            marca: product.marca,
            categoria: product.categoriaId ? {
                id: product.categoriaId
            } : undefined,
            dimensoes: {
                largura: product.largura || 0,
                altura: product.altura || 0,
                profundidade: product.profundidade || 0,
                unidadeMedida: product.unidadeMedida || 1  // 1 = Centímetros
            },
            pesoLiquido: product.pesoLiquido || 0,
            pesoBruto: product.pesoBruto || 0,
            volumes: product.volumes || 1,
            itensPorCaixa: product.itensPorCaixa || 1,
            tributacao: {
                origem: product.origem || 0,  // 0 = Nacional
                ncm: product.ncm || '',
                cest: product.cest || ''
            }
        };

        const response = await fetch('https://www.bling.com.br/Api/v3/produtos', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
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