
const sendEmail=async(email)=>{
    await new Promise((resolve)=>{
        setTimeout(resolve,5000)
    })
    console.log(`TASK COMPLETED , signup mail sent to ${email}`)
}

module.exports=sendEmail