import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { readFile } from "fs/promises";
import ejs from "ejs";
import path from "path";
import SibApiV3Sdk from "sib-api-v3-sdk";

dotenv.config();

export const sendEmail = async (
  emailType: string,
  email: string,
  subject: string,
  data: any
) => {
  try {
    const apiKey = process.env.BREVO_API_KEY;
    SibApiV3Sdk.ApiClient.instance.authentications["api-key"].apiKey = apiKey;
    const transApi = new SibApiV3Sdk.TransactionalEmailsApi();

    const template = async (data: object) => {
      const templatePath = path.join(
        __dirname,
        "templateServices",
        `${emailType}.ejs`
      );
      const templateRead = await readFile(templatePath, "utf-8");
      return ejs.render(templateRead, data);
    };
    const htmlContent = await template(data);
    const mailOptions = {
      sender: { name: "SUKUMAR", email: process.env.EMAIL_USER },
      to: [{ email: email, name: data.userName }],
      subject: subject,
      htmlContent: htmlContent,
    };
    await transApi.sendTransacEmail(mailOptions);
  } catch (error) {
    console.log("failed", error);
  }
};

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// await transporter.sendMail(mailOptions)
