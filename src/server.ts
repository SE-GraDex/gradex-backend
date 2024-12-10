import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import cookieParser from "cookie-parser";
import { deleteExpiredPackages } from "./controller/package";

const app: Express = express();
const env = process.env;
const port = env.PORT || 8080;
const cron = require("node-cron");

dotenv.config();
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: ["https://gradex-cpe.bangmod.engineer"],
    credentials: true,
  })
);
app.use(cookieParser());

const routesDir = path.join(__dirname, "routes");

// Dynamically import route files
fs.readdirSync(routesDir).forEach((file: string) => {
  if (file.endsWith(".ts")) {
    const routePath = `/api/${file.replace(".ts", "")}`;

    // Dynamically import each route using import()
    import(path.join(routesDir, file))
      .then((router) => {
        app.use(routePath, router.default); // Ensure you use router.default if you're using `export default` in your route files
      })
      .catch((err) => {
        console.error(`Error loading route file: ${file}`, err);
      });
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send("Express TypeScript Server is Running");
});

const database = () => {
  try {
    mongoose.connect(env.MONGOURI as string);
    console.log("Connected to DB successfully");
  } catch (error) {
    console.error("Error connecting to DB:", error);
  }
};

database();

app.listen(port, () => {
  console.log(`✨[server]: Server is running at http://localhost:${port}`);
});

// Schedule a job to run Expired package function everyday
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("Running scheduled job to delete expired packages");
    await deleteExpiredPackages(
      {} as any,
      {
        status: (code: number) => ({
          json: (data: any) => console.log(`Status: ${code}`, data),
        }),
      } as any
    );
  } catch (error) {
    console.error("Error running the scheduled task:", error);
  }
});
