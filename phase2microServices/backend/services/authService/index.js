const express = require('express')
const dotenv = require('dotenv')
dotenv.config()

const port = process.env.PORT || 5000

const app = express()
app.use(express.json())


app.get("/",(req,res)=>{
    return res.status(200).json({message:"Hello from AUTH SERVICE (A MICRESERVICE)"})
})

app.listen(port,()=>{
    console.log(`server started at ${port}`)
})
