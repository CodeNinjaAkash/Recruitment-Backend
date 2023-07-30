import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
mongoose
    .connect(uri)
    .then(() => {
      console.log('mongodb connected');
    })
    .catch((error) => {
      console.error(error);
      throw new Error(`Unable to connect to database: ${uri}`);
    });
