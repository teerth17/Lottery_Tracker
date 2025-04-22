import axios from "axios";
import { AuthCard } from "../components/AuthCard";
import { TextInput } from "../components/TextInput";
import { data, useNavigate } from "react-router-dom";
import { useState } from "react";

export const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const[error,setError] = useState("");
  
  const navigate = useNavigate();
  const signInResponse = async () => {

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:3000/api/v1/user/signin", {
        email,
        password,
      });

      console.log("response from signin: ", response.data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);
      navigate(`/user/home?id=${response.data.userId}`);
    } catch (error: any) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 to-blue-300 px-4">
      <AuthCard>
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Welcome
        </h2>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            signInResponse();
          }}
        >
          <TextInput
            label="Email"
            type="email"
            name="username"
            onChange={(e) => {
              console.log(e.target.value);
              setEmail(e.target.value);
            }}
          />
          <TextInput
            label="Password"
            type="password"
            name="password"
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg mt-4 transition duration-200"
          >
            SignIn
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don’t have an account?{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            Register
          </a>
        </p>
      </AuthCard>
    </div>
  );
};
