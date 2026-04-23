import Partrequest from '../models/partrequest.model.js';
import { sendAdminNotification } from '../backend/services/partMailer.js';
import { sendAdminText } from "../backend/services/partText.js";

export const getPartrequests  = async (req, res) =>{
 try {
        const part = await Partrequest.find({});
        res.status(200).json(part);
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
}

export const getPartrequest = async (req, res) =>{
    try {
        const {id} = req.params;
        const partrequest = await Partrequest.findById(id);
        res.status(200).json(partrequest);
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
}

export const createPartrequest = async (req, res) => {
    try {
        const savedRequest = await Partrequest.create(req.body);
        await sendAdminNotification({
            name: savedRequest.name,
            email: savedRequest.email,
            phoneNumber: savedRequest.phoneNumber,
            partName: savedRequest.partName,
            message: savedRequest.AdditionalInformation || savedRequest.message
        });

        await sendAdminText({
            name: savedRequest.name,
            email: savedRequest.email,
            phoneNumber: savedRequest.phoneNumber,
            partName: savedRequest.partName,
            message: savedRequest.AdditionalInformation || savedRequest.message
        });

        return res.status(201).json({ 
            message: "Request sent.",
            data: savedRequest 
        });

    } catch (error) {
        console.error("Part Request Error:", error.message);
        
        if (!res.headersSent) {
        return res.status(500).json({ error: "Failed to process part request." });
        }
    }
        
}

export const updatePartrequest = async (req, res) => {
     try {
        const {id} = req.params;
        const partrequest = await Partrequest.findByIdAndUpdate(id, req.body);
        if(!partrequest){
            return res.status(404).json({message: "Part request not found"});
        }
        const updatePartrequest = await Partrequest.findById(id);
        res.status(200).json(updatePartrequest);
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
}

export const deletePartrequest = async (req, res) => {
     try {
        const {id} = req.params;
        const partrequest = await Partrequest.findByIdAndDelete(id, req.body);
        if(!partrequest){
            return res.status(404).json({message: "Part request not found"});
        }
        res.status(200).json({message:"part request was successfully deleted"});
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
}
export const getPendingParts = async (req, res) => {
  try {
    const count = await Partrequest.countDocuments({ status: "To-do" });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
