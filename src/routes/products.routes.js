import express from 'express';
import * as productsController from '../controllers/products.controller.js';
import { upload } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.post('/', productsController.createProduct);
router.get('/', productsController.listProducts);
router.post('/upload', upload.single('file'), productsController.uploadProducts);
router.get('/template', productsController.downloadTemplate);

export default router;