import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      alert("Login successful!");
      navigate("/chat"); // redirect to chatbot
    } else {
      alert(data.message || "Login failed!");
    }
  };

  return (
    <>
     <div className="min-h-screen  bg-black text-gray-100 p-4">
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-12 p-6 bg-black shadow-md rounded">
      <h2 className="text-white text-2xl font-bold mb-4">Login</h2>
      <input className=" text-white w-full p-2 border mb-3" placeholder="Email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input className=" text-white w-full p-2 border mb-3" placeholder="Password" type="password" value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-700" type="submit">Login</button>
    </form>
    <p className="mt-4 text-sm text-center">
      Don’t have an account?{" "}
      <Link to="/signup" className="text-blue-600 hover:underline">
        Sign up here
      </Link>
    </p>
    <button onClick={()=> navigate("/chat?guest=true")}
      className = "w-full bg-gray-800 text-white p-2 rounded mt-4 hover:bg-gray-700"
      >
        Continue as Guest
      </button>
   </div>
    </>
  );
}
