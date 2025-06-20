import axios from "axios";
import { AuthCard } from "../components/AuthCard";
import { TextInput } from "../components/TextInput";
import { data, useNavigate } from "react-router-dom";
import { useState } from "react";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const[error,setError] = useState("");
    const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const signInResponse = async () => {
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await axios.post("http://localhost:3000/api/v1/user/signin", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      navigate(`/user/home?id=${response.data.userId}`);
    } catch (error: any) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

 return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-md w-full bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        {/* Gradient accent bar */}
        <div className="h-2 w-full rounded-t-2xl bg-gradient-to-r from-blue-500 via-green-400 to-blue-400" />
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white tracking-tight">
            Welcome Back
          </h2>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              signInResponse();
            }}
            className="space-y-2"
          >
            <TextInput
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextInput
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl mt-2 transition-all duration-200 shadow"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don’t have an account?{" "}
            <button
              type="button"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              onClick={() => navigate("/signup")}
            >
              Register
            </button>
          </div>
        </div>
      </div>
    </div>
  );

};
