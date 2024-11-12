// config/rate-limit.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite por IP
  standardHeaders: true,
  legacyHeaders: false,
  trustProxy: true, // Habilita confiança no proxy
  keyGenerator: (req) => {
    // Usa o IP real considerando o proxy
    return req.ip || 
           req.headers['x-forwarded-for'] || 
           req.connection.remoteAddress;
  }
});

export default limiter;