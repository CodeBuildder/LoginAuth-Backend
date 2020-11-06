
const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')

const User = require('../models/user')
const router = new express.Router()


router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try{

        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token})

    }catch(e){
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {

    try{

        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })

    }catch(e){

            res.status(400).send({error:'Invalid Email or Password. Please try again.'})
    }

})

router.post('/users/logout', auth, async(req, res) => {

    try{

        req.user.tokens = req.user.tokens.filter((token) => {

            return token.token !== req.token

        })

        await req.user.save()
        res.send()

    }catch(e){
        res.status(500).send()
    }


})

router.post('/users/logoutAll', auth, async(req, res) => {

    try{

        req.user.tokens = [] 
        
        await req.user.save()
        res.send()

    }catch(e){
        res.status(500).send()
    }


})

router.get('/admin/users', auth,  async (req, res) =>{

    try{

        const users = await User.find({})
        res.send(users)

    }catch(e){
        console.log('line84here')
        res.status(401).send(e)
    }
    res.send(req.user)
})  

router.get('/users/me', auth,  async (req, res) =>{

    res.send(req.user)
})    
   
router.get('/admin', auth, async (req, res) => {

    res.send(req.user)
})

router.patch('/users/me', auth,  async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'age', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
      return res.status(400).send({ error : 'Invalid update data!' })
    }


    try{

            updates.forEach((update) => req.user[update] = req.body[update])
            await req.user.save()
            res.status(200).send(req.user)

    }catch(e){

        res.status(400).send(e)

    }
})

router.delete('/users/me', auth, async (req, res) => {

    try{

        await req.user.remove()
        res.status(201).send(req.user)
    }
    catch(e){

        res.status(400).send({error:'ID does not exist!'})

    }
    

})

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb (new Error('Please upload an Image file.'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

    const buffer = await sharp (req.file.buffer).resize({ 
        width:250,
         height:250 
        }).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()
    res.send()
   },(error, req, res, next) => {

    res.status(400).send({error:error.message})
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()

    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    
    try{

        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            res.staus(401).send({error:'Does not exist.'})
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)

    }catch(e){

            res.status(404).send()

    }req.user.avatar = undefined

    await req.user.save()
    res.send()
})

module.exports = router