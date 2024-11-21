import 'dotenv/config';
import * as blingService from '../services/bling.service.js';

const REDIRECT_URI = 'https://app-projeto.api-contis.tech/auth/callback'
export async function handleCallback(req, res) {
    const { code, state } = req.query;
    const frontendUrl = process.env.FRONTEND_URL?.replace(/\/$/, '');
    
    if (!frontendUrl) {
        return res.status(500).json({ error: 'FRONTEND_URL não configurada' });
    }
    
    const redirectUrl = `${frontendUrl}/?code=${code}&state=${state}`;
    res.redirect(redirectUrl);
}

// src/controllers/auth.controller.js
export async function handleExchangeToken(req, res) {
    const { code, clientId, clientSecret } = req.body;
    
    console.log('Dados recebidos:', {
        code,
        clientId,
        clientSecret,
        redirectUri: REDIRECT_URI
    });
    
    if (!REDIRECT_URI) {
        return res.status(500).json({ error: 'CALLBACK_URL não configurada' });
    }
    
    try {
        const tokenData = await blingService.exchangeToken(code, clientId, clientSecret, REDIRECT_URI);
        
        // Log do token recebido (sem expor dados sensíveis)
        console.log('Token obtido com sucesso:', {
            access_token: tokenData.access_token ? 'presente' : 'ausente',
            expires_in: tokenData.expires_in,
            token_type: tokenData.token_type,
            scope: tokenData.scope ? 'presente' : 'ausente'
        });
        
        // Retorna os dados do token diretamente
        return res.json(tokenData);
    } catch (error) {
        console.error('Exchange token error detalhado:', {
            message: error.message,
            stack: error.stack
        });
        
        return res.status(500).json({ 
            error: error.message,
            details: error.response?.data || {}
        });
    }
}

export async function verifyToken(req, res) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const isValid = await blingService.verifyToken(token);
        if (isValid) {
            res.json({ valid: true });
        } else {
            res.status(401).json({ valid: false, error: 'Token inválido ou expirado' });
        }
    } catch (error) {
        console.error('Verify token error:', error);
        res.status(500).json({ error: 'Erro ao verificar token' });
    }
}