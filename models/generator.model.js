import mongoose from 'mongoose';

const GeneratorSchema = mongoose.Schema(
    {
        genID: {
            type: String,
            required: false,
            default: ""
        },

        Serial_Number: {
            type: String,
            required: true,
            default: ""
        },

        name: {
            type: String,
            required: true,
            default: ""
        },

        Description : {
            type: String,
            required: true,
            default: ""
        },

        Stock : {
            type: Number,
            required: true,
            default: ""
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
        
    },
    {
        timestamps: true,
    }
);

const Generator = mongoose.model("Generator", GeneratorSchema);

export default Generator