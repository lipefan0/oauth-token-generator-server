import ExcelJS from 'exceljs';
import { getPortadores, getCategorias, getFormasPagamento } from './reference.service.js'; 

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function createAccountPayable(accountData, token) {
    try {
        const payload = {
            vencimento: accountData.vencimento,
            competencia: accountData.competencia,
            dataEmissao: accountData.dataEmissao,
            valor: accountData.valor,
            contato: {
                id: accountData.contato.id
            },
            ocorrencia: {
                tipo: accountData.ocorrencia.tipo || 1
            }
        };

        // Adicionar campos opcionais apenas se existirem
        if (accountData.numeroDocumento) {
            payload.numeroDocumento = accountData.numeroDocumento;
        }
        if (accountData.historico) {
            payload.historico = accountData.historico;
        }
        if (accountData.formaPagamento?.id) {
            payload.formaPagamento = {
                id: accountData.formaPagamento.id
            };
        }
        if (accountData.portador?.id) {
            payload.portador = {
                id: accountData.portador.id
            };
        }
        if (accountData.categoria?.id) {
            payload.categoria = {
                id: accountData.categoria.id
            };
        }

        const response = await fetch('https://www.bling.com.br/Api/v3/contas/pagar', {
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

export async function processExcelAccountsPayable(buffer, token) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    
    const worksheet = workbook.getWorksheet(1);
    
    if (worksheet.rowCount <= 1) {
        return {
            message: "Planilha vazia",
            error: "A planilha não contém contas para importar. Por favor, utilize o template fornecido."
        };
    }

    const results = {
        message: 'Processamento concluído',
        total: 0,
        success: 0,
        errors: [],
        processedItems: []
    };

    for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
        const row = worksheet.getRow(rowNumber);
        
        // Verificar se a linha tem dados
        const vencimento = row.getCell('A').value;
        const competencia = row.getCell('B').value;
        const dataEmissao = row.getCell('C').value;
        const valor = row.getCell('D').value;
        const contatoId = row.getCell('E').value;

        // Pular linhas vazias
        if (!vencimento && !competencia && !dataEmissao && !valor && !contatoId) {
            continue;
        }

        results.total++;

        try {
            const account = {
                vencimento: vencimento instanceof Date ? 
                    vencimento.toISOString().split('T')[0] : vencimento,
                competencia: competencia instanceof Date ? 
                    competencia.toISOString().split('T')[0] : competencia,
                dataEmissao: dataEmissao instanceof Date ? 
                    dataEmissao.toISOString().split('T')[0] : dataEmissao,
                valor: Number(valor),
                contato: {
                    id: Number(contatoId)
                },
                ocorrencia: {
                    tipo: 1
                },
                // Novos campos opcionais
                numeroDocumento: row.getCell('F').value?.toString(),
                historico: row.getCell('G').value?.toString(),
                formaPagamento: row.getCell('H').value ? {
                    id: Number(row.getCell('H').value)
                } : undefined,
                portador: row.getCell('I').value ? {
                    id: Number(row.getCell('I').value)
                } : undefined,
                categoria: row.getCell('J').value ? {
                    id: Number(row.getCell('J').value)
                } : undefined
            };

            // Validação dos campos obrigatórios
            const camposFaltantes = [];
            if (!account.vencimento) camposFaltantes.push('Vencimento');
            if (!account.competencia) camposFaltantes.push('Competência');
            if (!account.dataEmissao) camposFaltantes.push('Data de Emissão');
            if (!account.valor) camposFaltantes.push('Valor');
            if (!account.contato.id) camposFaltantes.push('ID do Contato');

            if (camposFaltantes.length > 0) {
                throw new Error(`Campos obrigatórios ausentes: ${camposFaltantes.join(', ')}`);
            }

            // Aguardar 500ms antes de cada requisição
            await delay(500);

            const response = await createAccountPayable(account, token);
            results.success++;
            results.processedItems.push({
                index: rowNumber - 1,
                status: 'success',
                conta: response
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

// src/services/accounts-payable.service.js
export async function getExcelTemplate(token) {
    const workbook = new ExcelJS.Workbook();
    
    // Planilha principal de Contas a Pagar
    const worksheetPrincipal = workbook.addWorksheet('Contas a Pagar');

    // Configurar a planilha principal
    worksheetPrincipal.columns = [
        { header: 'Vencimento*', key: 'vencimento', width: 15 },
        { header: 'Competência*', key: 'competencia', width: 15 },
        { header: 'Data Emissão*', key: 'dataEmissao', width: 15 },
        { header: 'Valor*', key: 'valor', width: 15 },
        { header: 'ID do Contato*', key: 'contatoId', width: 15 },
        { header: 'Nº Documento', key: 'numeroDocumento', width: 20 },
        { header: 'Histórico', key: 'historico', width: 40 },
        { header: 'ID Forma Pagamento', key: 'formaPagamentoId', width: 20 },
        { header: 'ID Portador', key: 'portadorId', width: 15 },
        { header: 'ID Categoria', key: 'categoriaId', width: 15 }
    ];

    // Exemplo na planilha principal
    const hoje = new Date().toISOString().split('T')[0];
    worksheetPrincipal.addRow({
        vencimento: '2024-03-25',
        competencia: '2024-03-25',
        dataEmissao: hoje,
        valor: 1500.75,
        contatoId: 16993759185
    });

    try {
        // Buscar dados de referência
        const [portadores, formasPagamento, categorias] = await Promise.all([
            getPortadores(token),
            getFormasPagamento(token),
            getCategorias(token)
        ]);

        // Planilha de Portadores
        const worksheetPortadores = workbook.addWorksheet('Portadores');
        worksheetPortadores.columns = [
            { header: 'ID', key: 'id', width: 15 },
            { header: 'Descrição', key: 'descricao', width: 50 }
        ];
        if (portadores.data) {
            portadores.data.forEach(portador => {
                worksheetPortadores.addRow({
                    id: portador.id,
                    descricao: portador.descricao
                });
            });
        }

        // Planilha de Formas de Pagamento
        const worksheetFormas = workbook.addWorksheet('Formas Pagamento');
        worksheetFormas.columns = [
            { header: 'ID', key: 'id', width: 15 },
            { header: 'Descrição', key: 'descricao', width: 50 }
        ];
        if (formasPagamento.data) {
            formasPagamento.data.forEach(forma => {
                worksheetFormas.addRow({
                    id: forma.id,
                    descricao: forma.descricao
                });
            });
        }

        // Planilha de Categorias
        const worksheetCategorias = workbook.addWorksheet('Categorias');
        worksheetCategorias.columns = [
            { header: 'ID', key: 'id', width: 15 },
            { header: 'Descrição', key: 'descricao', width: 50 }
        ];
        if (categorias.data) {
            categorias.data.forEach(categoria => {
                worksheetCategorias.addRow({
                    id: categoria.id,
                    descricao: categoria.descricao
                });
            });
        }

        // Estilizar todas as planilhas
        [worksheetPrincipal, worksheetPortadores, worksheetFormas, worksheetCategorias].forEach(worksheet => {
            // Estilo do cabeçalho
            const headerRow = worksheet.getRow(1);
            headerRow.font = { bold: true, size: 11 };
            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFE0E0E0' }
            };
            
            // Ajustar largura automática
            worksheet.columns.forEach(column => {
                column.width = Math.max(column.width || 10, 15);
            });
        });

        // Adicionar instruções na planilha principal
        worksheetPrincipal.addRow([]);
        worksheetPrincipal.addRow(['* Campos obrigatórios']);
        worksheetPrincipal.addRow(['Consulte as outras abas para referência:']);
        worksheetPrincipal.addRow(['- Aba "Portadores"']);
        worksheetPrincipal.addRow(['- Aba "Formas Pagamento"']);
        worksheetPrincipal.addRow(['- Aba "Categorias"']);
        
        // Formatação das instruções
        for (let i = worksheetPrincipal.rowCount - 4; i <= worksheetPrincipal.rowCount; i++) {
            worksheetPrincipal.getRow(i).font = { italic: true, color: { argb: 'FF808080' } };
        }
        
    } catch (error) {
        console.error('Erro ao buscar dados de referência:', error);
        worksheetPrincipal.addRow([]);
        worksheetPrincipal.addRow(['Não foi possível carregar os dados de referência. Por favor, gere o template novamente.']);
    }

    return await workbook.xlsx.writeBuffer();
}