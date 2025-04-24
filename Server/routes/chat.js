// backend/routes/chat.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/chat'); // Import Chat model
const axios = require("axios"); // HTTP client for API calls (e.g., to Gemini)
const jwt = require('jsonwebtoken'); // Import jwt for token verification within the route
const User = require('../models/User'); // Import User model to find user by ID
require('dotenv').config(); // Load environment variables

// This route handles receiving messages for BOTH authenticated and guest users
router.post('/chat', async (req, res) => {
   const userMessage = req.body.message;

  // Basic validation for the message
  if (!userMessage || userMessage.trim() === '') {
      return res.status(400).json({ reply: 'Message cannot be empty.' });
  }

  // --- Determine User Status (Authenticated or Guest) ---
  let userId = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
      try {
          // Verify token if present
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findById(decoded.id).select('_id'); // Only fetch ID
          if (user) {
              userId = user._id; // Set userId if authenticated user is found
              console.log("Chat Route: Authenticated user ID:", userId);
          } else {
              console.log("Chat Route: Token provided, but user not found.");
              // Token is invalid or user deleted, proceed as guest but log issue
          }
      } catch (err) {
          console.error("Chat Route: JWT Verification Error for provided token:", err.message);
          // Token is invalid, proceed as guest but log issue
      }
  } else {
      console.log("Chat Route: No token provided. Handling as guest.");
  }
  // --- End Determine User Status ---


  // --- Gemini API Call ---
try {
    // --- Prompt Engineering: Add instructions to the user message ---
    // Instruct the model to be brief, avoid asterisks, and markdown
    const prompt = `Please provide a brief response, typically under 50 to 100 words, and do not use any asterisks (*) or markdown formatting. Respond to the following: ${userMessage}`;
    // --- End Prompt Engineering ---

 // Make a POST request to the Gemini API
 const response = await axios.post(
 `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
 {
 contents: [
 {
 parts: [{ text: prompt }] // Send the modified prompt with instructions
 }
 ],
        // --- Generation Parameters (Optional, but helpful for control) ---
        generationConfig: {
            maxOutputTokens: 100, // Limit the maximum number of tokens (adjust as needed)
            temperature: 0.7, // Adjust temperature (0.0 is deterministic, higher is more creative)
            // You could also add stopSequences here if needed
        },
        // --- End Generation Parameters ---
 },
 {
headers: {
 'Content-Type': "application/json"
 },
}
 );

 // Extract the bot's reply from the API response
    // Use optional chaining (?.) for safer access
    const botReply = response.data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from bot.';

    // --- Post-processing (Optional fallback if prompt engineering isn't enough) ---
    // You could uncomment this if the model still includes asterisks
    // const cleanedBotReply = botReply.replace(/\*/g, ''); // Remove all asterisks globally
    // --- End Post-processing ---

    // --- Save to DB ONLY for Authenticated Users ---
    if (userId) { // Only save if userId is set (user is authenticated)
        console.log("Chat Route: Saving chat for authenticated user ID:", userId);
     await Chat.create({
    userId : userId, // Save the authenticated user's ID
     message: userMessage, // Save the original user message
    reply: botReply // Save the bot's response (or cleanedBotReply if used)
    });
    } else {
        console.log("Chat Route: Guest user, skipping database save.");
    }
    // --- End Save to DB ---


 // Send the bot's reply back to the frontend (same for both guest and authenticated)
 res.json({ reply: botReply });
 } catch (error) {
console.error("Chat Route: Error from Gemini API or processing chat:", error.response?.data || error.message);
res.status(500).json({ reply: 'Sorry, something went wrong with the chat.' });
 }
});

// Export the router
module.exports = router;
