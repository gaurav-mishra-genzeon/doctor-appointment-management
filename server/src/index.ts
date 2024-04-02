import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import user from './routes/userRoute';
import cookieParser from 'cookie-parser';


const app=express();
app.use(cors({
    origin: 'http://localhost:5173',  
    credentials: true
  }))
app.use(cookieParser())
app.use(express.json())
dotenv.config()

const PORT= process.env.PORT || 3001

app.get("/",(req,res)=>{
    res.send("Welcome to homepage")
})

//Routes
app.use("/api",user)


app.listen(PORT,()=>{
    console.log(`Server started on ${PORT}`)
})




