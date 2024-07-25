const { Schema, model } = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const {createtoken,verifyToken} = require("../services/auth");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageUrl: {
      type: String,
      default: "images/default.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", function (next) {
  const user = this;

  if (!user.isModified("password")) return next();

  const salt = randomBytes(16).toString("hex");

  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  user.salt = salt;
  user.password = hashedPassword;

  next();
});

// Match password method
userSchema.statics.matchPasswordAndGenerateToken = async function (email, password) {
  const user = await this.findOne({ email });

  if (!user) throw new Error("Invalid email");

  const salt = user.salt;
  const hashedPassword = user.password;

  const providedHash = createHmac("sha256", salt)
    .update(password)
    .digest("hex");

  if (providedHash !== hashedPassword) throw new Error("Invalid Password");
  
  const token = createtoken(user);
  return token;
  // return { ...user._doc, password: undefined, salt: undefined };
};

const User = model("User", userSchema);

module.exports = User;
