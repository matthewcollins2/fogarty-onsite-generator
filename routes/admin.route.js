import express from "express";
import Admin from '../models/admin.model.js';
const router = express.Router();
import {getAdmins, getAdmin, createAdmin, updateAdmin, deleteAdmin, loginAdmin, checkAuth, logoutAdmin, } from '../controller/admin.controller.js';




// keep checkAuth at top bacause it collides with getAdmin and other routes
router.get("/checkAuth", checkAuth);

router.post('/login', loginAdmin);

router.post("/logout", logoutAdmin);

router.get("/", getAdmins);

router.get("/:id", getAdmin);

router.post("/", createAdmin);

router.put("/:id", updateAdmin);

router.delete("/:id", deleteAdmin);





export default router;