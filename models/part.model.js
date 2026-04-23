import mongoose from 'mongoose';

const PartSchema = mongoose.Schema(
    {
        partID: {
            type: String,
            required: false,
            default: ""
        },

        Part_Name: {
            type: String,
            required: true,
            default: ""
        },

        Stock: {
            type: Number,
            required: true,
            default: 0
        },

        Image_Url: {
            type: String,
            requried: false,
            default: ""
        },
         Image_Key: {
            type: String,
            required: false,
            default: "",
            },

        Image_Url2: {
            type: String,
            requried: false,
            default: ""
        },
         Image_Key2: {
            type: String,
            required: false,
            default: "",
            },

        Image_Url3: {
            type: String,
            requried: false,
            default: ""
        },
         Image_Key3: {
            type: String,
            required: false,
            default: "",
            },
        Image_Url4: {
            type: String,
            requried: false,
            default: ""
        },
         Image_Key4: {
            type: String,
            required: false,
            default: "",
        },
        Image_Url5: {
            type: String,
            requried: false,
            default: ""
        },
         Image_Key5: {
            type: String,
            required: false,
            default: "",
        },
        
        Description: {
            type: String,
            requried: false,
            default: ""
        },
       
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

const Part = mongoose.model("Part", PartSchema);

export default Part;