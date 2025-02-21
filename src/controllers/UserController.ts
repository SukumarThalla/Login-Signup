import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { Context } from "Hono";
import { safeParse, string } from "valibot";
import { renderEJS } from "../services/templateServices/verifyEmailtemplate";
import {
  validateEmailSchema,
  validateSignUpSchema,
  validateSignInSchema,
  ValidateNewPassword,
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
import { db } from "../db/dbConnection";
import { getPresignedUrl } from "../services/s3Service";

dotenv.config();

class UserController {
  async signUp(c: Context) {
    try {
      const userData = await c.req.json();
      await validateUserInput(validateSignUpSchema, userData);
      const existingUser = await dbServices.existedUserCheck(userData.email);
      if (existingUser) {
        if (Boolean(existingUser.is_verified)) {
          return c.json(
            {
              error: "Account Already Exists",
            },
            409
          );
        } else {
          const token = await genVerifyToken(String(userData.email));
          await sendEmail("verifyEmail", userData.email, "Verify Your Email", {
            userName: userData.firstName,
            link: process.env.BASE_URL + `/verify-email/?token=${token}`,
          });

          return c.json({
            success: "Verification email re-sent. Please check your email",
          });
        }
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
    try {
      const token = c.req.query("token");
      const decodedData = await verifyToken(String(token), c);
      const email = (decodedData as { email: string }).email;
      const emailExists = email !== undefined;

      if (!token) {
        return this.renderFailedPage(c, "Token is missing");
      }
      if (!emailExists) {
        return this.renderFailedPage(c, "Invalid Token");
      }
      const user = await dbServices.existedUserCheck(email);
      if (!user) {
        return this.renderFailedPage(
          c,
          "Verification Failed, Please try again"
        );
      }

      await dbServices.updateVerifyStatus(String(user.email));

      return this.renderSuccessPage(c, "User has been Verified successfully");
    } catch (error) {
      console.log(error);
    }
  }
  async signInEjs(c: Context) {
    return await this.ejsTemplate(c, "signin", {
      error: null,
    });
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
        return this.renderSigninPage(c, validatedDetails.error);
      }

      const user = await dbServices.existedUserCheck(String(email));
      if (!user) {
        return this.renderSigninPage(c, "User Not Found");
      }
      const userProfile = await dbServices.getUserById(user.Id);
      if (userProfile.isVerified === false) {
        return this.renderFailedPage(c, "Verify Your Mail Before Signing In");
      }

      const hashedPasswordCheck = await bcrypt.compare(
        String(password),
        user.password
      );
      if (!hashedPasswordCheck) {
        return this.renderSigninPage(c, "Incorrect Password");
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
    return await this.ejsTemplate(c, "forgetPassword", {
      message: "Email Sent Successfully",
      error: null,
    });
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
        const html = await renderEJS("forgetPassword", {
          error: errorsArray,
        });
        return c.html(html);
      }
      const user = await dbServices.existedUserCheck(String(email));
      if (!user) {
        const html = await renderEJS("forgetPassword", {
          error: "User Not Found",
        });
        return c.html(html);
      }

      const token = await generateResetToken(user.Id);
      // await dbServices.storeResetToken(user.Id, token);
      await sendEmail("resetPassword", user.email, "Reset Your Password", {
        userName: user.firstName,
        link: process.env.BASE_URL + `/reset-password?token=${token}`,
      });
      return this.renderSuccessPage(c, "Email Sent Successfully");
    } catch (error) {
      console.log(error);
      return handleError(c, error);
    }
  }

  async resetPasswordEjs(c: Context) {
    try {
      const token = c.req.query("token");
      const userId = await resetVerifyToken(String(token), c);
      if (!userId || !token) {
        return this.renderFailedPage(c, "Invalid Token");
      }
      return this.ejsTemplate(c, "newPassword", { token: token, error: null });
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
      return this.ejsTemplate(c, "newPassword", {
        token,
        error: validatedPassword.error,
      });
    }
    if (newPassword !== confirmPassword) {
      return this.ejsTemplate(c, "newPassword", {
        token,
        error: "Passwords do not match",
      });
    }

    const userId = await resetVerifyToken(String(token), c);

    const userProfile = await dbServices.getUserById(Number(userId));
    const newHashPassword = await bcrypt.hash(String(newPassword), 10);
    await dbServices.updatePassword(userProfile.Id, newHashPassword);
    // await dbServices.deleteToken(token);
    return this.renderSuccessPage(c, "Password Updated Successfully");
  }

  async dashBoard(c: Context) {
    try {
      const userProfile = c.get("user");
      const user = await dbServices.getUserById(userProfile.userId);
      return this.ejsTemplate(c, "dashboard", {
        firstName: user.firstName,
        email: user.email,
      });
    } catch (error) {
      console.log(error);
      return c.json({ error: "failed to get dashboard" });
    }
  }

  async userProfile(c: Context) {
    const user = c.get("user");
    const userProfile = await dbServices.getUserById(user.userId);
    const data = {
      Id: userProfile.Id,
      email: userProfile.email,
      firstName: userProfile.firstName,
      lastName: userProfile.lastName,
      phoneNumber: userProfile.phoneNumber,
      gender: userProfile.gender,
      city: userProfile.city,
      address: userProfile.address,
    };
    return this.ejsTemplate(c, "userProfile", data);
  }
  async updatePasswordEjs(c: Context) {
    try {
      return this.ejsTemplate(c, "updatePassword", { error: "" });
    } catch (error) {
      console.log(error);
      return c.json({ error: "failed" });
    }
  }

  async updatePassword(c: Context) {
    const { oldPassword, newPassword, confirmPassword } =
      await c.req.parseBody();
    const validatedPassword = validateUserInput(
      ValidateNewPassword,
      { newPassword, confirmPassword },
      true,
      true
    );
    if (!validatedPassword.success) {
      console.log(validatedPassword.errorsAry);
      return this.ejsTemplate(c, "updatePassword", {
        error: validatedPassword.error,
      });
    }
    const user = c.get("user");
    const userProfile = await dbServices.getUserById(user.userId);

    const hashedPasswordCheck = await bcrypt.compare(
      String(oldPassword),
      userProfile.password
    );
    if (!hashedPasswordCheck) {
      return this.ejsTemplate(c, "updatePassword", {
        error: "Old Password is incorrect",
      });
    }
    if (!validatedPassword.success) {
      return this.ejsTemplate(c, "updatePassword", {
        error: validatedPassword.error,
      });
    }
    if (newPassword === oldPassword) {
      return this.ejsTemplate(c, "updatePassword", {
        error: "Old Password and new password cannot be same",
      });
    }

    if (newPassword !== confirmPassword) {
      return this.ejsTemplate(c, "updatePassword", {
        error: " New password and confirm password do not match!",
      });
    }
    const newHashPassword = await bcrypt.hash(String(newPassword), 10);
    await dbServices.updatePassword(userProfile.Id, newHashPassword);
    return this.renderSuccessPage(c, "Password Updated Successfully");
  }

  async products(c: Context) {
    return this.ejsTemplate(c, "addProducts", {});
  }

  async addProducts(c: Context) {
    try {
      const { name, description, price, stockQuantity, category, imageUrl } =
        await c.req.parseBody();
      await dbServices.addProduct({
        name,
        description,
        price,
        stockQuantity,
        category,
        imageUrl,
      });
      return this.renderSuccessPage(c, "Product Added Successfully");
    } catch (error) {
      console.log(error, "here");
    }
  }

  async getAllProducts(c: Context) {
    try {
      const products = await dbServices.getAllProducts();
      return this.ejsTemplate(c, "getProducts", { products });
    } catch (error) {
      return this.renderFailedPage(c, "Failed to get products");
    }
  }

  async getAllProductsCategory(c: Context) {
    try {
      const category = c.req.query("category");
      console.log(category);
      // const products = await dbServices.getAllProducts();
      // return this.ejsTemplate(c, "getProducts", { products });
    } catch (error) {
      return this.renderFailedPage(c, "Failed to get products");
    }
  }

  async signOut(c: Context) {
    return c.redirect("/signin");
  }

  async ejsTemplate(c: Context, templateName: string, data: any) {
    const html = await renderEJS(templateName, data);
    return c.html(html);
  }
  async renderSuccessPage(c: Context, message: string) {
    return this.ejsTemplate(c, "verificationSuccess", { message });
  }
  async renderFailedPage(c: Context, message: string) {
    return this.ejsTemplate(c, "verificationFailed", { message });
  }
  async renderSigninPage(c: Context, error: any) {
    return this.ejsTemplate(c, "signin", { error });
  }

  async getSignUrl(c: Context) {
    try {
      const { fileName, fileType } = await c.req.json();
      const { signedUrl, filePath } = await getPresignedUrl(fileName, fileType);
      return c.json({ signedUrl, filePath });
    } catch (error) {
      console.log(error);
    }
  }
}

export const UserControllers = new UserController();
