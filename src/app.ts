import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import healthcheckRoutes from "./routes/healthcheckRoutes";
import transactionRoutes from "./routes/transactionsRoutes";
import { errorHandler } from "./middlewares/errorMiddleware";
import securityMiddleware from "./middlewares/securityMiddleware";
import cookieParser from "cookie-parser";
import { requestLogger } from "./middlewares/requestLogger";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  }),
);
app.use(securityMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/health", healthcheckRoutes);

app.get("/", (req, res) => {
  res.send("Api.wallet is running");
});

app.use(errorHandler);

export default app;
