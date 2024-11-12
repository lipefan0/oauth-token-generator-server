import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import corsOptions, { allowedOrigins } from './config/cors.js';
import limiter from './config/rate-limit.js';
import authRoutes from './routes/auth.routes.js';
import productsRoutes from './routes/products.routes.js';
import accountsPayableRoutes from './routes/accounts-payble.routes.js';
import accountsReceivableRoutes from './routes/accounts-receivable.routes.js';
import customersRoutes from './routes/customers.routes.js';
import referenceRoutes from './routes/reference.routes.js';

const app = express();

// Configurar trust proxy antes de qualquer middleware
app.set('trust proxy', 1);

// Middleware de logging para debug
app.use((req, res, next) => {
    console.log('Request Details:', {
        ip: req.ip,
        originalUrl: req.originalUrl,
        method: req.method,
        origin: req.get('origin'),
        forwardedFor: req.get('x-forwarded-for'),
        realIp: req.get('x-real-ip')
    });
    next();
});

app.use(cors(corsOptions));
app.use(limiter);
app.use(express.json());

// Health check routes
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'online',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// Rotas
app.use('/auth', authRoutes);
app.use('/products', productsRoutes);
app.use('/accounts/payble', accountsPayableRoutes);
app.use('/accounts/receivable', accountsReceivableRoutes);
app.use('/customers', customersRoutes);
app.use('/reference', referenceRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        code: err.code
    });

    res.status(err.status || 500).json({ 
        error: 'Algo deu errado!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor',
        code: err.code
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} - ${new Date().toISOString()}`);
    console.log('Ambiente:', process.env.NODE_ENV);
});

export default app;