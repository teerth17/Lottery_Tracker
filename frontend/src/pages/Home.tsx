import axios from "axios"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";

interface User {
    id: number,
    email:string,
    firstname: string,
    lastname: string,
    createdAt: string
}

export const Home = () => {
    const [user, setUser] = useState<User | undefined>();
    const navigate = useNavigate();


    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token") || "";

            if(!token){
                alert("No token found. please login again.");
                navigate("/signin");
                return
            }

            try{
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/getUserById`,{
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            
                console.log("usre data log: ", response.data);
                setUser(response.data);
            }catch(error) {
                console.error("Error fecting user",error);
                alert("Error fetching user details. Please try again.");
                navigate("/signin")
            }
        }
        fetchUser();
    },[navigate])

    if(!user){
        return <div className="text-center mt-10 text-gray-600">Loading...</div>;
    }
    
    // return(
    //     <div className="p-6">
    //     <div className="text-xl font-semibold text-gray-800 mb-4">
    //       You are logged in as {user.firstname}
    //     </div>
  
    //     <div className="space-x-4">
    //       <button
    //         onClick={() => navigate(`/user/newTicket?id=${user.id}`)}
    //         className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
    //       >
    //         New Ticket
    //       </button>
    //       <button
    //         onClick={() => navigate(`/user/scanTicket?id=${user.id}`)}
    //         className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
    //       >
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div className="flex items-center justify-between p-4">
                    <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate mx-4 transition-colors duration-300">
                        Welcome, {user.firstname}!
                    </h1>
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            navigate("/signin");
                        }}
                        className="bg-red-50 hover:bg-red-100 dark:bg-red-900/50 dark:hover:bg-red-800/70 text-red-700 dark:text-red-200 px-4 py-2 rounded-lg font-semibold transition-all duration-200"
                    >
                        Logout
                    </button>
                </div>
            </div>

            <div className="p-4 max-w-2xl mx-auto">
                {/* User Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {user.firstname.charAt(0)}
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">{user.firstname} {user.lastname}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Member since {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                </div>

                {/* Actions Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    <h2 className="text-gray-900 dark:text-white font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => navigate(`/user/newTicket?id=${user.id}`)}
                            className="bg-green-600 hover:bg-green-700 text-white py-4 px-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Ticket
                        </button>
                        <button
                            onClick={() => navigate(`/user/scanTicket?id=${user.id}`)}
                            className="bg-blue-600 hover:bg-blue-700 text-white py-4 px-4 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Scan Ticket
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// const gerUserDetails = async (token:string) => {
    
//     const response = await axios.get("http://localhost:3000/api/v1/user/getUserById",{
//         headers: {
//             'Authorization': `Bearer ${token}`
//         }
//     })

//     console.log("usre data log: ", response.data);
//     return response.data;
// }