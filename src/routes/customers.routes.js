import express from 'express';
import multer from 'multer';
import { CustomersController } from '../controllers/customers.controller.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', CustomersController.create);
router.post('/upload', upload.single('file'), CustomersController.uploadBulk);
router.get('/template', CustomersController.downloadTemplate);

export default router;