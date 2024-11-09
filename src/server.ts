import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import fs from 'fs';
import path from 'path';

const app: Express = express();
const port = process.env.PORT || 8080;
const env = process.env;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();

const routesDir = path.join(__dirname, 'routes');

// Dynamically import route files
fs.readdirSync(routesDir).forEach((file: string) => {
    if (file.endsWith('.ts')) {
        const routePath = `/api/${file.replace('.ts', '')}`;

        // Dynamically import each route using import()
        import(path.join(routesDir, file)).then((router) => {
            app.use(routePath, router.default); // Ensure you use router.default if you're using `export default` in your route files
        }).catch((err) => {
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
