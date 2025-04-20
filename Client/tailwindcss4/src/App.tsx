import { useEffect, useState } from 'react';
import { BiSidebar } from "react-icons/bi"; // sidebar toggle icon

// Type for chat history
interface ChatItem {
  userMessage: string;
  botReply: string;
}

function App() {
  const [userInput, setUserInput] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const messageToSend = userInput;
    setIsTyping(true);         // Start typing indicator
    setChatResponse('');       // Optional: clear previous response

    try {
      const response = await fetch("http://localhost:5000/chat", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await response.json();

      setChatHistory(prev => [
        { userMessage: messageToSend, botReply: data.reply },
        ...prev,
      ]);

      setChatResponse(data.reply);
      setUserInput(''); // ✅ Clear input after bot replies
    } catch (error) {
      console.error('Error sending message:', error);
      setChatResponse('Something went wrong.');
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/history');
        const data = await res.json();
        setChatHistory(data);
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100 relative items-center justify-center">
   {/* Sidebar Toggle Icon */}
<button
  onClick={() => setShowSidebar(!showSidebar)}
  className={`fixed top-4 z-50 p-2 bg-blue-400 text-white rounded-full hover:bg-blue-600 transition-all duration-300 ${showSidebar ? 'left-72' : 'left-4'}`}
>
  <BiSidebar size={20} />
</button>

{/* Sidebar */}
<div
  className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-4 z-40 overflow-y-auto transform transition-transform duration-300 ${
    showSidebar ? 'translate-x-0' : '-translate-x-full'
  }`}
>
  <h2 className="text-xl font-bold mb-4">Chat History</h2>
  {chatHistory.map((chat, index) => (
    <div key={index} className="mb-3 border-b pb-2">
      <p className="text-sm text-gray-700">
        <strong>You:</strong> {chat.userMessage}
      </p>
      <p className="text-sm text-blue-700">
        <strong>Bot:</strong> {chat.botReply}
      </p>
    </div>
  ))}
</div>


      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 ml-0 lg:ml-0">
        <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-xl">
          <h2 className="text-2xl font-bold mb-4 text-center">Smart Chatbot</h2>

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

          {/* Display user's message and bot reply */}
          <div className="mt-4 p-3 bg-gray-100 border rounded text-gray-800 min-h-[80px]">
            {isTyping && (
              <>
                <p><strong>You:</strong> {userInput}</p>
                <p className="text-blue-500"><strong>Bot:</strong> Typing...</p>
              </>
            )}
            {!isTyping && chatResponse && (
              <>
                <p><strong>You:</strong> {chatHistory[0]?.userMessage}</p>
                <p><strong>Output:</strong> {chatResponse}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
