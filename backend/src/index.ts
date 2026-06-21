import express from 'express';
import pool, { getDbConnection } from './db/db.js';                     // imports the ready‑to‑use pool
import asyncHandler from './utils/asyncHandler/Handeler.js';
import ApiResponse from './utils/responce/Responce.js';
import ApiError from './utils/error/ApiError.js';
import dotenv from 'dotenv'

const app = express();
app.use(express.json());
dotenv.config();
// Health check
app.get('/', async(req, res) => {
  const result = await pool.query('SELECT * FROM users');
 return res.json(new ApiResponse(200, result.rows, 'Fetched successfully'));
});

// Global error handler (you already have ApiError – use it)
app.use((err:any, req:any, res:any, next:any) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      error: err.error,
      message: err.message,
    });
  }
  console.error(err);
  res.status(500).json({
    success: false,
    statusCode: 500,
    error: 'InternalServerError',
    message: 'Something went wrong',
  });
});

app.listen(3000, () => {

 var x= getDbConnection();
 if(!x){
  console.log('Db is not connted');
 }else{
   console.log('Server running on port 3000');
 }
});