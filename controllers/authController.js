const authService = require("../services/authService");

exports.register = async (req, res) => {
  try {
    const { name, email, password, photoURL } = req.body;
    const { token, user } = await authService.registerUser(
      name,
      email,
      password,
      photoURL
    );
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authService.loginUser(email, password);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
