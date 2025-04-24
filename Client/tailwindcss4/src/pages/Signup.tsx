import axios from 'axios';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/auth/signup", form, {
      withCredentials: true,
      });
      
       alert("Signup successful");
       console.log("Signup successful:", res.data);
       navigate("/login");
     } catch (error) {
       console.error("Signup failed:", error);
      
            if (axios.isAxiosError(error) && error.response) {
                console.error("Server response data:", error.response.data);
                console.error("Server response status:", error.response.status);
      
                if (error.response.status === 400 && error.response.data.message === "User already exists") {
                    alert("User already exists");
                } else {
                    const serverErrorMessage = error.response.data.message || `Error: ${error.response.status}`;
                    alert(serverErrorMessage);
                }
      
            } else {
                const networkErrorMessage = "Signup failed. Please check your network or try again later.";
                alert(networkErrorMessage);
            }
     }
       };

  return (
    <>
     <div className="min-h-screen  bg-black text-gray-100 p-4">
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-12 p-6 bg-black shadow-md rounded">
      <h2 className=" text-white text-2xl font-bold mb-4 ">Sign Up</h2>

      <input
        className=" w-full p-2 border mb-3 text-white"
        placeholder="Username"
        value={form.username}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
      />

      <input
        className="  w-full p-2 border mb-3 text-white"
        placeholder=" Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        className="w-full p-2 border mb-3 text-white"
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button className="w-full bg-gray-800 hover:bg-gray-700 text-white p-2 rounded" type="submit">
        Sign Up
      </button>
    </form>
     <button onClick={()=> navigate("/chat?guest=true")}
     className = "w-full bg-gray-800 hover:bg-gray-700 text-white p-2 rounded mt-4"
     >
       Continue as Guest
     </button>
     </div>
     </>
  );
}
