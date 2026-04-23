import express from 'express';
const router = express.Router();
import { getContent, updateContent } from '../controller/pagecontent.controller.js';

router.get('/:pageName', getContent);
router.put('/:pageName', updateContent);

export default router;