import "dotenv/config";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import loginRouter from "./src/routes/login";
import { NODE_ENV, PORT } from "./src/config";
import { authenticateToken } from "./src/utils/authenticateToken";
import { greenText, syncDatabase } from "./src/db";
import seedDatabase from "./src/utils/seedDatabase";
import mainRouter from "./src/routes";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use("/api/auth/", loginRouter);
app.use(
  "/api",
  (req, res, next) => {
    if (NODE_ENV === "production") {
      authenticateToken(req, res, next);
    } else {
      next();
    }
  },
  mainRouter
);

syncDatabase()
  .then(async () => {
    await seedDatabase();
    app.listen(PORT || 3000, () =>
      console.log(greenText, `Server running on port ${PORT}`)
    );
  })
  .catch((error) => {
    console.error("Failed to sync database:", error);
  });
