import { useEffect, useState, useRef } from 'react';
import { BiSidebar } from "react-icons/bi";
import { useLocation } from "react-router-dom";

// Interface for each chat item
interface ChatItem {
  userMessage: string;
  botReply: string;
}

export default function ChatApp() {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isTyping, setIsTyping] = useState(false);

  const location = useLocation();
  const isGuest = new URLSearchParams(location.search).get("guest") === "true";

  const bottomRef = useRef<HTMLDivElement>(null); // For auto-scroll

  const getToken = () => localStorage.getItem('token');

  const handleSend = async () => {
    if (!userInput.trim()) return;

    const messageToSend = userInput;
    setIsTyping(true);

    try {
      if (isGuest) {
        const response = await fetch("http://localhost:5000/chat", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: messageToSend }),
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Guest mode error:', text);
          return;
        }

        const data = await response.json();
        const newChat = { userMessage: messageToSend, botReply: data.reply };
        setChatHistory(prev => [newChat, ...prev]);
        setUserInput('');
        return;
      }

      const token = getToken();
      if (!token) {
        console.error("No token found. User not logged in.");
        setIsTyping(false);
        return;
      }

      const response = await fetch("http://localhost:5000/chat", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (response.status === 401 || response.status === 403) {
        console.error("Authentication failed. Token invalid or missing.");
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        setIsTyping(false);
        return;
      }

      const data = await response.json();
      const newChat = { userMessage: messageToSend, botReply: data.reply };
      setChatHistory(prev => [newChat, ...prev]);
      setUserInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (isGuest) {
      console.log("Guest mode: no chat history loaded from server.");
      return;
    }

    const fetchHistory = async () => {
      const token = getToken();
      if (!token) {
        console.error("No token found. Cannot fetch history.");
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/history', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.status === 401 || res.status === 403) {
          console.error("Authentication failed fetching history.");
          localStorage.removeItem('token');
          localStorage.removeItem('username');
          return;
        }

        const data = await res.json();
        setChatHistory(data);
      } catch (err) {
        console.error("History load failed:", err);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <>
      {isGuest && (
        <div className="bg-gray-900 text-white p-3 text-center font-medium">
          You are in guest mode. Chats will be lost if you refresh the page.
        </div>
      )}
     
      <div className="flex min-h-screen bg-black text-gray-100 relative">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className={`fixed top-4 z-50 p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition ${showSidebar ? 'left-64' : 'left-4'}`}
          aria-label="Toggle Sidebar"
        >
          <BiSidebar size={20} />
        </button>

        {/* Sidebar for Chat History */}
        <div className={`fixed top-0 left-0 h-full w-64 bg-dark shadow p-4 z-40 overflow-y-auto transition-transform ${showSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
          <h2 className="text-xl font-bold mb-4">Chat History</h2>
          {chatHistory.map((chat, index) => (
            <div key={index} className="mb-3 border-b pb-2">
              <p className="text-sm"><strong>You:</strong> {chat.userMessage}</p>
              <p className="text-sm text-white"><strong>Bot:</strong> {chat.botReply}</p>
            </div>
          ))}
          {chatHistory.length === 0 && !isTyping && <p className="text-sm text-gray-500">No chat history yet. Start a conversation!</p>}
        </div>

        {/* Main Chat Section */}
        <div className={`flex-1 flex justify-center items-center p-6 ${showSidebar ? 'ml-64' : 'ml-0'} w-full transition-all`}>
          <div className="bg-black text-white shadow-xl rounded-lg p-6 w-full max-w-2xl">
            <h2 className=" bg-black text-2xl font-bold mb-4 text-center">Smart Chatbot</h2>

            <div className=" mt-4 bg-gray-900 border  border-gray-700  rounded p-3 min-h-[80px] max-h-[300px] overflow-y-auto ">
              {isTyping && <p className="text-white "><strong>Bot:</strong> Typing...</p>}
              {!isTyping && chatHistory.length > 0 && (
                <div className="mb-2">
                  <p className="text-sm"><strong>You:</strong> {chatHistory[0].userMessage}</p>
                  <p className="text-sm text-white"><strong>Bot:</strong> {chatHistory[0].botReply}</p>
                </div>
              )}
              {!isTyping && chatHistory.length === 0 && (
                <p className="  text-gray-400 text-sm">Start a conversation!</p>
              )}
              <div ref={bottomRef}></div>
            </div>

            <textarea
              className=" bg-black text-white w-full border rounded p-2 mt-4 mb-3"
              rows={4}
              placeholder="Type your message..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
            />

            <button
              onClick={handleSend}
              className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-700"
              disabled={isTyping}
            >
              {isTyping ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
      
    </>
  );
}
