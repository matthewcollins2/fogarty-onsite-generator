import express from "express";
import { createInvoice } from "../services/createInvoice.js";
import { createCustomer } from "../services/createCustomer.js";

const router = express.Router();

router.post("/create", async (req, res) => {

  try {

    // For debugging: log the incoming request body
    //console.log("Incoming request:", req.body);
    
    const { name, email, items } = req.body;
    //console.log("Incoming items:", items);
    const customer = await createCustomer(name, email);
    const invoice = await createInvoice( customer.id, items );

    res.json({
      success: true,
      invoiceNumber: invoice.invoiceNumber,
      viewUrl: invoice.viewUrl
    });

  } catch (err) {

    console.error("Invoice creation error:", err);

    res.status(500).json({
      error: err.message
    });

  }

});

export default router;