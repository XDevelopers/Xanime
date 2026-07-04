import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { getDbConnection } from "./db/db.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await getDbConnection();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Database Connection Failed:", error);
  }
};

startServer();