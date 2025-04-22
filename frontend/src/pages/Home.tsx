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
                const response = await axios.get("http://localhost:3000/api/v1/user/getUserById",{
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
    
    return(
        <div className="p-6">
        <div className="text-xl font-semibold text-gray-800 mb-4">
          You are logged in as {user.firstname}
        </div>
  
        <div className="space-x-4">
          <button
            onClick={() => navigate(`/user/newTicket?id=${user.id}`)}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            New Ticket
          </button>
          <button
            onClick={() => navigate(`/user/scanTicket?id=${user.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
          >
            Scan Ticket
          </button>
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