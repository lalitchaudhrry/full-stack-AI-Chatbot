import { useState } from 'react';

function App() {
  const [userInput, setUserInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');

  const handleSend = async () => {
    if (!userInput) return;

    try {
      
      const response = await fetch("https://ai-chatbot-backend.onrender.com/chat", {
 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        
        body: JSON.stringify({ message: userInput }),
      });

      const data = await response.json();
      setChatResponse(data.reply);
    } catch (error) {
      console.error('Error sending message:', error);
      setChatResponse('Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center"> Gemini Chatbot</h2>
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 mb-3 text-gray-700"
          rows={4}
          placeholder="Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
        >
          Send
        </button>
        <div className="mt-4 p-3 bg-gray-100 border rounded text-gray-800 min-h-[80px]">
          <strong>Bot:</strong> {chatResponse}
        </div>
      </div>
    </div>
  );
}

export default App;
