import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import residentRoutes from './routes/resident.js';
import statsRoutes from './routes/stats.js';
import blotterRoutes from './routes/blotter.js';
import locationRoutes from './routes/location.js'
import certificateRoutes from './routes/certificate.js'

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: "http://localhost:5173",
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());

// Routes
app.use('/', authRoutes);
app.use('/residents', residentRoutes);
app.use('/stats', statsRoutes);
app.use('/blotter', blotterRoutes);
app.use('/location', locationRoutes)
app.use('/certificate', certificateRoutes)

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});