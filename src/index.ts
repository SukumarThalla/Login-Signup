import { Hono } from "Hono";
import { serve } from "@hono/node-server";
import "./db/dbConnection";
import { routes } from "../src/routes/authRouters";
import dotenv from "dotenv";
dotenv.config();
const app = new Hono();

app.route("/", routes);

serve({
  fetch: app.fetch,
  port: Number(process.env.SERVER_PORT),
});

console.log("server is running at http://localhost:3000");
