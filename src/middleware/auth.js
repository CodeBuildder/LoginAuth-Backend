const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) =>{
//         if(req.user == null) {
//             res.status(403).send('Sign in required.')
//         }

//             next()
// }

    try{

            const token = req.header('Authorization').replace('Bearer ', '')
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

            if(!user){
                throw new Error()
            }

            req.token = token
            req.user = user
            next()

    }catch(e){

        console.log('error here auth.')
        res.status(401).send({error: 'Authentication error.'})

    }
    
}



module.exports =  auth


