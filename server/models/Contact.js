const mongoose = require('mongoose')
const contact_schema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type: String,
        required: true,
        match: [/^\S+@\S+\.\S+$/, 'Invalid email format']
    },
    message:{
        type: String, 
        required: true 
    },
    sentAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model('Contact',contact_schema)