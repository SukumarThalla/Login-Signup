import { Hono } from "Hono";
import { serve } from "@hono/node-server";
import "./db/dbConnection";
import { route_Handlers } from "../src/routes/authRouters";
import dotenv from "dotenv";
dotenv.config();
const app = new Hono();

app.route("/", route_Handlers);

serve({
  fetch: app.fetch,
  port: Number(process.env.SERVER_PORT),
});

console.log("server is running at http://localhost:3000");

// import { seedFunction } from "../src/scripts/seeds";
// app.get("/", async (c) => {
//   await seedFunction(c);
//   return c.json({ message: "Seeding completed!" });
// });
