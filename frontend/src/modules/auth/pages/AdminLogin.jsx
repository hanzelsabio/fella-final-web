import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

import "../../auth/assets/styles/login.css";

const AdminLogin = () => {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Submitting:", email, password); // 👈 check values
    try {
      await adminLogin(email, password);
    } catch (err) {
      console.error("Login error:", err); // 👈 check the actual error
      setError("Invalid email or password");
    }
  };

  return (
    <section className="login_section">
      <div className="min-h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-black/80 z-0"></div>
        <form
          onSubmit={handleSubmit}
          className="login_form p-8 w-full max-w-sm rounded-lg z-10"
        >
          <div className="flex justify-center p-4">
            <Link to="/">
              <img
                src="/fella-screen-prints-logo.png"
                className="w-40 drop-shadow-[0px_10px_10px_rgba(0,0,0,0.5)]"
                alt="Brand Logo"
              />
            </Link>
          </div>

          <h1 className="text-lg font-semibold p-3 uppercase text-center">
            Admin Login
          </h1>

          {error && (
            <p className="text-xs text-center text-red-500 font-medium mb-4">
              {error}
            </p>
          )}

          <div className="text-xs p-3">
            <input
              type="email"
              placeholder="Email"
              className="w-full border rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent px-8 py-3.5 mb-5"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full border rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-transparent px-8 py-3.5 mb-5"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              className="w-full bg-black rounded-md text-white px-3 py-3.5 mt-3"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AdminLogin;
