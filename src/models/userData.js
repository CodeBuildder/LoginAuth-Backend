const mongoose = require('mongoose')


const userDataSchema = new mongoose.Schema( {

    name:{
        type:String,
        required:true,
        trim:true             
    },
    hobbies:{
        type:String,
        required:true
    },
    contact:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'User'
    },
    admin:{
        type: String,
        ref: 'UserData'
    }

},  {
        timestamps:true
})

const UserData = mongoose.model('UserData', userDataSchema)

module.exports = UserData