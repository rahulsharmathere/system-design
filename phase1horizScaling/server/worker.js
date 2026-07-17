const { Queue,Worker } = require("bullmq");
const Redis = require("ioredis");
const sendEmail = require("./config/sendEmail");

const connection = new Redis("redis://redis:6379",{
    maxRetriesPerRequest:null // agar nahi bana ek baar me connection , dont try again
})

const worker=new Worker("emailQueue",async(job)=>{
    console.log("job started by worker")
    const email = job.data.email
    await sendEmail(email)
    console.log("job completed by worker")
},{connection})