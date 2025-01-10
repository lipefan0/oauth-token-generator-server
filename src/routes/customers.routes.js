import express from 'express';
import multer from 'multer';
import { CustomersController, downloadErrors } from '../controllers/customers.controller.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', CustomersController.create);
router.post('/upload', upload.single('file'), CustomersController.uploadBulk);
router.get('/template', CustomersController.downloadTemplate);
router.get('/errors', downloadErrors);

export default router;