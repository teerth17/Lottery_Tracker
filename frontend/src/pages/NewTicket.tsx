import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

type Ticket = {
    lotNumber: string;
    name: string;
    price: number;
  };

export const NewTicket = () => {
    const token = localStorage.getItem('token') || "";
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [editingLotNumber,setEditingLotNumber] = useState<String | null>(null);
    const [editName,setEditName] = useState("");
    const[editPrice,setEditPrice] = useState<number>(0);
    const [searchParams]  = useSearchParams();
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
            setTickets(response.data.ticket)
            console.log("Response from get ticket:", response.data);
          } catch (error: any) {
            console.error("Error getting all tickets:", error);
          }        
    }

    const deleteTicket = async (lotNumber:string) => {
        try{
            const response = await axios.post("http://localhost:3000/api/v1/user/newTicket/deleteTicket",
                {
                    lotNumber
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

    const handleUpdateCLick = (ticket:Ticket) => {
        setEditingLotNumber(ticket.lotNumber);
        setEditName(ticket.name);
        setEditPrice(ticket.price);
    }

    const updateTicket = async () => {
        if(!editingLotNumber) return;
        try{
            const response = await axios.put("http://localhost:3000/api/v1/user/newTicket/updateTicket",
                {
                    lotNumber: editingLotNumber,
                    name: editName,
                    price:editPrice,
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

    return(
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-4">
  <button
    onClick={() => navigate(`/user/home?id=${userId}`)}
    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow"
  >
    🏠 Home
  </button>
</div>

      <h2 className="text-2xl font-bold mb-6 text-center">🎟️ All Tickets</h2>

      <div className="flex justify-end mb-6">
        <button
          onClick={() => navigate(`/user/newTicket/add?id=${userId}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded shadow"
        >
          ➕ Add New Ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <p className="text-gray-500 text-center">No tickets found.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.lotNumber}
              className="bg-white rounded-lg shadow p-4 flex flex-col justify-between"
            >
             <div>
  <p className="text-sm text-gray-600 font-medium">Lot #: {ticket.lotNumber}</p>

  {editingLotNumber === ticket.lotNumber ? (
    <div className="mt-2 space-y-2">
      <input
        type="text"
        value={editName}
        onChange={(e) => setEditName(e.target.value)}
        placeholder="Enter new name"
        className="w-full border px-2 py-1 rounded"
      />
      <input
        type="number"
        value={editPrice}
        onChange={(e) => setEditPrice(Number(e.target.value))}
        placeholder="Enter new price"
        className="w-full border px-2 py-1 rounded"
      />
    </div>
  ) : (
    <>
      <p className="text-lg font-semibold">{ticket.name}</p>
      <p className="text-sm text-gray-600">Price: ${ticket.price.toFixed(2)}</p>
    </>
  )}
</div>


<div className="mt-4 flex justify-between">
  {editingLotNumber === ticket.lotNumber ? (
    <>
      <button
        onClick={updateTicket}
        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
      >
        💾 Save
      </button>
      <button
        onClick={() => setEditingLotNumber(null)}
        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
      >
        ❌ Cancel
      </button>
    </>
  ) : (
    <>
      <button
        onClick={() => handleUpdateCLick(ticket)}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
      >
        ✏️ Update
      </button>
      <button
        onClick={() => deleteTicket(ticket.lotNumber)}
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
      >
        🗑️ Delete
      </button>
    </>
  )}
</div>

            </div>
          ))}
        </div>
      )}
    </div>
    )
}
