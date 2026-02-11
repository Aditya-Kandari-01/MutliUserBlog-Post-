const mongoose = require('mongoose')
const schema = mongoose.Schema;
const UserSchema = new schema ({
    username:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true
    },
    image:{
        type:String,
        default:'/img/default.jpg'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
module.exports=mongoose.model('User',UserSchema)
