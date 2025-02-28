STEP - 1
    npm create hono@latest -- TO CREATE HONO SETUP
STEP - 2
    npm run dev            -- TO TEST THE SERVER
STEP - 3
    Drizzle-setup:-
      a)  npm i drizzle-orm pg dotenv  --Drizzle packages
      b)  npm i -D drizzle-kit tsx @types/pg
      c)  Store the Drizzle Credentials in .env
              [
              DB=defaultdb
              DB_HOST=pg-111d4b2d-sukumar63044-61ac.d.aivencloud.com
              PORT = 28725
              USER = avnadmin
              PASSWORD = ......

              ]
              
      d)  Add the ca.pam file in it
      e)  Create config Folder in src and store the crendentials in object form from env file
      f)  Create  db Folder/dbConnection file and make connection with Pool instance 
                import { drizzle } from "drizzle-orm/node-postgres";
                import dbConfig from "../config/dbConfig.js";
                import fs from "fs";
                import pg from "pg";
                const { Pool } = pg;
                
                const pool = new Pool({
                host: dbConfig.host,
                port: dbConfig.port,
                user: dbConfig.user,
                password: dbConfig.password,
                database: dbConfig.database,
                ssl: {
                  rejectUnauthorized: true,
                  ca: fs.readFileSync("./ca.pem").toString(),
                },
                });
                
                export const db = drizzle(pool, {
                schema: {},
                });
                
                db.execute("SELECT 1")
                .then(() => console.log(" CONNECTED SUCCESSFULLY"))
                .catch((error) => console.error("FAILED TO CONNECT WITH DB", error));

        g)  Create a file called drizzle.config.ts for schema
                  import dotenv from "dotenv";
                  import fs from "fs";
                  dotenv.config();
                  
                  export default {
                  schema: "./src/db/schemes/*",
                  out: "./drizzle",
                  dialect: "postgresql",
                  dbCredentials: {
                  database: process.env.DB,
                  host: process.env.DB_HOST,
                  port: Number(process.env.PORT),
                  user: process.env.USER,
                  password: process.env.PASSWORD,
                  },
                  ssl: {
                  ca: fs.readFileSync("./ca.pem").toString(),
                  rejectUnauthorized: true,
                  },
                  };

          h) Create a schema in db/schema/ and import it in dbConnections file
          G) npx drizzle-kit generate - to generate the table in drizzle
          H) npx drizzle-kit migrate  -  to migrate the table in drizzle 
          I) npx drizzle-kit studio - to open the gui in the browser
          create folder structure and do operations on db
                                    
                  
