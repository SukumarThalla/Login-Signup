import { readFileSync } from "fs";
import path from "path";
import ejs from "ejs";
import dotenv from "dotenv";
import { Context } from "Hono";
dotenv.config();

export const renderEJS = async (templateName: string, data: object) => {
  const filePath = path.join(
    process.cwd(),
    process.env.Verify_PATH + `${templateName}.ejs`
  );
  const template = readFileSync(filePath, "utf-8");

  return ejs.render(template, data);
};

export const finalRender = async (
  c: Context,
  templateName: string,
  data: any
) => {
  const html = await renderEJS(templateName, data);
  console.log(html);
  return c.html(html);
};
