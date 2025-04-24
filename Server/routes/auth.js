// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

// Signup Route
router.post('/signup', async (req, res) => {
 try {
 console.log("Signup Route: Received signup data:", req.body);
 const { username, email, password } = req.body;

    console.log("Signup Route: Checking if user exists with email:", email);
    const existingUser = await User.findOne({ email });

 if (existingUser) {
        console.log("Signup Route: User already exists. Returning 400.");
        // Correct syntax for returning a 400 response with JSON
        return res.status(400).json({ message: "User already exists" });
    }

    console.log("Signup Route: User does not exist. Proceeding with hashing password.");
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Signup Route: Password hashed. Creating new user instance.");
    const newUser = new User({ username, email, password: hashedPassword });

    console.log("Signup Route: Saving new user to database.");
    await newUser.save();

    console.log("Signup Route: New user saved successfully. Returning 201.");
    res.status(201).json({ message: "User created" });
 } catch (err) {
    // This catch block should handle unexpected errors
    console.error("Signup Route: An unexpected error occurred:", err.message);
    // Log the full error stack for better debugging
    console.error(err.stack);
    res.status(500).json({ error: err.message || "An internal server error occurred during signup." }); // Return 500 for unexpected errors
}
});


// Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.status(200).json({ token, name: user.username });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
