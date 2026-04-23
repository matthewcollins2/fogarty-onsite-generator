import Quote from '../models/quote.model.js';
import PageContent from '../models/pagecontent.model.js';
import { sendEmail } from "../backend/services/emailService.js";
import { quoteRequestTemplate } from "../backend/services/emailTemplates.js";
import { sendAdminNotification } from '../backend/services/quoteMailer.js';
import { sendAdminText } from "../backend/services/quoteText.js";

export const getQuotes = async (req, res) =>{
    try {
        // before sending results remove any stale documents based on admin setting
        let retentionDoc = await PageContent.findOne({ pageName: 'quoteRetentionDays' });
        let days = 365; // default
        if (retentionDoc) {
            if (!isNaN(Number(retentionDoc.content))) {
                days = Math.max(30, Math.min(365, Number(retentionDoc.content)));
            }
        } else {
            // create persistent default value so future requests have a record
            try {
                await PageContent.create({ pageName: 'quoteRetentionDays', content: '30' });
                days = 30;
            } catch {}
        }
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        // delete where updatedAt OR createdAt (whichever exists) is older than cutoff
        // handles documents that may not have all timestamp fields
        const result = await Quote.deleteMany({
            $or: [
                { updatedAt: { $lt: cutoff } },
                { createdAt: { $lt: cutoff } }
            ]
        });
        //console.log(`Deleted ${result.deletedCount} quotes`);

        const quotes = await Quote.find({}).sort({ acknowledged: 1, createdAt: 1 });
        res.status(200).json(quotes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getQuote = async (req, res) =>{
    try {
        const {id} = req.params;
        const quote = await Quote.findById(id);
        res.status(200).json(quote);
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
}

export const createQuote = async (req, res) => {
    try {
        const savedRequest = await Quote.create(req.body);

        // ADMIN TEXT
        await sendAdminText({
            name: savedRequest.name,
            email: savedRequest.email,
            phoneNumber: savedRequest.phoneNumber,
            genModel: savedRequest.genModel,
            genSerialNumber: savedRequest.genSerialNumber,
            message: savedRequest.additionalInfo
        });

        // CUSTOMER EMAIL
        await sendEmail(
            savedRequest.email,
            "Quote Request Received",
            quoteRequestTemplate({
                name: savedRequest.name,
                phone: savedRequest.phoneNumber,
                model: savedRequest.genModel,
                serial: savedRequest.genSerialNumber,
                notes: savedRequest.additionalInfo,
            })
        );

        // ADMIN EMAIL
        await sendAdminNotification({
            name: savedRequest.name,
            email: savedRequest.email,
            phoneNumber: savedRequest.phoneNumber,
            genModel: savedRequest.genModel,
            genSerialNumber: savedRequest.genSerialNumber,
            message: savedRequest.additionalInfo
        });

        return res.status(201).json({ 
            message: "Request sent.",
            data: savedRequest 
        });

    } catch (error) {
        console.error("Quote Creation Error:", error.message);
        
        if (!res.headersSent) {
            return res.status(500).json({ 
                error: "Failed to process request.", 
                details: error.message 
            });
        }
    }
}

export const updateQuote = async (req, res) => {
     try {
        const {id} = req.params;
        const quote = await Quote.findByIdAndUpdate(id, req.body);
        if(!quote){
            return res.status(404).json({message: "Quote not found"});
        }
        const updatedQuote = await Quote.findById(id);
        res.status(200).json(updatedQuote);
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
}

export const deleteQuote = async (req, res) => {
     try {
        const {id} = req.params;
        const quote = await Quote.findByIdAndDelete(id, req.body);
        if(!quote){
            return res.status(404).json({message: "Quote not found."});
        }
        res.status(200).json({message:"Quote was successfully deleted"});
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
}

export const setAcknowledged = async (req, res) => {
  try {
    const { id } = req.params;
    const { acknowledged } = req.body;
    const quote = await Quote.findByIdAndUpdate(
      id,
      { $set: { acknowledged: !!acknowledged } },
      { new: true }
    );
    if (!quote) return res.status(404).json({ message: "Quote not found" });
    res.status(200).json(quote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
export const getPendingQuotes = async (req, res) => {
  try {
    const count = await Quote.countDocuments({ acknowledged: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
