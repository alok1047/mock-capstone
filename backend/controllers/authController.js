const User = require('../models/User');
const generateToken = require('../utils/generatetoken');

// Signup API
const signupUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if avatar was uploaded and get the URL
    const avatarUrl = req.file ? req.file.path : undefined;

    const user = await User.create({
      username: username.trim(),
      email: email.trim(),
      password,
      avatar: avatarUrl, // Save avatar URL if provided
      authProvider: 'local'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Signup successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider
      },
    });

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Login API
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        authProvider: user.authProvider
      },
    });

  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Google OAuth callback handler
const googleCallback = (req, res) => {
  try {
    // Get user information from passport
    const user = req.user;
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Redirect to frontend with token and user information
    // Use query parameters for the redirect
    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}&userId=${user._id}&username=${user.username}&email=${user.email}&authProvider=${user.authProvider}`);
    
  } catch (error) {
    console.error("Google auth error:", error);
    res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
  }
};

// Google auth failure handler
const googleAuthFailure = (req, res) => {
  res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
};

module.exports = { 
  signupUser, 
  loginUser,
  googleCallback,
  googleAuthFailure
};