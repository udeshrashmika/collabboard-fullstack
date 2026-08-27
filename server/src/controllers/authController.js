import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import User from "../../models/User.js";
import { sendResetEmail } from "../utils/email.js";

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are all required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res
        .status(409)
        .json({ message: "An account with that email already exists" });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      user: user.toJSON(),
      token: signToken(user._id),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Could not create the account" });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // password is select:false, so ask for it explicitly
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    // same message either way, so nobody can probe which emails exist
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    res.json({
      user: user.toJSON(),
      token: signToken(user._id),
    });
  } catch {
    res.status(500).json({ message: "Could not sign you in" });
  }
};

// GET /api/auth/me
export const me = async (req, res) => {
  res.json({ user: req.user.toJSON() });
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // always the same reply, whether or not the account exists
    const reply = {
      message: "If that email is registered, a reset link has been sent",
    };

    if (!user) return res.json(reply);

    const rawToken = user.createResetToken();
    await user.save({ validateBeforeSave: false });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    try {
      await sendResetEmail({ to: user.email, name: user.name, resetUrl });
    } catch (mailError) {
      // clear the token so a dead link isn't left valid for 30 minutes
      console.error("Reset email failed:", mailError.message);
      user.resetTokenHash = undefined;
      user.resetTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res
        .status(500)
        .json({ message: "Could not send the reset email. Please try again." });
    }

    res.json(reply);
  } catch {
    res.status(500).json({ message: "Could not process the request" });
  }
};

// POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;

    if (!email || !token || !password) {
      return res
        .status(400)
        .json({ message: "Email, token and new password are required" });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetTokenHash: tokenHash,
      resetTokenExpires: { $gt: Date.now() },
    }).select("+resetTokenHash +resetTokenExpires");

    if (!user) {
      return res
        .status(400)
        .json({ message: "That reset link is invalid or has expired" });
    }

    user.password = password; // pre-save hook hashes it
    user.resetTokenHash = undefined;
    user.resetTokenExpires = undefined;
    await user.save();

    res.json({
      user: user.toJSON(),
      token: signToken(user._id),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Could not reset the password" });
  }
};