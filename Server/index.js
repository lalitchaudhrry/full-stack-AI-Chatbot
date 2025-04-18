const axios = require("axios");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res)=>{
    res.send("Server is running.");
});

app.post('/chat',async(req , res)=>{
    const userMessage  = req.body.message;
   try{
    const response = await axios.post(
       `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, 
       {
        contents : [ 
            {
                parts:[{text:userMessage}]
            }
          ]
        },
    {
        headers:{
            'Content-Type':"application/json"
            
        },
    }
    );
    
    const botReply = response.data.candidates[0].content.parts[0].text;
    res.json({reply:botReply});
} catch(error){
    console.log("error from Gemini:",error.response?.data || error.message);
    res.status(500).json({reply:'Sorry , Something went wrong'});
}
});
const PORT = process.env.PORT || 5000;
app.listen(PORT , ()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});
