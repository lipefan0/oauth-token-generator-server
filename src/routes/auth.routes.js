import express from 'express';
import { handleCallback, handleExchangeToken, verifyToken } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/callback', handleCallback);
router.post('/exchange-token', handleExchangeToken);
router.get('/verify-token', verifyToken);

export default router;