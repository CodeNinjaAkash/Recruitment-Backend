import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';
import logger from 'morgan';
import cors from 'cors';
import './config/dbConnection.js';
import Routers from './Router.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(logger('dev'));

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({origin: '*'}));

app.use('/api/v1', Routers);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  res.status(404).send({status: 'not_found', message: 'Page not found'});
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500).send({status: 'error', message: err.message});
});

export default app;
