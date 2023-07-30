import express from 'express';

import {authRoutes} from './routes/admin.js';
import userRoutes from './routes/candidate.js';
import managementRoutes from './routes/admin.js';

const app = express();

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/management', managementRoutes);

export default app;
