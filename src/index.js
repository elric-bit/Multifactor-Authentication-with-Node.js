import express from "express";
import passport from "passport";
import session from "express-session";
import dotenv from "dotenv";
import cors from "cors";
import dbConnect from "./config/dbConnect.js";
import authRoutes from "./routes/authRoutes.js";
import "./config/passportConfig.js" // Import passport configuration, already imported in authRoutes

dotenv.config();
dbConnect();
const app = express();

//Middleware

const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:3001",
    credentials: true,
};
app.use(cors(corsOptions));
app.use(session({
    secret: process.env.SESSION_SECRET || "secret - should be strong",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1 * 60 * 60 * 1000, // 1 hour session duration to prevent session fixation attacks))
        httpOnly: true, // Prevents client-side JavaScript from accessing the cookie/XSS
        secure: process.env.NODE_ENV === "production", // Use secure cookies in production - HTTPS
    }
}));
app.use(express.json({limit: "50kb"})); // We're setting a limit to prevent large payload attacks
app.use(express.urlencoded({ limit: "50kb", extended: true }));
app.use(passport.initialize());
app.use(passport.session());

// Listen app

const PORT = process.env.PORT || 7002;
app.use("/api/auth", authRoutes);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

