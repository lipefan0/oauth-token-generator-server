import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import corsOptions from './config/cors.js';
import limiter from './config/rate-limit.js';
import authRoutes from './routes/auth.routes.js';
import productsRoutes from './routes/products.routes.js'; // Nova importação
import accountsPayableRoutes from './routes/accounts-payble.routes.js';
import accountsReceivableRoutes from './routes/accounts-receivable.routes.js';
import customersRoutes from './routes/customers.routes.js'
import referenceRoutes from './routes/reference.routes.js';

const app = express();

app.use(limiter);
app.use(cors(corsOptions));
app.use(express.json());

// Health check routes
app.get('/', (req, res) => {
    res.status(200).json({
        status: 'online',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Rotas
app.use('/auth', authRoutes);
app.use('/products', productsRoutes); // Novas rotas
app.use('/accounts/payble', accountsPayableRoutes);
app.use('/accounts/receivable', accountsReceivableRoutes);
app.use('/customers', customersRoutes);
app.use('/reference', referenceRoutes);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Algo deu errado!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT} - ${new Date().toISOString()}`);
});