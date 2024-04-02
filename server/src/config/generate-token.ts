import prisma from "../utils/prisma-client";

const jwt = require("jsonwebtoken");

export const generateTokens = async (user: any) => {
  const payload = { id: user.id, role: user.role };

  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: "30s",
  });

  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: "1d",
  });

  const Token = await prisma.userToken.findFirst({
    where: { userId: user.id },
  });
  // console.log(Token);

  if (Token)
    await prisma.userToken.deleteMany({
      where: { userId: user.id },
    });

  await prisma.userToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
    },
  });

  return { accessToken, refreshToken };
};
