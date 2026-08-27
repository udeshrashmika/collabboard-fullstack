import jwt from "jsonwebtoken";
import User from "../../models/User.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "You are not signed in" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) {
      return res.status(401).json({ message: "This account no longer exists" });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired session" });
  }
}