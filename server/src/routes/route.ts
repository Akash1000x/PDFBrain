import { Router } from 'express'
import { uploadPdfController } from '../controllers/upload.controller.js';
import { upload } from '../middleware/multer.js';
import { chatController } from '../controllers/chat.controller.js';

const router: Router = Router()


router.post("/upload", upload.single("pdf"), uploadPdfController)
router.post("/chat", chatController)

export default router;