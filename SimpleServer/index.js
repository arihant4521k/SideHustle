import express from "express"

const app=express()
const PORT=process.env.PORT ?? 8080

app.get("/",(req,res)=>{
    return res.json({"Message":"Hello From Server"})
})

app.listen(PORT,()=>{
    console.log(`Server Is Running On Port ${PORT}`)
})