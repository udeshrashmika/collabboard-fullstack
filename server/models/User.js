import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    password: {
      type: String,
      required: true,
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never returned unless explicitly asked for
    },

    resetTokenHash: { type: String, select: false },
    resetTokenExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

// hash the password whenever it changes
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// creates a reset token, stores only its hash, returns the raw one
userSchema.methods.createResetToken = function () {
  const raw = crypto.randomBytes(32).toString("hex");
  this.resetTokenHash = crypto.createHash("sha256").update(raw).digest("hex");
  this.resetTokenExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  return raw;
};

// strip sensitive fields and rename _id -> id for the client
userSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    delete ret.resetTokenHash;
    delete ret.resetTokenExpires;
    return ret;
  },
});

export default mongoose.model("User", userSchema);