import express, { Request, Response } from "express";
import prisma from "../utils/prisma-client";
import { generateTokens } from "../config/generate-token";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Register the user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      res.status(400);
      throw new Error("Fileds cannot be empty");
    }

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      return res.status(400).send("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 5);

    const newuser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    if (newuser) {
      res.status(201).send(newuser);
    } else {
      res.status(400);
      throw new Error("Failed to create user");
    }
  } catch (e) {
    res.status(400).send(e);
  }
};

//Login user
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400);
      throw new Error("Fileds cannot be empty");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).send("Invalid email");
    }

    const passwordmatch = await bcrypt.compare(password, user.password);

    if (!passwordmatch) {
      return res.status(401).send("Invalid password");
    }

    const { accessToken, refreshToken } = await generateTokens(user);

    res.cookie("refjwt", refreshToken, {
      httpOnly: true,
      // sameSite: 'none',
      // secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie("acessjwt", accessToken, {
      httpOnly: true,
      maxAge: 10 * 60 * 60 * 1000,
    });

    return res.status(201).send({ user, accessToken, refreshToken });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
};



export const logout = async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refjwt;
  const accessToken = req.cookies.accessjwt;
  if (!refreshToken) {
    return res.status(204).send("You are already logged out");
  }

  await prisma.userToken.delete({ where: { token: refreshToken } });

  // Clear cookies
  res.clearCookie("accessjwt");
  res.clearCookie("refjwt");
  console.log(req.cookies);

  return res.status(204).send("Logout successful");
};

export const refreshFuncn = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  const tokenInDb = await prisma.userToken.findUnique({
    where: { token: refreshToken },
  });
  if (!tokenInDb) return res.sendStatus(403);

  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET_KEY,
    (err: any, user: any) => {
      if (err) return res.sendStatus(403);

      const accessToken = jwt.sign(
        { userId: user.userId },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: "10m" }
      );
      res.json({ accessToken });
    }
  );
};
