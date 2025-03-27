import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connect } from "mongoose";
import next from "next";
import Routers from "./Routers";
import EnvManager from "../utils/EnvManager";

export default class CrateApp {
  private port: number;
  private mongooseURL: string;
  private nextApp = next({ dev: process.env.NODE_ENV !== "production" });
  private handle = this.nextApp.getRequestHandler();

  constructor({ port, mongooseURL }: { port: number; mongooseURL: string }) {
    this.port = port;
    this.mongooseURL = mongooseURL;
  }

  private async App() {
    await this.nextApp.prepare();
    const app = express();

    app.use(
      cors({ origin: EnvManager.get("FRONTEND_URL"), credentials: true })
    );
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Setup API routes
    new Routers(app).Build();

    // Handle Next.js routes
    app.all("*", (req, res) => {
      return this.handle(req, res);
    });

    app.listen(this.port, "0.0.0.0", () => {
      console.log(
        `[Express] - Port ${this.port} is now active\n[Express] - http://localhost:${this.port}`
      );
    });
  }

  public async init() {
    try {
      EnvManager.checkDefiendEnvs();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }

    if (!this.mongooseURL) throw new Error("Mongoose URL must be provided");
    connect(this.mongooseURL)
      .then(() => {
        console.log(`[Database] - Connected`);
      })
      .catch((err) => {
        console.error(`[Database] - ${err}`);
      });

    await this.App();
  }
}