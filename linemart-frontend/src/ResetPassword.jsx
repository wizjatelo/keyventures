import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client"); // default role
  const [cashierKey, setCashierKey] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      username,
      password,
    };

    // ✅ Add cashier key to payload only if role is cashier
    if (role === "cashier") {
      payload.cashier_key = cashierKey;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", payload);
      const redirectPath = response.data.redirect_to;
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit}>
        <select
          className="w-full p-2 border rounded mb-4"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="client">Client</option>
          <option value="cashier">Cashier</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 border rounded mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* ✅ Show this only if role is cashier */}
        {role === "cashier" && (
          <input
            type="text"
            placeholder="Cashier Key"
            className="w-full p-2 border rounded mb-4"
            value={cashierKey}
            onChange={(e) => setCashierKey(e.target.value)}
            required
          />
        )}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Login
        </button>
      </form>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      <p className="mt-6 text-center">
        <a href="/forgot-password" className="text-blue-600 hover:underline">
          Forgot Password?
        </a>
      </p>
    </div>
  );
};

export default Login;

