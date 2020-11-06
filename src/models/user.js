const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const UserData = require('./userData')

const userSchema = new mongoose.Schema({

    email: {   
        type:String,
        unique:true,    
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid.')
            }
        }
    },

    password:{
        type:String,
        required:true,
        trim:true,
        minlength: 7,
        validate(value){
            if(value.toLowerCase().includes('password'))
                throw new Error('Password cannot contain the phrase password!')
        }
    },

    role: {
        type:String,
        required:true,
    },

    tokens:[{

        token:{
            type:String,
            required:true,
        }

    }],
    avatar:{
        type:Buffer
    }
 
}, {

    timestamps:true

})

userSchema.virtual('userDatas', {
    ref: 'UserData',
    localField: '_id',
    foreignField: 'user'

},

    {
        ref: 'UserData',
        localField:'_id',
        foreignField: 'admin'
    }

)



userSchema.statics.findByCredentials = async (email, password) =>{

    const user = await User.findOne({email})

    if(!user){
        console.log('error here')
        throw new Error('User does not exist!')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        console.log('error here')
        throw new Error('Password is incorrect.')
    }
    console.log(isMatch)
    return user
    
}

userSchema.methods.generateAuthToken = async function () {

    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token

}

userSchema.methods.toJSON = function () {

    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject

}


//Hash password
userSchema.pre('save', async function(next) {

    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()

})

userSchema.pre('remove', async function (next) {
    const user = this
    await UserData.deleteMany({ user: user._id })


    next()
})

const User = mongoose.model('User', userSchema)


module.exports = User

