const express = require('express')
const dotenv = require('dotenv')
const connectDb = require('./config/db')
const User = require('./model/user.model')
const redis = require("./config/redis")
const ratelimiter = require("./middleware/ratelimit")
const sendEmail = require("./config/sendEmail")
const emailQueue = require('./queue')

dotenv.config()

const port = process.env.PORT || 5000

const app = express()
app.use(express.json())


app.get("/",(req,res)=>{
    return res.status(200).json({message:`Hello from server ${process.env.SERVER_NAME}`})
})


app.post("/create",async (req,res)=>{
    const {name,email,password} = req.body
    await redis.del("user:all")  
    const user = await User.create({
        name,email,password
    })

    // await sendEmail(email)
    //without redis queue (bull mq) it takes 5 sec to finish this complete task
    // but queue finishes this response quickly and mail is sent (in background after 5 sec)
    
    await emailQueue.add("send-email",{email})

    return res.json(user)
})



//without redis get method
app.get("/get",ratelimiter,async(req,res)=>{
    const user = await User.find({})
    return res.json(user)
})

//THIS IS CALLED API CACHING
//with redis
app.get("/get-with-redis",async(req,res)=>{
    const data=await redis.get("user:all") // "user:all" is a key......redis stores in key value
    //cache hit
    if(data){
        const user = JSON.parse(data)
        return res.json(user)
    }
    //cache miss
    //lets go to database then
    const user=await User.find({})
    //also store to redis
    await redis.set("user:all",JSON.stringify(user))  // "user:all" is a key......redis stores in key value
    
    return res.json(user)
})


// withhout redis to fetch data : 82ms
// with redis for first time : 400 ms
// with redis for every other time : 8ms



//FOR OTP CACHING:
app.post("/send-otp",async(req,res)=>{
    const {email} = req.body
    const otp=Math.floor(100000+Math.random()*900000).toString()
    
    await redis.set(`otp:${email}`, otp, "EX",30)
    
    return res.json({otp})
})

app.post("/verify-otp",async(req,res)=>{
    const {email,otp} = req.body
    const cachedOtp = await redis.get(`otp:${email}`)
    if(!cachedOtp){
        return res.status(400).json({"message":"otp not found or expired"})
    }
    if(cachedOtp!=otp){
        return res.status(400).json({"message":"wrong OTP"})
    }
    
    await redis.del(`otp:${email}`)
    
    return res.json({"message":"OTP VERIFIED"})
})

//DONE RATE LIMITING

// DONE QUEUES IN REDIS (BULL MQ)

app.listen(port,()=>{
    connectDb()  
    console.log(`server started at ${port}`)
})
