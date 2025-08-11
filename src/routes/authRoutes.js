// Import routes
import passport from "passport";
import { Router } from "express";
import { 
    register, 
    login, 
    logout, 
    authStatus,
    setup2FA,
    verify2FA,
    reset2FA,
} from "../controllers/authController.js";

const router = Router();

// Middleware for protecting routes
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ error: "Unauthorized: You must be logged in to access this resource." });
};

// Registration Route
router.post("/register", register); // These will point back to authController to maintain separation of concerns and improve readability

// Login Route
router.post("/login", passport.authenticate("local"), login);

// Auth Status Route
router.get("/status", isAuthenticated, authStatus);

// Logout Route
router.post("/logout", isAuthenticated, authStatus);

// 2FA Setup Route
router.post("/2fa/setup", isAuthenticated, setup2FA);

// 2FA Verify Route
router.post("/2fa/verify", verify2FA);

// 2FA Reset Route
router.post("/2fa/reset", isAuthenticated, reset2FA);

export default router;