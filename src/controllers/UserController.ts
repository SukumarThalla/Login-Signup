import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Context } from "Hono";
import { safeParse, flatten, string } from "valibot";
import BaseExceptions from "../exceptions/BaseException";
import { renderEJS } from "../services/templateServices/verifyEmailtemplate";
import {
  validateEmailSchema,
  validateSignUpSchema,
  validateSignInSchema,
  ValidateNewPassword,
  validatePasswordSchema,
} from "../middleware/validations/schemas/validateLoginSchemas";
import { dbServices } from "../services/dbServices";
import { sendEmail } from "../services/resetMailServices";
import validateUserInput from "../middleware/validateUserinput";
import handleError from "../exceptions/exceptionHandler";
import {
  tokenGen,
  generateResetToken,
  resetVerifyToken,
  genVerifyToken,
  verifyToken,
} from "../utills/tokenUtills";
import { setCookie } from "hono/cookie";

dotenv.config();

class UserController {
  async signUp(c: Context) {
    try {
      const userData = await c.req.json();
      await validateUserInput(validateSignUpSchema, userData);
      const AccountExistCheck = await dbServices.accountExistCheck(
        userData.email
      );
      if (AccountExistCheck) {
        return c.json(
          {
            error: "Account Already Exists",
          },
          409
        );
      }
      const hashPassword = await bcrypt.hash(userData.password, 10);
      await dbServices.addUser(userData, hashPassword);
      const token = await genVerifyToken(String(userData.email));

      await sendEmail("verifyEmail", userData.email, "Verify Your Email", {
        userName: userData.firstName,
        link: process.env.BASE_URL + `/verify-email/?token=${token}`,
      });
      return c.json({
        success: "Check Your Email to verify your account",
      });
    } catch (err: any) {
      console.log(err);
      return handleError(c, err);
    }
  }
  async verifyEmail(c: Context) {
    const token = c.req.query("token");
    const decodedData = await verifyToken(String(token), c);
    const email = (decodedData as { email: string }).email;
    const emailExists = email !== undefined;
    let user;
    if (emailExists) {
      user = await dbServices.accountExistCheck(email);
      if (user) {
        await dbServices.updateVerifyStatus(String(user.email));
      }
    }
    const templateName =
      emailExists && user && token
        ? "verificationSuccess"
        : "verificationFailed";

    let message;
    if (!token) {
      message = "Token is missing";
    } else if (!emailExists) {
      message = "Invalid Token";
    } else if (!user) {
      message = "User not found";
    } else {
      message = "User has been Verified successfully";
    }
    const data = {
      message: message,
    };
    const html = await renderEJS(templateName, data);
    return c.html(html);
  }
  async signInEjs(c: Context) {
    const data = {
      error: null,
    };
    const html = await renderEJS("signin", data);
    return c.html(html);
  }
  async signIn(c: Context) {
    try {
      const { email, password } = await c.req.parseBody();
      const validatedDetails = await validateUserInput(
        validateSignInSchema,
        { email, password },
        true,
        true
      );
      if (!validatedDetails.success) {
        const html = await renderEJS("signin", {
          error: validatedDetails.error,
        });
        return c.html(html);
      }
      const user = await dbServices.signinDetailsCheck(String(email));
      if (!user) {
        const html = await renderEJS("signin", {
          error: "User Not Found",
        });
        return c.html(html);
      }
      const hashedPasswordCheck = await bcrypt.compare(
        String(password),
        user.password
      );
      if (!hashedPasswordCheck) {
        const html = await renderEJS("signin", {
          error: "Incorrect Password",
        });
        return c.html(html);
      }
      const token = await tokenGen(user.Id);
      await dbServices.storeToken(user.Id, token.refresh_token);
      setCookie(c, "auth_token", String(token.accessToken), {
        httpOnly: true,
        secure: true,
        maxAge: 3600000,
      });
      return c.redirect("/dashboard");
    } catch (err: any) {
      console.log(err);
      return handleError(c, err);
    }
  }
  async forgetEjs(c: Context) {
    const html = await renderEJS("forgetPassword", {
      message: "Email Sent Successfully",
    });
    return c.html(html);
  }
  async forgetPassword(c: Context) {
    const { email } = await c.req.parseBody();
    try {
      const validateEmail = safeParse(validateEmailSchema, email, {
        abortEarly: true,
        abortPipeEarly: true,
      });
      if (!validateEmail.success) {
        const errData = validateEmail.issues.map((issue) => issue.message);
        const errorsArray = Object.values(errData).flat();
        const html = await renderEJS("signin", {
          error: errorsArray,
        });
        return c.html(html);
      }

      const user = await dbServices.signinDetailsCheck(String(email));

      if (!user) {
        const html = await renderEJS("verificationFailed", {
          message: "User Not Found",
        });
        return c.html(html);
      }

      const token = await generateResetToken(user.Id);
      await dbServices.storeResetToken(user.Id, token);
      await sendEmail("resetPassword", user.email, "Reset Your Password", {
        userName: user.firstName,
        link: process.env.BASE_URL + `/reset-password?token=${token}`,
      });
      const html = await renderEJS("verificationSuccess", {
        message: "Email Sent Successfully",
      });
      return c.html(html);
    } catch (error) {
      console.log(error);
      return handleError(c, error);
    }
  }

  async resetPasswordEjs(c: Context) {
    try {
      const token = c.req.query("token");
      const decodedToken = await resetVerifyToken(String(token), c);
      if (!decodedToken || !token) {
        const html = await renderEJS("verificationFailed", {
          message: "Invalid or expired reset link",
        });
        return c.html(html);
      }

      const data = {
        token: token,
        error: null,
      };
      const html = await renderEJS("newPassword", data);
      return c.html(html);
    } catch (error) {
      console.log(error);
      return handleError(c, error);
    }
  }

  async resetPassword(c: Context) {
    const { token, newPassword, confirmPassword } = await c.req.parseBody();
    const validatedPassword = validateUserInput(
      ValidateNewPassword,
      { newPassword, confirmPassword },
      true,
      true
    );
    if (!validatedPassword.success) {
      const html = await renderEJS("newPassword", {
        token,
        error: validatedPassword.error,
      });
      return c.html(html);
    }
    if (newPassword !== confirmPassword) {
      const html = await renderEJS("newPassword", {
        token: token,
        error: "Passwords do not match",
      });
      return c.html(html);
    }

    const userId = await resetVerifyToken(String(token), c);
    const userProfile = await dbServices.getUserById(Number(userId));
    const newHashPassword = await bcrypt.hash(String(newPassword), 10);
    await dbServices.updatePassword(userProfile.Id, newHashPassword);
    await dbServices.deleteToken(token);
    const html = await renderEJS("verificationSuccess", {
      message: "Password Updated Successfully",
    });
    return c.html(html);
  }

  async dashBoard(c: Context) {
    try {
      const userProfile = c.get("user");
      const user = await dbServices.getUserById(userProfile.userId);

      const html = renderEJS("dashboard", {
        firstName: user.firstName,
        email: user.email,
      });
      return c.html(html);
    } catch (error) {
      console.log(error);
      return c.json({ error: "failed to get dashboard" });
    }
  }

  async userProfile(c: Context) {
    const user = c.get("user");
    const userProfile = await dbServices.getUserById(user.userId);

    return c.json({ message: "Profile Data", userProfile });
  }

  // async getAllUsers(c: Context) {
  //   try {
  //     const page = Number(c.req.query("page")) || 1;
  //     const limit = Number(c.req.query("limit")) || 10;
  //     const search = String(c.req.query("name")) || "";
  //     const offset = (page - 1) * limit;
  //     const allUsersData = await dbServices.getAllUsers(limit, offset, search);
  //     return c.json({ success: "Success", limit, offset, allUsersData }, 200);
  //   } catch (error: any) {
  //     return c.json({ error: error.message }, 500);
  //   }
  // }

  // async deleteAllUsers(c: Context) {
  //   try {
  //     const allUsersData = await dbServices.deleteAllUsers();
  //     return c.json({ success: "Deleted" }, 200);
  //   } catch (error: any) {
  //     return c.json({ error: error.message }, 500);
  //   }
  // }
}

export const UserControllers = new UserController();

// await dbServices.deleteToken(userData.email);
// return c.json({
//   success: "Password updated , Login with YOur new password",
// });

// const userData = await c.req.json();
// const get_token_from_db = await dbServices.getTokenFromPassDb(
//   userData.email
// );
// if (get_token_from_db.length === 0) {
//   return c.json({ error: "Token Not found" });
// }
// if (get_token_from_db[0].token !== userData.token) {
//   return c.json({ error: "Token is not matching ,please try again" });
// }
// const validatePassword = safeParse(
//   validatePasswordSchema,
//   userData.password,
//   {
//     abortEarly: false,
//   }
// );
// if (!validatePassword.success) {
//   const errData = validatePassword.issues.map((issue) => issue.message);
//   throw new BaseExceptions(errData, 422, "Validation failed");
// }
// const saltRound = 10;
// const newHashPassword = await bcrypt.hash(
//   userData.newPassword,
//   saltRound
// );
// await dbServices.updatePassword(userData.email, newHashPassword);
// await dbServices.deleteToken(userData.email);
// return c.json({
//   success: "Password updated , Login with YOur new password",
// });
