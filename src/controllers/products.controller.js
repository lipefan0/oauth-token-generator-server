import * as productsService from '../services/products.service.js';

export async function createProduct(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const productData = req.body;
        
        // Validação básica
        if (!productData.nome || !productData.codigo || !productData.preco) {
            return res.status(400).json({ 
                error: 'Dados inválidos',
                message: 'Nome, código e preço são obrigatórios'
            });
        }

        const result = await productsService.createProduct(productData, token);
        res.status(201).json(result);
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error);
        res.status(500).json({ 
            error: 'Erro ao cadastrar produto',
            message: error.message
        });
    }
}


export async function uploadProducts(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    try {
        const results = await productsService.processExcelProducts(req.file.buffer, token);
        res.status(200).json({
            message: 'Processamento concluído',
            ...results
        });
    } catch (error) {
        console.error('Erro no processamento do Excel:', error);
        res.status(500).json({ 
            error: 'Erro no processamento do arquivo',
            message: error.message
        });
    }
}

export async function downloadTemplate(req, res) {
    try {
        const buffer = await productsService.getExcelTemplate();

        res.setHeader('Content-Disposition', 'attachment; filename="template_produtos.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Length', buffer.length);
        
        res.send(buffer);
    } catch (error) {
        console.error('Erro ao gerar template:', error);
        res.status(500).json({
            error: 'Erro ao gerar template',
            message: error.message
        });
    }
}