import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

type Ticket = {
    lotNumber: string;
    name: string;
    price: number;
    batchSize: number,
    uniqueCount: number
  };

export const NewTicket = () => {
    const token = localStorage.getItem('token') || "";
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [editingLotNumber,setEditingLotNumber] = useState<String | null>(null);
    const [editName,setEditName] = useState("");
    const [editPrice,setEditPrice] = useState<number>(0);
    const [uniqueCount,setUniqueCount] = useState(0);
    const [searchParams]  = useSearchParams();
       const [message, setMessage] = useState("");
    const userId = searchParams.get('id') || "";
    console.log("got user id: ", userId);

    useEffect(() => {
        getAllTickets();
    },[])

    const getAllTickets = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/v1/user/newTicket/getAllTickets",{
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            setTickets(response.data.tickets)
            console.log("Response from get ticket:", response.data);
          } catch (error: any) {
            console.error("Error getting all tickets:", error);
          }        
    }

    const deleteTicket = async (lotNumber:string,uniqueCount:number) => {
        try{
            const response = await axios.post("http://localhost:3000/api/v1/user/newTicket/deleteTicket",
                {
                    lotNumber,
                    uniqueCount
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                      },
                }
            )
            console.log("response from delete tickets: " , response.data);
            console.log("deleted: ", lotNumber);
            getAllTickets();
        }catch(error: any){
            console.log("Error deleting tickets: ", error)
        }
    }

    const handleUpdateClick = (ticket:Ticket) => {
        setEditingLotNumber(ticket.lotNumber);
        setEditName(ticket.name);
        setEditPrice(ticket.price);
        setUniqueCount(ticket.uniqueCount);
        console.log("ticket vount: " + ticket.uniqueCount);
         console.log("ticket vount: " + uniqueCount);
    }

    const updateTicket = async () => {
        if(!editingLotNumber) return;
        try{
            const response = await axios.put("http://localhost:3000/api/v1/user/newTicket/updateTicket",
                {
                    lotNumber: editingLotNumber,
                    name: editName,
                    price:editPrice,
                    uniqueCount:uniqueCount
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                      },
                }
            )
            console.log("response from update tickets: " , response.data);
            console.log("updated: ", editingLotNumber);
            setEditingLotNumber(null);
            getAllTickets();
        }catch(error: any){
            console.log("Error updating tickets: ", error)
        }
        
    }

//     return(
//         <div className="p-6 max-w-4xl mx-auto">
//             <div className="mb-4">
//   <button
//     onClick={() => navigate(`/user/home?id=${userId}`)}
//     className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow"
//   >
//     🏠 Home
//   </button>
// </div>

//       <h2 className="text-2xl font-bold mb-6 text-center">🎟️ All Tickets</h2>

//       <div className="flex justify-end mb-6">
//         <button
//           onClick={() => navigate(`/user/newTicket/add?id=${userId}`)}
//           className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow"
//         >
//           ➕ Add New Ticket
//         </button>
//       </div>

//       {tickets.length === 0 ? (
//         <p className="text-gray-500 text-center">No tickets found.</p>
//       ) : (
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//           {tickets.map((ticket) => (
//             <div
//               key={`${ticket.lotNumber}-${ticket.uniqueCount}`}
//               className="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
//             >
//              <div>
//   <p className="text-sm text-gray-600 font-medium">Lot #: {ticket.lotNumber}</p>
//             console.log("var ticket count:" + {uniqueCount} )
//              console.log("var ticket count:" + {ticket.uniqueCount} )
            
//   {editingLotNumber === ticket.lotNumber && uniqueCount === ticket.uniqueCount ? (
//     <div className="mt-2 space-y-2">
//       <input
//         type="text"
//         value={editName}
//         onChange={(e) => setEditName(e.target.value)}
//         placeholder="Enter new name"
//         className="w-full border px-2 py-1 rounded"
//       />
//       <input
//         type="number"
//         value={editPrice}
//         onChange={(e) => setEditPrice(Number(e.target.value))}
//         placeholder="Enter new price"
//         className="w-full border px-2 py-1 rounded"
//       />
//     </div>
//   ) : (
//     <>
//       <p className="text-lg font-semibold">{ticket.name}</p>
//       <p className="text-sm text-gray-600">Price: ${ticket.price.toFixed(2)}</p>
//       <p className="text-sm text-gray-600">Unique: {ticket.uniqueCount}</p>
//     </>
//   )}
// </div>


// <div className="mt-4 flex justify-between">
//   {editingLotNumber === ticket.lotNumber? (
//     <>
//       <button
//         onClick={updateTicket}
//         className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
//       >
//         💾 Save
//       </button>
//       <button
//         onClick={() => setEditingLotNumber(null)}
//         className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
//       >
//         ❌ Cancel
//       </button>
//     </>
//   ) : (
//     <>
//       <button
//         onClick={() => handleUpdateCLick(ticket)}
//         className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
//       >
//         ✏️ Update
//       </button>
//       {tickets.some(t => t.lotNumber === ticket.lotNumber && t.uniqueCount === ticket.uniqueCount+1)?
//           (
//             <button
//         onClick={() => {
//           setMessage("To Delete this ticket, U need to delete all tickets with higher unique count.")
//           setTimeout(() => setMessage(""),3000)
//         }}
//         className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
//       >
//         🗑️ Delete
//       </button>
//           ): (
//             <button

//         onClick={() => deleteTicket(ticket.lotNumber,ticket.uniqueCount)}
//         className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
//       >
//         🗑️ Delete
//       </button>
//           )
//     }
      
//     </>
//   )}
// </div>

//             </div>
//           ))}
//         </div>
//       )}
// {message && (
//   <p className={`mt-4 text-center text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
//     {message}
//   </p>
// )}
      
//     </div>
//     )

return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(`/user/home?id=${userId}`)}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg transition-all duration-200 touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden sm:inline">Home</span>
          </button>
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate mx-4 transition-colors duration-300">
            🎟️ All Tickets
          </h2>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Add New Ticket Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => navigate(`/user/newTicket/add?id=${userId}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl shadow transition-all duration-200 font-semibold"
          >
            ➕ Add New Ticket
          </button>
        </div>

        {/* Tickets List */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">No tickets found.</p>
              <p className="text-gray-400 dark:text-gray-500">Add a new ticket to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tickets.map((ticket) => (
                <div
                  key={`${ticket.lotNumber}-${ticket.uniqueCount}`}
                  className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 bg-white dark:bg-gray-800 flex flex-col justify-between transition-colors duration-200"
                >
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-1">
                      Lot #: <span className="text-gray-900 dark:text-white">{ticket.lotNumber}</span>
                    </p>
                    {editingLotNumber === ticket.lotNumber && uniqueCount === ticket.uniqueCount ? (
                      <div className="mt-2 space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Enter new name"
                          className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-xl transition-all duration-200"
                        />
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(Number(e.target.value))}
                          placeholder="Enter new price"
                          className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 rounded-xl transition-all duration-200"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">{ticket.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Price: <span className="text-green-600 dark:text-green-400 font-semibold">${ticket.price.toFixed(2)}</span></p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Unique: {ticket.uniqueCount}</p>
                      </>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between">
                    {editingLotNumber === ticket.lotNumber && uniqueCount === ticket.uniqueCount ? (
                      <>
                        <button
                          onClick={updateTicket}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-xl transition-all duration-200 font-semibold"
                        >
                          💾 Save
                        </button>
                        <button
                          onClick={() => setEditingLotNumber(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-xl transition-all duration-200 font-semibold"
                        >
                          ❌ Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleUpdateClick(ticket)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-xl transition-all duration-200 font-semibold"
                        >
                          ✏️ Update
                        </button>
                        {tickets.some(t => t.lotNumber === ticket.lotNumber && t.uniqueCount === ticket.uniqueCount + 1) ? (
                          <button
                            onClick={() => {
                              setMessage("To delete this ticket, you need to delete all tickets with higher unique count.");
                              setTimeout(() => setMessage(""), 3000);
                            }}
                            className="bg-gray-400 dark:bg-gray-600 text-white px-3 py-1 rounded-xl transition-colors cursor-not-allowed font-semibold"
                            disabled
                          >
                            🗑️ Delete
                          </button>
                        ) : (
                          <button
                            onClick={() => deleteTicket(ticket.lotNumber, ticket.uniqueCount)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-xl transition-all duration-200 font-semibold"
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`fixed bottom-4 left-4 right-4 mx-auto max-w-md z-50 p-4 rounded-xl shadow-lg transition-all duration-300 ${
            message.includes("success")
              ? "bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200"
              : "bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {message.includes("success") ? (
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className="font-medium">{message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
