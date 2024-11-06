import express from 'express';
import * as accountsController from '../controllers/accounts-receivable.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

// Rotas principais
router.post('/', accountsController.createAccount);
router.post('/upload', upload.single('file'), accountsController.uploadAccounts);
router.get('/template', accountsController.downloadTemplate);

export default router;