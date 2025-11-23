import { Router } from 'express'
import { uploadPdfController } from '../controllers/upload.controller.js';
import { upload } from '../middleware/multer.js';
import { simpleRagChatController, multiQueryRagChatController } from '../controllers/chat.controller.js';

const router: Router = Router()


router.post("/upload", upload.single("pdf"), uploadPdfController)
router.post("/simple-rag-chat", simpleRagChatController)
router.post("/multi-query-rag-chat", multiQueryRagChatController)

export default router;