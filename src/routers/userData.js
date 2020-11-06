const express = require('express')
const UserData = require('../models/userData')
const auth = require('../middleware/auth')
const authAdmin = require('../middleware/authAdmin')
const User = require('../models/user')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {

    //const task = new Task (req.body)

    const userData = new UserData ({
        ...req.body,
        user: req.user._id
    })
 
    try{
 
     await userData.save()
     res.status(201).send(userData)
 
    }catch(e){
 
     res.status(400).send(e)
 
    }
    
 }) 
 
 
 router.get('/admin/tasks', auth, async (req, res) => {
   
     try{
      
        const userData = await UserData.find({})
        res.send(userData)
      
    }catch(e){
         res.status(500).send(e)
    }
     
 })

 router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    
    if(req.query.completed){

        match.completed = req.query.completed === 'true'

    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1   
    }

     try{
         await req.user.populate({
             path:'userDatas',
             match,
             options:{
                 limit: parseInt(req.query.limit),
                 skip: parseInt(req.query.skip),
                 sort   
            }

        }).execPopulate()
       
        res.status(200).send(req.user.userData)
    }catch(e){
         res.status(500).send(e)
    }
     
 })
 
 router.get('/tasks/:id', auth, async (req, res) => {
     const _id = req.params.id
 
        try{
 
        const userData = await UserData.findOne({ _id, user: req.user._id})

         if(!userData){
             return res.status(401).send({error:'Data does not exist.'})
         }
 
         res.send(userData)
 
 
     }catch(e){
        
        console.log('error here')
         res.status(401).send(e)
 
     }
 
 })
 
 router.patch('/tasks/:id', auth, async (req, res) => {
 
     const updates = Object.keys(req.body)
     const allowedUpdates = ['name', 'hobbies', 'contact', 'address']
     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))
 
     if(!isValidOperation){
       return res.status(400).send({error : 'Invalid update data!'})
     }
 
 
     try{
           
        const userData = await UserData.findOne({ _id: req.params.id, user: req.user._id })    
        
        if(!userData){
            return res.status(404).send({error:'Task does not exist.'})
        }
             
        updates.forEach((update) => userData[update] = req.body[update])
        await userData.save()
        res.status(200).send(userData)
 
     }catch(e){
 
         res.status(400).send(e)
 
     }
 })
 
 router.delete('/tasks/:id', auth, async (req, res) => {
 
     try{
 
         const userData = await UserData.findById({ _id: req.params.id, user: req.user._id })

         if(!task){
             return req.status(404).send({error:'Data does not exist.'})
         }
 
         res.status(201).send(userData)
 
     }
     catch(e){
 
         res.status(500).send({error:'Invalid task. Please Enter appropriate authentication.'})
 
     }
 })

 router.delete('/admin/tasks/:id', authAdmin, async (req, res) => {
   

    try{

        
        const userData = await UserData.findById({ 
            _id: req.params.id,
            user: req.user._id
        
        })

        if(!task){
            return req.status(404).send({error:'Data does not exist.'})
        }

        res.status(201).send(userData)

    }
    catch(e){

        res.status(500).send({error:'Invalid task. Please Enter appropriate authentication.'})

    }
})

 module.exports = router