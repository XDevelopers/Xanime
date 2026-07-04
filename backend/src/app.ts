import express from "express";
import Userrouter from "./routes/user/userRouter.js";
import pool from "./db/db.js";
import ApiResponse from "./utils/responce/Responce.js";
import ApiError from "./utils/error/ApiError.js";

const app = express();

app.use(express.json());

// Health Check
app.get("/", async (req, res) => {
  const result = await pool.query("SELECT * FROM users");

  return res.json(
    new ApiResponse(200, result.rows, "Fetched successfully")
  );
});

// Routes
app.use("/api/v1/users", Userrouter);

// Global Error Handler (Hamesha last me)
app.use((err: any, req: any, res: any, next: any) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      error: err.error,
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    statusCode: 500,
    error: "InternalServerError",
    message: "Something went wrong",
  });
});

export default app;