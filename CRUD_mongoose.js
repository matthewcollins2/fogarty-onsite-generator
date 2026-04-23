import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path"; // Added for static files
import { fileURLToPath } from "url"; // Added for path resolution

// Route Imports
import adminRoute from "./routes/admin.route.js";
import appointmentRoute from "./routes/appointment.route.js";
import generatorRoute from "./routes/generator.route.js";
import manufacturerRoute from "./routes/manufacturer.route.js";
import partRoute from "./routes/part.route.js";
import reviewRoute from "./routes/review.route.js";
import userRoute from "./routes/user.route.js";
import quoteRoute from "./routes/quote.route.js";
import pagecontentRoute from "./routes/pagecontent.route.js";
import partrequestRoute from "./routes/partrequest.route.js";
import uploadRoutes from "./routes/upload.route.js";
import returnsRoute from "./routes/returns.route.js"
import invoiceRoute from "./routes/invoice.route.js";
import invoiceProductRoute from "./routes/product.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Setup for ES Module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "*", credentials: true }));
app.use(express.json()); // Fixes the 400 Bad Request error
app.use(cookieParser());

// Serve static files from the 'dist' folder (Vite build output)
app.use(express.static(path.join(__dirname, 'dist')));

// --- Routes ---
app.use('/api/admins', adminRoute);
app.use('/api/generators', generatorRoute);
app.use('/api/parts', partRoute);
app.use('/api/reviews', reviewRoute);
app.use('/api/users', userRoute);
app.use('/api/appointments', appointmentRoute);
app.use('/api/manufacturers', manufacturerRoute);
app.use('/api/quotes', quoteRoute);
app.use('/api/pagecontent', pagecontentRoute);
app.use('/api/partrequests', partrequestRoute);
app.use("/api/upload", uploadRoutes);
app.use('/api/returns', returnsRoute);
app.use('/api/invoices', invoiceRoute);
app.use('/api/invoice-products', invoiceProductRoute);


app.get('/api/*', (req, res) => {
    res.status(404).json({ error: 'API route not found' });
});

// --- SPA Catch-all ---
// This serves index.html for any request that doesn't match an API route or static file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// --- Database Connection ---
const uri = process.env.MONGODB_URI;

if (!uri) {
    console.error('MONGODB_URI is not set in your .env file.');
    process.exit(1);
}

mongoose.connect(uri)
    .then(() => {
        console.log('Connected to MongoDB database!');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Database connection FAILED:', err);
        process.exit(1);
    });