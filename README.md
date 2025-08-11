# Secure Node.js Authentication Backend for 2FA

This repository contains the source code for a secure backend server built with Node.js, Express, and MongoDB. It provides a robust foundation for user authentication, implementing session management, password hashing, and Time-based One-Time Password (TOTP) two-factor authentication (2FA). It's been adapted from Dipesh Malvia's original source code with some changes to the structure of the authController files.

A front end could be fitted to the API routes using your organization's standard. TailwindsCSS comes to mind.

## Features

**User Registration**: Securely register new users with hashed passwords

**Session-Based Authentication**: Manages user sessions using express-session and Passport.js.

**Two-Factor Authentication (2FA)**:
  Setup: Users can enable 2FA, which generates a unique secret and a scannable QR code.
  Verification: Verifies TOTP tokens from authenticator apps (like Google Authenticator, Authy).
  Reset: Allows users to disable their 2FA setup.

**Secure by Default**: Implements critical security best practices, including secure cookies, payload limits (50kb for MFA purposes), and proper error handling.

**Organized Architecture**: Follows a clean Model-View-Controller (MVC) like pattern (Routes -> Controllers -> Models) for better organization and scalability.

## Tech Stack
Backend: Node.js, Express.js
Database: MongoDB with Mongoose ODM - using your URIs and secrets

Authentication:
  passport for core authentication middleware
  passport-local for user/password authentication
  express-session for managing server-side user sessions

Security:
  bcryptjs for hashing user passwords
  cors to handle Cross-Origin Resource Sharing
  dotenv for managing env variables

Two-Factor Authentication:
  speakeasy for generating and verifying TOTP tokens
  qrcode for generating QR code data URLs

## Well-Architected/TOGAF Security Points

Password Hashing: Passwords are never stored in plaintext. They are hashed using bcrypt with a salt factor of 10.

Secure Cookies: Session cookies are configured with `httpOnly: true` to prevent access from client-side JavaScript (XSS protection) and `secure: true` in production to ensure they are only sent over HTTPS. You may have reasons to set HTTPS in other environments on large teams working across different companies.

Payload Limiting: The express.json() middleware is configured with a 50kb limit to mitigate basic Denial of Service (DoS) attacks from large payloads. You want to anticipate the payload size incoming based on your use case and always set a limit to avoid this kind of issue.

Input Validation: The register route checks for existing usernames to prevent conflicts and provide clear user feedback.

Error Handling: try/catch blocks are used in all controllers to handle unexpected errors gracefully without crashing the server.

Rate Limiting: For production, it is highly recommended to add a rate-limiting middleware (like express-rate-limit) to the login and 2FA endpoints to prevent brute-force attacks.
