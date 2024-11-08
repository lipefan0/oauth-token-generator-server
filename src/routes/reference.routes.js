// src/routes/reference.routes.js
import express from 'express';
import ReferenceController from '../controllers/reference.controller.js';

const router = express.Router();

router.get('/formas-pagamento', ReferenceController.getFormasPagamento);
router.get('/portadores', ReferenceController.getPortadores);
router.get('/categorias', ReferenceController.getCategorias);

export default router;