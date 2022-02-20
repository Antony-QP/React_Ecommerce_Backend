const mongoose = require ('mongoose')

const categorySchema = new mongoose.Schema({
    name : {
        type : String,
        trim : true,
        required : true,
        minLength : [2, 'Too short'],
        maxLength : [32, 'Too long']
    },
    slug : {
        type : String,
        unique : true,
        lowercase : true,
        index  : true
    }
}, { timestamps : true })

module.exports = mongoose.model("Category", categorySchema)