
const express = require('express')
const auth = require('../middleware/auth')


const User = require('../models/user')
const router = new express.Router()


router.post("/admin/login", async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.body.Password });
  
      const token = await user.generateAuthToken();
      res.send({ user, token });
    } catch (e) {
      res
        .status(400)
        .send({ error: "Invalid Email or Password. Please try again." });
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

 

router.get('/users/me', auth,  async (req, res) =>{

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




module.exports = router