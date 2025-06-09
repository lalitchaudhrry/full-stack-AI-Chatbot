const mongoose = require('mongoose');
const Chat = require('./models/chat');
const axios = require("axios");
const express = require("express");
const cors = require("cors");
require('dotenv').config();
const authRoutes = require('./routes/auth');
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const chatRoutes = require('./routes/chat');
const { AiOutlineOneToOne } = require('react-icons/ai');
const authMiddleware = require("./middleware/authMiddleware");
const app = express();

app.use(cors({
  origin:  'https://full-stack-ai-chatbot.vercel.app',
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));


app.get("/test-cors", (req, res) => {
  res.json({ message: "CORS working fine!" });
});
app.use(express.json());
// app.use(bodyParser.json());
app.use('/', chatRoutes);
app.use('/auth',authRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch((err) => console.error("MongoDB connection Error:", err));


app.get('/', (req, res) => {
  res.send("Server is running.");
});

app.post('/chat', authMiddleware , async (req, res) => {
  const userId = req.user.id;
  const userMessage = req.body.message;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [{ text: userMessage }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': "application/json"
        },
      }
    );

    const botReply = response.data.candidates[0].content.parts[0].text;

    await Chat.create({
      userId : userId,
      message: userMessage,
      reply: botReply
    });

    res.json({ reply: botReply });
  } catch (error) {
    console.log("error from Gemini:", error.response?.data || error.message);
    res.status(500).json({ reply: 'Sorry, something went wrong' });
  }
});

// ✅ Add this route
app.get('/history', authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const chats = await Chat.find({userId:userId}).sort({ createdAt: -1 });
    const formatted = chats.map(chat => ({
      userMessage: chat.message,
      botReply: chat.reply
    }));
    res.json(formatted);
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ error: "Failed to fetch chat history." });
  }
});



const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

