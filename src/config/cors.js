// config/cors.js
export const allowedOrigins = [
    'http://localhost:3000',
    'https://contis-projeto.vercel.app',
    'https://contis-projeto.vercel.app/'
];

const corsOptions = {
    origin: function(origin, callback) {
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
};

export default corsOptions;