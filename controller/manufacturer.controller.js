import Manufacturer from '../models/manufacturer.model.js';

export const getManufacturers = async (req, res) =>{
 try {
        const man = await Manufacturer.find({});
        res.status(200).json(man);
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
}

export const getManufacturer = async (req, res) =>{
    try {
        const {id} = req.params;
        const man = await Manufacturer.findById(id);
        res.status(200).json(man);
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
}

export const createManufacturer = async (req, res) => {
        try {
        const man = await Manufacturer.create(req.body);
        res.status(200).json({message: "Manufacturer created!"})
    } catch (error) {
        res.status(500).json({message: error.message});
    }
    
}

export const updateManufacturer = async (req, res) => {
     try {
        const {id} = req.params;
        const man = await Generator.findByIdAndUpdate(id, req.body);
        if(!man){
            return res.status(404).json({message: "Manufacturer not found"});
        }
        const updatedMan = await Manufacturer.findById(id);
        res.status(200).json(updatedMan);
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
}

export const deleteManufacturer = async (req, res) => {
     try {
        const {id} = req.params;
        const gen = await Generator.findByIdAndDelete(id, req.body);
        if(!gen){
            return res.status(404).json({message: "Generator not found"});
        }
        res.status(200).json({message:"Generator was successfully deleted"});
    } catch (error) {
        res.status(500).json({message: error.message});
        
    }
};
