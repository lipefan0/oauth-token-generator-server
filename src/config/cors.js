// config/cors.js
export const allowedOrigins = [
    'http://localhost:3000',
    'https://contis-projeto.vercel.app',
    'https://contis-projeto.vercel.app/'
];

const corsOptions = {
    origin: function(origin, callback) {
        // Log para debug
        console.log('Request origin:', origin);
        
        // Permite requests sem origin em desenvolvimento
        if (!origin || process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'X-Requested-With',
        'Origin'
    ],
    exposedHeaders: ['Content-Range', 'X-Total-Count'],
    maxAge: 86400
};

export default corsOptions;