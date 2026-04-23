import express from "express";
import Manufacturer from '../models/manufacturer.model.js';
const router = express.Router();
import {getManufacturers, getManufacturer, createManufacturer, updateManufacturer, deleteManufacturer} from '../controller/manufacturer.controller.js';



router.get('/', getManufacturers);

router.get("/:id",getManufacturer);

router.post("/", createManufacturer);

router.put("/:id", updateManufacturer);

router.delete("/:id", deleteManufacturer);

export default router;