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
    const token = localStorage.getItem("token");
    const [searchParams]  = useSearchParams();
    const userId = searchParams.get('id') || "";
    console.log("got user id: ", userId);
    const navigate = useNavigate()
    const [lastScannedTickets,setLastScannedTickets] = useState<ScanTicket[]>([]);
    const [message, setMessage] = useState("");


    const getLastScanBatch  = async () => {

      try {
        const response = await axios.get("http://localhost:3000/api/v1/user/scanTicket/getLastScanTickets", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('response from last batch tickets: ', response.data);
        setLastScannedTickets(response.data.tickets);
        setMessage("Successfully loaded last scanned tickets");
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        console.error('Failed to fetch last scanned tickets:', error);
        setMessage("Failed to load last scanned tickets");
        setTimeout(() => setMessage(""), 3000);
      }
    }

    useEffect(() => {
        getLastScanBatch();
    },[])



//     return(
//         <div className="max-w-4xl mx-auto p-4">
          
//       <h1 className="text-3xl font-bold mb-6 text-center">Scan Ticket Dashboard</h1>

//       <div className="flex justify-center gap-4 mb-6">
//         <button
//           onClick={() => navigate(`/user/scanTicket/scan?id=${userId}`)}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
//         >
//           Scan New Tickets
//         </button>
//         <button
//           onClick={() => navigate(`/user/scanTicket/getAllScans?id=${userId}`)}
//           className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2 rounded-lg"
//         >
//           View All Scans
//         </button>


//         <button
//   onClick={() => navigate(`/user/scanTicket/soldSummary?id=${userId}`)}
//   className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
// >
//   View Sold Tickets Summary
// </button>

// <button
//     onClick={() => navigate(`/user/home?id=${userId}`)}
//     className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow"
//   >
//     🏠 Home
//   </button>
//       </div>

//       <div>
//         <h2 className="text-xl font-semibold mb-4 border-b pb-2">Recent Scanned Batch</h2>

//         {lastScannedTickets.length === 0 ? (
//           <p className="text-gray-500">No recent scanned tickets found.</p>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {lastScannedTickets.map((ticket) => (
//               <div
//                 key={ticket.id}
//                 className="border rounded-lg shadow-md p-4 bg-white space-y-1"
//               >
//                 <p><span className="font-semibold">Scan ID:</span> {ticket.id}</p>
//                 <p><span className="font-semibold">Session:</span> {ticket.sessionType}</p>
//                 <p><span className="font-semibold">Time:</span> {new Date(ticket.scannedAt).toLocaleString()}</p>
//                 <p><span className="font-semibold">Lot Number:</span> {ticket.ticketLotNumber}</p>
//                 <p><span className="font-semibold">Ticket Number:</span> {ticket.ticketNumber}</p>
//                 <p><span className="font-semibold">Name:</span> {ticket.ticket?.name}</p>
//                 <p><span className="font-semibold">Price:</span> ${ticket.ticket?.price}</p>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
  
//     )

return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Mobile Header */}
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
          <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white truncate mx-4 transition-colors duration-300">
            Scan Tickets
          </h1>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <h2 className="text-gray-900 dark:text-white font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate(`/user/scanTicket/scan?id=${userId}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-all duration-200 touch-manipulation active:scale-95 min-h-[56px] font-semibold"
            >
              Scan New Tickets
            </button>
            <button
              onClick={() => navigate(`/user/scanTicket/getAllScans?id=${userId}`)}
              className="bg-gray-200 hover:bg-blue-600 dark:bg-gray-700 dark:hover:bg-blue-600 text-gray-900 dark:text-white p-4 rounded-xl transition-all duration-200 touch-manipulation active:scale-95 min-h-[56px] font-semibold"
            >
              View All Scans
            </button>
            <button
              onClick={() => navigate(`/user/scanTicket/soldSummary?id=${userId}`)}
              className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl transition-all duration-200 touch-manipulation active:scale-95 min-h-[56px] font-semibold"
            >
              Sales Summary
            </button>
            <button
              onClick={() => navigate(`/user/home?id=${userId}`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl transition-all duration-200 touch-manipulation active:scale-95 min-h-[56px] font-semibold sm:hidden"
            >
              Home
            </button>
          </div>
        </div>

        {/* Recent Scanned Batch */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Scanned Batch</h2>
          </div>
          {lastScannedTickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {/* Optionally add an icon here */}
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">No recent scans found</p>
              <p className="text-gray-400 dark:text-gray-500">Start scanning tickets to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lastScannedTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-500 transition-colors duration-200 bg-white dark:bg-gray-800"
                >
                  {/* Mobile Layout */}
                  <div className="lg:hidden">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold text-lg">
                          {ticket.ticket?.name || "Unknown Ticket"}
                        </h3>
                        <p className="text-green-600 dark:text-green-400 font-bold text-lg">
                          ${ticket.ticket?.price || "0.00"}
                        </p>
                      </div>
                      <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                        {ticket.sessionType}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Lot Number</p>
                        <p className="text-gray-900 dark:text-white font-medium">{ticket.ticketLotNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Ticket Number</p>
                        <p className="text-gray-900 dark:text-white font-medium">{ticket.ticketNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 dark:text-gray-400">Scanned At</p>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {new Date(ticket.scannedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Desktop Layout */}
                  <div className="hidden lg:flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <div>
                        <h3 className="text-gray-900 dark:text-white font-semibold text-lg">
                          {ticket.ticket?.name || "Unknown Ticket"}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Lot: {ticket.ticketLotNumber} • #{ticket.ticketNumber}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-green-600 dark:text-green-400 font-bold text-xl">
                          ${ticket.ticket?.price || "0.00"}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Price</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {new Date(ticket.scannedAt).toLocaleDateString()}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {new Date(ticket.scannedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium">
                        {ticket.sessionType}
                      </span>
                    </div>
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