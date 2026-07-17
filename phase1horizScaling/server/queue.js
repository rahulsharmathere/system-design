const { Queue } = require("bullmq");
const Redis = require("ioredis");

const connection = new Redis("redis://redis:6379",{
    maxRetriesPerRequest:null // agar nahi bana ek baar me connection , dont try again
})

const emailQueue = new Queue("emailQueue",{connection})

module.exports = emailQueue

