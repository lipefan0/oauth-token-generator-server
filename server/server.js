import express from 'express';
import cors from 'cors';

const app = express();

// Lista de origens permitidas
const allowedOrigins = [
    'http://localhost:3000',
    'https://oauth-token-generator.vercel.app',
    'https://oauth-token-generator.vercel.app/'
];

// Configuração CORS mais detalhada
app.use(cors({
    origin: function(origin, callback) {
        // Permitir requests sem origin (como apps mobile ou Postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());

// Health check para o Render
app.get('/', (req, res) => {
    res.status(200).send('Server is running');
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Rota de callback
app.get('/callback', (req, res) => {
    const { code, state } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/?code=${code}&state=${state}`;
    res.redirect(redirectUrl);
});

app.post('/exchange-token', async (req, res) => {
    const { code, clientId, clientSecret } = req.body;
    const REDIRECT_URI = process.env.CALLBACK_URL || "http://localhost:8080/callback";
    
    try {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        
        const response = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI
            }).toString()
        });

        const responseText = await response.text();

        if (!response.ok) {
            throw new Error(responseText);
        }

        res.json(JSON.parse(responseText));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});