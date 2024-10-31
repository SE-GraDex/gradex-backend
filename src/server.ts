import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import dotenv from "dotenv"
import cors from "cors";
import mongoose from "mongoose";

const app: Express = express();
const port = process.env.PORT || 8080;
const env = process.env;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
dotenv.config();

app.get("/", (req: Request, res: Response) => {
    res.send("Express TypeScript Server is Running");
});

const database = () => {
    try {
        mongoose.connect(env.MONGOURI as string)
        console.log("connecting to db success")
    } catch (error) {
        console.log(error)
        console.log("Something went wrong when connecting to db")
    }
}

database();


app.listen(port, () => {
    console.log(`✨[server]: Server is running at http://localhost:${port}`);
});