const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/userData')
const connectDB = require('./db/mongoose')
const dotenv = require('dotenv')

dotenv.config({path: "./config/dev.env"})

const app = express()
connectDB()
const port = process.env.PORT 

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Wakey Wakey kk, Server is running on '+ port)
})
