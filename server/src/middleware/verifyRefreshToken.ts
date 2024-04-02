const jwt = require("jsonwebtoken");
import prisma from "../utils/prisma-client";
import express from "express";

const refreshTokenRoute = async (
  req: express.Request,
  res: express.Response
) => {
  const refreshToken = req.cookies.refjwt;

  if (!refreshToken) return res.status(401).send(" Unauthorized"); // Unauthorized

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);
  } catch (err) {
    return res.sendStatus(403); // Forbidden
  }

  const tokenInDb = await prisma.userToken.findUnique({
    where: { token: refreshToken },
  });
  if (!tokenInDb) return res.sendStatus(403); // Forbidden

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) return res.sendStatus(403); // Forbidden

  const newAccessToken = jwt.sign(
    { id: user.id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: "10m" }
  );
   
  res.cookie("acessjwt", newAccessToken, {
    httpOnly: true,
    maxAge: 10 * 60 * 1000,
  });

  res.json({ accessToken: newAccessToken });
};

export default refreshTokenRoute;

//2
// export const verifyRefreshToken = async (refreshToken:any)=>{
//     try{
//       const reftoken = await prisma.userToken.findUnique({where: { token: refreshToken }});

//       if(!reftoken)
//       {
//         throw new Error("Refresh token not found");
//       }
//      console.log("1",reftoken)

//       const tokenDetails = await jwt.verify(reftoken?.token, process.env.SECRET_KEY);

//       return {
//         tokenDetails,
//         message:"Valid refresh token"
//       };
//     }
//     catch(err){
//       console.log(err);
//     }
//   }

//3
// export const refresh=  (req:Request,res:Response)=>{
//   const cookies= req.cookies

//   if(!cookies?.refjwt){
//    return res.status(401).send("Unauthorized")
//   }
//   else{
//     const refreshToken = cookies.refjwt
//     // return res.status(201).send(refreshToken)

//       jwt.verify(refreshToken, process.env.SECRET_KEY, async (err:any,decoded:any)=>{
//       if(err)
//       {
//         return res.status(403).send("Forbidden")
//       }
//         else{
//           const accessToken = generateAccessToken(decoded)
//              return res.send(accessToken)
//         }
//   })
// }}
