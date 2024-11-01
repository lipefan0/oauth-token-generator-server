import 'dotenv/config';
import * as blingService from '../services/bling.service.js';

export async function handleCallback(req, res) {
    const { code, state } = req.query;
    const frontendUrl = process.env.FRONTEND_URL;
    
    if (!frontendUrl) {
        return res.status(500).json({ error: 'FRONTEND_URL não configurada' });
    }
    
    const redirectUrl = `${frontendUrl}/?code=${code}&state=${state}`;
    res.redirect(redirectUrl);
}

export async function handleExchangeToken(req, res) {
    const { code, clientId, clientSecret } = req.body;
    const REDIRECT_URI = process.env.CALLBACK_URL;
    
    if (!REDIRECT_URI) {
        return res.status(500).json({ error: 'CALLBACK_URL não configurada' });
    }
    
    try {
        const tokenData = await blingService.exchangeToken(code, clientId, clientSecret, REDIRECT_URI);
        res.json(tokenData);
    } catch (error) {
        console.error('Exchange token error:', error);
        res.status(500).json({ error: error.message });
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