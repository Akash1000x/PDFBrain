import { Router } from 'express'
import { uploadPdfController } from '../controllers/upload.controller.js';
import { upload } from '../middleware/multer.js';
import { queryRewritingRagChatController } from '../controllers/rags/basic.js';
import { multiQueryRagChatController } from '../controllers/rags/multi-query.js';
import { queryDecompositionRagChatController } from '../controllers/rags/query-decomposition.js';

const router: Router = Router()


router.post("/upload", upload.single("pdf"), uploadPdfController)
router.post("/query-rewriting-rag-chat", queryRewritingRagChatController)
router.post("/multi-query-rag-chat", multiQueryRagChatController)
router.post("/query-decomposition-rag-chat", queryDecompositionRagChatController)

export default router;