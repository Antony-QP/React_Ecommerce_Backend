const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
        maxlength: 32,
        text: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000,
        text: true
    },
    price: {
        type: Number,
        trim: true,
        required: true,
        maxlength: 32,
    },
    category: {
        type: ObjectId,
        ref: "Category"
    },
    quantity: {
        type: Number,
    },
    images: {
        type: Array
    },
    shipping: {
        type: String,
        enum: ['Yes', "No"]
    },
    color: {
        type: String,
        enum: ["Black", "Grey", "Silver", "White", "Blue"]
    },
    brand: {
        type: String,
        enum: ["Apple", "Samsung", "Microsoft", "ASUS", "Toshiba", "Lenovo"]
    },
    sold: {
        type: Number,
        default: 0,
      },      
    ratings: [{
        star: Number,
        postedBy: {type: ObjectId, ref: 'User'}
    }]
}, 
{timestamps: true}
);

module.exports = mongoose.model("Product", productSchema)