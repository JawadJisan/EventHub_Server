const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Register new user
exports.registerUser = async (name, email, password, photoURL) => {
  try {
    let user = await User.findOne({ email });
    if (user) throw new Error("User already exists");

    user = new User({ name, email, password, photoURL });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return { token, user };
  } catch (err) {
    throw err;
  }
};

// Authenticate user
exports.loginUser = async (email, password) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("No account found with this email address");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Incorrect password. Please try again");
    }

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return { token, user };
  } catch (err) {
    throw err;
  }
};
