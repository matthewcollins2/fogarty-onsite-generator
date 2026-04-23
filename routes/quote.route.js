import express from "express";
import Quote from '../models/quote.model.js';
const router = express.Router();
import {getQuotes, getQuote, updateQuote, deleteQuote, setAcknowledged,getPendingQuotes} from '../controller/quote.controller.js';
import { set } from "mongoose";
import { createQuote } from "../controller/quote.controller.js";


router.get("/", getQuotes);
router.get("/pending-quotes", getPendingQuotes);
router.get("/:id", getQuote);
router.post("/", createQuote);
router.put("/:id", updateQuote);
router.delete("/:id", deleteQuote);
router.patch("/:id/acknowledge", setAcknowledged);


export default router;