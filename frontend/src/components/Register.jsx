import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Please fill in all the fields");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      await API.post("/auth/register", { name, email, password });
      toast.success("Registration successful!");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      toast.error(err.response?.data?.msg || "Registration failed");
    }
  };

  const inputClasses =
    "w-full px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-cyan-100 placeholder-cyan-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50 caret-cyan-400";

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://img.freepik.com/premium-photo/abstract-technology-background-with-blue-purple-tones_476363-3600.jpg')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Glassmorphism Register Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="backdrop-blur-2xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl p-10 ring-1 ring-white/20">
          <h1 className="text-4xl font-bold text-white text-center mb-10 tracking-wider">
            Register
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Name"
              className={inputClasses}
            />

            {/* Email */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Email"
              className={inputClasses}
            />

            {/* Password */}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Password"
              className={inputClasses}
            />

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-4 mt-6 text-white font-bold text-lg rounded-xl transform transition-all duration-300 shadow-lg hover:scale-105 ${
                isFocused
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 shadow-purple-500/50"
                  : "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-cyan-500/50 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/50"
              }`}
            >
              Register
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center mt-8 text-white hover:text-white">
            Already have an account?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-pink-400 font-semibold cursor-pointer hover:text-pink-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-400/50 transition transform inline-block"
            >
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
