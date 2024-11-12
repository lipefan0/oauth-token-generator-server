import * as accountsService from '../services/accounts-receivable.service.js';

export async function createAccount(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const accountData = req.body;
        
        // Validação dos campos obrigatórios
        const camposObrigatorios = ['vencimento', 'competencia', 'dataEmissao', 'valor', 'contato'];
        const camposFaltantes = camposObrigatorios.filter(campo => {
            if (campo === 'contato') {
                return !accountData.contato?.id;
            }
            return !accountData[campo];
        });

        if (camposFaltantes.length > 0) {
            return res.status(400).json({ 
                error: 'Dados inválidos',
                message: `Campos obrigatórios ausentes: ${camposFaltantes.join(', ')}`
            });
        }

        const result = await accountsService.createAccountReceivable(accountData, token);
        res.status(201).json(result);
    } catch (error) {
        console.error('Erro ao cadastrar conta:', error);
        res.status(500).json({ 
            error: 'Erro ao cadastrar conta',
            message: error.message
        });
    }
}

export async function uploadAccounts(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    try {
        const results = await accountsService.processExcelAccountsReceivable(req.file.buffer, token);
        res.status(200).json(results);
    } catch (error) {
        console.error('Erro no processamento do Excel:', error);
        res.status(500).json({ 
            error: 'Erro no processamento do arquivo',
            message: error.message
        });
    }
}

export async function downloadTemplate(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const template = await accountsService.getExcelTemplate(token);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=template_contas_receber.xlsx');
        
        res.send(template);
    } catch (error) {
        console.error('Erro ao gerar template:', error);
        res.status(500).json({ 
            error: 'Erro ao gerar template',
            message: error.message
        });
    }
}

export async function downloadTemplateTest(req, res) {
    try {
        const token = req.headers.authorization?.split(' ')[1] || 'seu-token-aqui'; // Para testes
        const template = await accountsService.getExcelTemplate(token);
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=template_contas_receber.xlsx');
        
        res.send(template);
    } catch (error) {
        console.error('Erro ao gerar template:', error);
        res.status(500).json({ 
            error: 'Erro ao gerar template',
            message: error.message
        });
    }
}