// src/middleware/cors.middleware.js
const cors = require('cors');

const corsOptions = {
  origin: [
    'http://localhost:3000',   // Development
    'https://contis-projeto.vercel.app/', // Production
    /\.vercel\.app$/,         // Todos os domínios Vercel
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,  // Permite envio de cookies e headers de autenticação
  maxAge: 86400,     // Cache preflight por 24 horas
};

// Middleware para rotas específicas
const corsMiddleware = cors(corsOptions);

// Middleware para todas as rotas
const setupCors = (app) => {
  // Middleware global
  app.use(cors(corsOptions));
  
  // Headers adicionais de segurança
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Expose-Headers', 'Content-Range');
    next();
  });
  
  // Tratamento de OPTIONS preflight
  app.options('*', cors(corsOptions));
};

module.exports = { corsMiddleware, setupCors };

// src/index.js ou src/app.js
const express = require('express');
const { setupCors } = require('./middleware/cors.middleware');

const app = express();

// Configurar CORS antes de todas as rotas
setupCors(app);

// Suas rotas e outros middlewares aqui...

// Tratamento de erros CORS
app.use((err, req, res, next) => {
  if (err.name === 'CORSError') {
    res.status(403).json({
      error: 'CORS Error',
      message: 'Not allowed by CORS',
      details: err.message
    });
  } else {
    next(err);
  }
});