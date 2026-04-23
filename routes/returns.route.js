import express from "express";
import returns from '../models/returns.model.js';
import {
    getReturn, 
    getPendingReturnCount,
    createReturn, 
    updateReturn, 
    deleteReturn
} from '../controller/returns.controller.js';

const router = express.Router();

router.get('/', getReturn);
router.get("/pending-returns", getPendingReturnCount); 
router.post("/", createReturn);
router.put("/:id", updateReturn);
router.delete("/:id", deleteReturn);

export default router;