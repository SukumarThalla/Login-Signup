import dotenv from "dotenv";
import { jwtExpires } from "../config/jwt_config";
import jwt, { verify } from "jsonwebtoken";
import { dbServices } from "../services/dbServices";
import { Context } from "Hono";
dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const expires_in = jwtExpires.expiresIn;

// EMAIL VERIFY TOKEN GEN
export const genVerifyToken = async (email: string) => {
  const verifyToken = jwt.sign({ email }, SECRET_KEY, {
    expiresIn: Math.floor(Date.now() / 1000) + 60,
  });
  return verifyToken;
};

//EMAIL VERIFY  AND TOKEN CHECK
export const verifyToken = async (token: string, c: Context) => {
  try {
    const decoded = verify(token, SECRET_KEY);
    return decoded;
  } catch (error) {
    return c.json({ error: "Invalid Token" }, 400);
  }
};
//ACCESS TOKEN GE n
export const tokenGen = async (userId: number) => {
  if (!SECRET_KEY) {
    return { error: "secret Toke not found" };
  }
  const accessToken = jwt.sign({ userId }, SECRET_KEY, {
    expiresIn: Math.floor(Date.now() * 1000) + expires_in,
  });

  const refresh_token = jwt.sign({ userId }, SECRET_KEY, {
    expiresIn: Math.floor(Date.now() * 1000) + expires_in * 30,
  });

  return { accessToken, refresh_token };
};
// PASSWORD RESET TOKEN
export const generateResetToken = async (userId: number) => {
  const resetToken = jwt.sign({ userId }, SECRET_KEY, {
    expiresIn: Math.floor(Date.now() / 1000) + 60 * 15,
  });
  return resetToken;
};

// PASSWORD RESET TOKEN VERIFY
export const resetVerifyToken = async (token: string, c: Context) => {
  try {
    const decoded = verify(token, SECRET_KEY) as { userId: number };
    const ExistedUsed = await dbServices.getUserById(decoded.userId);
    if (!ExistedUsed) {
      return false;
    }
    return ExistedUsed.Id;
  } catch (error) {
    return c.json({ error: "Invalid Token" }, 400);
  }
};
