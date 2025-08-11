import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";
import qrCode from "qrcode";
import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ error: "Username is already taken." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            password: hashedPassword,
            isMfaActive: false, // Default MFA status
        });
        console.log("Registering user:", newUser);
        await newUser.save();

        const userResponse = {
            _id: newUser._id,
            username: newUser.username,
            isMfaActive: newUser.isMfaActive,
        };

        res.status(201).json({ message: "User registered successfully", newUser });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: "Registration failed" });
    }
}

export const login = async (req, res) => {
    console.log("The authenticated user is:", req.user);
    res.status(200).json({ 
        message: "Login successful",
        username: req.user.username,
        isMfaActive: req.user.isMfaActive,
    });
};

export const authStatus = async (req, res) => {
    if(req.user) {
        res.status(200).json({
            message: "User is authenticated",
            username: req.user.username,
            isMfaActive: req.user.isMfaActive,
        });
    } else {
        res.status(401).json({
            message: "User is not authenticated",
        });
    }
};

export const logout = (req, res, next) => { // Using next for passport's error handling
    req.logout((err) => {
        if (err) {
            // If passport's logout function fails, pass the error to a handler
            return next(err); 
        }
        res.status(200).json({ message: "User logged out successfully" });
    }); 
};

export const setup2FA = async (req, res) => {
    try {
        console.log("Setting up 2FA for user:", req.user.username);
        const user = req.user; // Assuming user ID is available in req.user
        var secret = speakeasy.generateSecret({
            name: "MyApp",
            length: 20, // Length of the secret key
        });
        console.log("Generated 2FA secret:", secret.base32);
        user.twoFactorSecret = secret.base32; // Store the secret in the user model
        user.isMfaActive = true; // Activate 2FA for the user
        await user.save();
        const url = speakeasy.otpauthURL({
            secret: secret.base32,
            label: `${req.user.username}`,
            issuer: "MyApp",
            encoding: "base32",
            algorithm: "sha512", // Use SHA-512 for stronger security
        });
        const qrImageUrl = await qrCode.toDataURL(url);
        res.status(200).json({
            secret: secret.base32,
            qrImageUrl: qrImageUrl,
            message: "2FA setup successful. Scan the QR code with your authenticator app.",
        });
    } catch (error) {
        console.error("2FA setup error:", error);
        res.status(500).json({ error: "2FA setup failed" });
    }
}

export const verify2FA = async (req, res) => {
    try {
        const { token } = req.body; // The token from the authenticator app
        const user = req.user; // Assuming user ID is available in req.user
        // Make sure the user and secret exist before verifying
        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ message: "2FA is not set up for this user." });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: "base32",
            token: token,
            window: 1, // Allow a small time window for clock drift
        });

        if (verified) {
            const jwtPayload = { id: user._id, username: user.username };
                const jwtToken = jwt.sign(
                    jwtPayload, 
                    process.env.JWT_SECRET,
                    { expiresIn: "1h" }
                );

            // prevent fixaction attacks by regenerating session
            res.status(200).json({
                    message: "2FA verification successful",
                    token: jwtToken,
                });
            } else {
                // This 'else' is now correctly placed.
                res.status(401).json({ message: "Invalid 2FA token" });
            }
        } catch (error) {
            console.error("2FA Verification Error:", error);
            res.status(500).json({ error: "2FA verification failed" });
        }
    }
        

export const reset2FA = async (req, res) => {
    try {
        const user = req.user; // Assuming user ID is available in req.user
        user.twoFactorSecret = null, // Clear the 2FA secret
        user.isMfaActive = false, // Deactivate 2FA
        await user.save();
        res.status(200).json({ message: "2FA reset successful" });
    } catch (error) {
        res.status(500).json({ error: "2FA reset failed", message: error.message });
    };
}
