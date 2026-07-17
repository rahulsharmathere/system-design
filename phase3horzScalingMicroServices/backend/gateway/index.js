const express = require('express')
const dotenv = require('dotenv')
const proxy = require('express-http-proxy')
dotenv.config()

const port = process.env.PORT || 5000

const app = express()
app.use(express.json())


app.get("/",(req,res)=>{
    return res.status(200).json({message:`Hello from backend or API GATEWAY ${process.env.SERVER_NAME}`})
})


app.use("/auth",proxy("http://auth-service:8001"))
app.use("/order",proxy("http://order-service:8002"))
app.use("/product",proxy("http://product-service:8003"))


app.listen(port,()=>{
    console.log(`server started at ${port}`)
})
