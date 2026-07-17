const redis = require("../config/redis")

const ratelimiter=async(req,res,next)=>{
    const ip = req.ip;
    const key = `rate_limit:${ip}`;
    const requests=await redis.incr(key)
    if(requests===1){
        await redis.expire(key,60) // this key will expire after 60 sec
    }
    const ttl=await redis.ttl(key)
    if(requests>5){
        return res.status(429).json({
            message:"Too many requests",
            retryAfter:ttl
        })
    }
    next();
}

module.exports = ratelimiter