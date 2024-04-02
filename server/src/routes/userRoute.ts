import express, { Request, Response } from 'express';
import { loginUser, logout, registerUser,refreshFuncn } from '../controllers/userController';
// import { verifyRefreshToken } from '../middleware/verifyRefreshToken';
import prisma from '../utils/prisma-client';
import refreshTokenRoute from '../middleware/verifyRefreshToken';
import verifyToken from '../middleware/verify-Token';
const jwt= require("jsonwebtoken");
// import verifyToken from '../middleware/verify-Token';

const user=express.Router()

user.post('/signup', registerUser );
user.post('/login', loginUser);
user.get('/refresh',refreshTokenRoute)
user.get('/logout',logout); 


user.get('/check',verifyToken,(req,res)=>{
    res.send("Verified user");
})


// user.post("/verka", async (req: Request, res: Response): Promise<void> => {
//     try {
//       const { refreshToken } = req.body;
  
//       const verificationResult = await verifyRefreshToken(refreshToken);
//       // console.log(2,verificationResult)
  
//       if (verificationResult?.tokenDetails) {
//         const payload = { id: verificationResult.tokenDetails.id, role: verificationResult.tokenDetails.role };
  
//         const accessToken = jwt.sign(payload,  process.env.SECRET_KEY, {
//           expiresIn: '10m',
//         });
  
//         res.status(200).send({ accessToken });
//       } else {
//         res.status(400).send({ error: 'Invalid refresh token' });
//       }
//     } catch (err) {
//       res.status(400).send("error");
//     }
// })

// async(req,res)=>{
//     verifyRefreshToken(req.body.refreshToken).then(({tokenDetails})=>{
//         const payload = { id: tokenDetails.id, role: tokenDetails.role };

//         const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
//           expiresIn: "10m",
//         });

//         res.status(200).send(accessToken)
    
//     }).catch((err)=>{
//         res.status(400).send(err)
//     })
// }






user.delete("/logout",async(req,res)=>{
    try{
      
    const Token = await prisma.userToken.findFirst({
        where: { token: req.body.refreshToken },
      });
  
   if(!Token){
          return res.status(200).send("Logged out successfully")
   }

        await prisma.userToken.deleteMany({
          where: {  token: req.body.refreshToken },
        });
        return res.status(200).send("Logged out successfully")
    }
    catch(err){
        res.status(500).send(err)
    }
})

export default user;


