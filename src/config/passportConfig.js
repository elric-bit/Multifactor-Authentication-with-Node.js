import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

passport.use(
    new LocalStrategy(async (username, password, done) => {
        try {
            // Find the user by username
            const user = await User.findOne({ username });

            // If no user is found with that username, fail authentication
            if (!user) {
                return done(null, false, { message: 'User not found' });
            }

            // Compare the submitted password with the hashed password in the database
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                // Passwords match. Authentication is successful.
                // Pass the user object to the next middleware.
                return done(null, user); // CORRECT: Return the user object on a successful match.
            } else {
                // Passwords do not match. Authentication fails.
                return done(null, false, { message: 'Incorrect password.' }); // CORRECT: Return false on a mismatch.
            }
        } catch (error) {
            // If any other error occurs (e.g., database connection issue), pass it along.
            return done(error);
        }
    })
);

passport.serializeUser((user, done) => {
    // Serialize the user ID to store in the session
    console.log("Serializing user:", user._id);
    done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {
    try {
        // Find the user by ID and return the user object
        const user = await User.findById(_id);
        done(null, user);
    } catch (error) {
        // If an error occurs while finding the user, pass it along
        done(error);
    }
});