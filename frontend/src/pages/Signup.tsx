

import axios from "axios"
import { AuthCard } from "../components/AuthCard"
import { TextInput } from "../components/TextInput"
import { data, useNavigate } from "react-router-dom"
import { useState } from "react"

export const SignUp = () => {
    const [email,setEmail] = useState('');
    const [firstname,setFirstname] = useState('');
    const[lastname,setLastname] = useState('');
    const [password,setPassword] = useState('');
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);


        const handleSignup= async () => {

            if (!email || !firstname || !lastname || !password) {
                setError("Please fill out all fields.");
                return;
              }
              setLoading(true);
              setMessage("");
            try {
                const response = await axios.post("http://localhost:3000/api/v1/user/signup", {
                  email,
                  firstname,
                  lastname,
                  password,
                });
          
                console.log("response from signup: ", response.data);
                localStorage.setItem("token", response.data.token);
                localStorage.setItem("userId", response.data.userId);

                setMessage("Signup successful! Redirecting...");
      setTimeout(() => navigate(`/user/home?id=${response.data.userId}`), 1500);
              } catch (error: any) {
                console.error("Signup failed:", error.response?.data?.message || error.message);
                setMessage(
        error.response?.data?.message || "Signup failed. Please try again."
      );
              }finally{
                setLoading(false)
              }
        }
    
   

    // return(
    //     <div className="h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 to-blue-300 px-4">
    //         <AuthCard>
    //             <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome</h2>

    //             {error && (
    //       <p className="text-red-500 text-sm text-center mb-4">{error}</p>
    //     )}

    //             <form onSubmit={(e) => {
    //         e.preventDefault();
    //         signInResponse();
    //       }}>
    //                 <TextInput label="Email" type="email" name="username" onChange={e => {console.log(e.target.value);
    //                     setEmail(e.target.value)
    //                 }}/>
    //                <TextInput label="fitstname" type="firstname" name="firstname" onChange={e => {console.log(e.target.value);
    //                     setFirstname(e.target.value)
    //                 }}/>
    //                 <TextInput label="Lastname" type="lastnmae" name="lastname" onChange={e => {console.log(e.target.value);
    //                     setLastname(e.target.value)
    //                 }}/>
                    
    //                 <TextInput label="Password" type="password" name="password" onChange={e => {setPassword(e.target.value)}}/>


    //                 <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg mt-4 transition duration-200">
    //                     Signup
    //                 </button>
    //             </form>

    //             <p className="text-center text-sm text-gray-500 mt-4">
    //       Already have an account? <a href="/signin" className="text-blue-600 hover:underline">Login</a>
    //     </p>
    //         </AuthCard>
    //     </div>
    // )

    return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-md w-full bg-gray-50 dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
        {/* Gradient accent bar */}
        <div className="h-2 w-full rounded-t-2xl bg-gradient-to-r from-blue-500 via-green-400 to-blue-400" />
        <div className="p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center tracking-tight">
            Create your account
          </h2>
          <form onSubmit={handleSignup} className="space-y-2">
            <TextInput
              label="First Name"
              type="text"
              name="firstname"
              value={firstname}
              onChange={(e) => setFirstname(e.target.value)}
            />
            <TextInput
              label="Last Name"
              type="text"
              name="lastname"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
            />
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
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 mt-2 shadow"
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
          {message && (
            <div
              className={`mt-4 text-center text-sm font-medium ${
                message.includes("success")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {message}
            </div>
          )}
          <div className="mt-6 text-center text-sm text-gray-700 dark:text-gray-200 mb-1">
            Already have an account?{" "}
            <button
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              onClick={() => navigate("/signin")}
              type="button"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}