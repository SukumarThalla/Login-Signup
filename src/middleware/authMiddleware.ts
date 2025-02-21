import { verify } from "jsonwebtoken";
import dotenv from "dotenv";
import { getCookie, setCookie } from "hono/cookie";
dotenv.config();

export const jwtValidation = async (c: any, next: any) => {
  try {
    const token = getCookie(c, "auth_token");
    if (!token) {
      return c.redirect("/signin");
    }

    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      return c.json({
        error: "Unable to Find the secretKey, Please Check it in .env",
      });
    }
    const decoded = verify(token, secretKey);
    c.set("user", decoded);
    await next();
  } catch (error) {
    return c.json({ error: "Invalid token error" }, 422);
  }
};

export const RemoveCookie = async (c: any, next: any) => {
  try {
    const token = getCookie(c, "auth_token");
    if (token) {
      setCookie(c, "auth_token", "", { maxAge: 0 });
    }
    await next();
  } catch (error) {
    return c.json({ error: "Invalid token error" }, 422);
  }
};
