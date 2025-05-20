import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"

type Ticket = {
    lotNumber: string;
    lotHint:string;
    name: string;
    price: number;
}
type ScanTicket = {
    id:string;
    ticketNumber: string;
    ticketLotNumber: string;
    sessionType: string;
    scannedAt: string;
    ticket?:Ticket;
}

export const ScanTicket = () => {
    const token = localStorage.getItem('token');
    const [searchParams]  = useSearchParams();
    const userId = searchParams.get('id') || "";
    console.log("got user id: ", userId);
    const navigate = useNavigate()
    const [lastScannedTickets,setLastScannedTickets] = useState<ScanTicket[]>([]);
    


    const getLastScanBatch  = async () => {

        const response = await axios.get("http://localhost:3000/api/v1/user/scanTicket/getLastScanTickets", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })

        console.log('resoponse from last batch tickets: ', response.data)
        setLastScannedTickets(response.data.tickets)
    }

    useEffect(() => {
        getLastScanBatch();
    },[])
    return(
        <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Scan Ticket Dashboard</h1>

      <div className="flex justify-center gap-4 mb-6">
        <button
          onClick={() => navigate(`/user/scanTicket/scan?id=${userId}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          Scan New Tickets
        </button>
        <button
          onClick={() => navigate(`/user/scanTicket/getAllScans?id=${userId}`)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg"
        >
          View All Scans
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Recent Scanned Batch</h2>

        {lastScannedTickets.length === 0 ? (
          <p className="text-gray-500">No recent scanned tickets found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lastScannedTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border rounded-lg shadow-md p-4 bg-white space-y-1"
              >
                <p><span className="font-semibold">Scan ID:</span> {ticket.id}</p>
                <p><span className="font-semibold">Session:</span> {ticket.sessionType}</p>
                <p><span className="font-semibold">Time:</span> {new Date(ticket.scannedAt).toLocaleString()}</p>
                <p><span className="font-semibold">Lot Number:</span> {ticket.ticketLotNumber}</p>
                <p><span className="font-semibold">Ticket Number:</span> {ticket.ticketNumber}</p>
                <p><span className="font-semibold">Name:</span> {ticket.ticket?.name}</p>
                <p><span className="font-semibold">Price:</span> ${ticket.ticket?.price}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  
    )
}