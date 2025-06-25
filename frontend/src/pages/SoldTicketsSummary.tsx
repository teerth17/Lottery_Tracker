// import axios from "axios";
// import { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom"
// import jsPDF from "jspdf";
// import autoTable from "jspdf-autotable";

// export const SoldTicketsSummary = () => {
//     const token = localStorage.getItem('token')
//     const [searchParams] = useSearchParams();
//     const userId = searchParams.get('id') || "";
//     const [soldTickets,setSoldTickets] = useState<any[]>([])
//     const [totalRevenue,setTotalRevenue] = useState(0);
//     const [loading,setLoading] = useState(false);
//     const [error,setError] = useState<string | null>(null)
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchSoldTickets = async () => {
//             setLoading(true)
//             setError(null)

//             try{
//                 const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/scanTicket/getSoldTicketsData`,{
//                     headers: {
//                 Authorization: `Bearer ${token}`,
//             },
//                 })
//                 setSoldTickets(response.data.data)
//                 setTotalRevenue(response.data.totalRevenue);
//             }catch(err) {
//                 setError("Falied to fetch sold tickets..")
//             }finally{
//                 setLoading(false)
//             }
//         }
//         fetchSoldTickets();
//     },[])

//     const downloadCSV = () => {
//         const headers = ["Lot Number", "Unique Count", "Opening Ticket", "Closing Ticket", "Sold", "Price", "Revenue"];
//         const rows = soldTickets.map(row => [
//         row.ticketLotNumber,
//         row.ticketUniqueCount,
//         row.openingTicketNumber,
//         row.closingTicketNumber,
//         row.sold,
//         row.price,
//         row.revenue
//         ]);

//         const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
//         const blob = new Blob([csvContent], {type: "text/csv"});
//         const url = URL.createObjectURL(blob)
//         const a = document.createElement("a");
//         a.href = url
//         a.download = "sold_tickets_summary.csv"
//          a.click();
//     URL.revokeObjectURL(url);
//     }

//     // pdf download
//     const downloadPDF = () => {
//   const doc = new jsPDF();
//   doc.text("Sold Tickets Summary", 14, 16);

//   const tableColumn = [
//     "Lot Number",
//     "Unique Count",
//     "Opening Ticket",
//     "Closing Ticket",
//     "Sold",
//     "Price",
//     "Revenue"
//   ];
//   const tableRows = soldTickets.map(row => [
//     row.ticketLotNumber,
//     row.ticketUniqueCount,
//     row.openingTicketNumber,
//     row.closingTicketNumber,
//     row.sold,
//     row.price,
//     row.revenue
//   ]);

//   // @ts-ignore
//   autoTable(doc,{
//     head: [tableColumn],
//     body: tableRows,
//     startY: 20,
//     styles: { fontSize: 10 }
//   });

//   doc.save("sold_tickets_summary.pdf");
// };

//      return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-10">
//       <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur rounded-2xl shadow-xl p-8 border border-gray-200">
//         <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
//           <button
//             onClick={() => navigate(`/user/home?id=${userId}`)}
//             className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow transition"
//           >
//             🏠 Home
//           </button>
//           <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight text-center flex-1">
//             Sold Tickets Summary
//           </h1>
//           <div className="flex gap-2">
//             <button
//               onClick={downloadCSV}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow transition"
//               disabled={soldTickets.length === 0}
//             >
//               Download CSV
//             </button>
//             <button
//               onClick={downloadPDF}
//               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow transition"
//               disabled={soldTickets.length === 0}
//             >
//               Download PDF
//             </button>
//           </div>
//         </div>
//         {loading ? (
//           <p className="text-lg text-gray-600 text-center py-10">Loading...</p>
//         ) : error ? (
//           <p className="text-red-500 text-center py-10">{error}</p>
//         ) : soldTickets.length === 0 ? (
//           <p className="text-gray-500 text-center py-10">No sold ticket data found.</p>
//         ) : (
//           <div className="overflow-x-auto rounded-xl shadow">
//             <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden bg-white">
//               <thead className="bg-gradient-to-r from-blue-100 to-purple-100 sticky top-0 z-10">
//                 <tr>
//                   <th className="border px-4 py-2 font-semibold text-gray-700">Lot Number</th>
//                   <th className="border px-4 py-2 font-semibold text-gray-700">Unique Count</th>
//                   <th className="border px-4 py-2 font-semibold text-gray-700">Opening Ticket</th>
//                   <th className="border px-4 py-2 font-semibold text-gray-700">Closing Ticket</th>
//                   <th className="border px-4 py-2 font-semibold text-gray-700">Sold</th>
//                   <th className="border px-4 py-2 font-semibold text-gray-700">Price</th>
//                   <th className="border px-4 py-2 font-semibold text-gray-700">Revenue</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {soldTickets.map((row, idx) => (
//                   <tr
//                     key={idx}
//                     className={idx % 2 === 0 ? "bg-white" : "bg-blue-50 hover:bg-blue-100 transition"}
//                   >
//                     <td className="border px-4 py-2">{row.ticketLotNumber}</td>
//                     <td className="border px-4 py-2">{row.ticketUniqueCount}</td>
//                     <td className="border px-4 py-2">{row.openingTicketNumber}</td>
//                     <td className="border px-4 py-2">{row.closingTicketNumber}</td>
//                     <td className="border px-4 py-2">{row.sold}</td>
//                     <td className="border px-4 py-2">${row.price}</td>
//                     <td className="border px-4 py-2 font-semibold">${row.revenue}</td>
//                   </tr>
//                 ))}
//               </tbody>
//               <tfoot>
//                 <tr>
//                   <td className="border px-4 py-2 font-bold text-right bg-green-50" colSpan={6}>
//                     Total Revenue
//                   </td>
//                   <td className="border px-4 py-2 font-bold text-green-700 bg-green-50">${totalRevenue}</td>
//                 </tr>
//               </tfoot>
//             </table>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const SoldTicketsSummary = () => {
    const token = localStorage.getItem('token')
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('id') || "";
    const [soldTickets,setSoldTickets] = useState<any[]>([])
    const [totalRevenue,setTotalRevenue] = useState(0);
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState<string | null>(null)
    const navigate = useNavigate();
    const [selectedDate,setSelectedDate] = useState(() => {
      const today = new Date();
      return today.toISOString().slice(0,10);
    })

        const fetchSoldTickets = async (date:string) => {
            setLoading(true)
            setError(null)

            try{
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/scanTicket/getSoldTicketsData?date=${date}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setSoldTickets(response.data.data)
                setTotalRevenue(response.data.totalRevenue);
            }catch(err) {
                setError("Failed to fetch sold tickets..")
            }finally{
                setLoading(false)
            }
        }
     
    useEffect(() => {
      fetchSoldTickets(selectedDate);
    },[selectedDate]);

    const downloadCSV = () => {
        const headers = ["Lot Number", "Unique Count","Ticket Name", "Opening Ticket", "Closing Ticket", "Sold", "Price", "Revenue"];
        const rows = soldTickets.map(row => [
        row.ticketLotNumber,
        row.ticketUniqueCount,
        row.openingTicketNumber,
        row.closingTicketNumber,
        row.sold,
        row.price,
        row.revenue
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")
        const blob = new Blob([csvContent], {type: "text/csv"});
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a");
        a.href = url
        a.download = "sold_tickets_summary.csv"
         a.click();
    URL.revokeObjectURL(url);
    }

    const downloadPDF = () => {
  const doc = new jsPDF();
  doc.text("Sold Tickets Summary", 14, 16);

  const tableColumn = [
    "Lot Number",
    "Ticket Name",
    "Unique Count",
    "Opening Ticket",
    "Closing Ticket",
    "Sold",
    "Price",
    "Revenue"
  ];
  const tableRows = soldTickets.map(row => [
    row.ticketLotNumber,
    row.ticketUniqueCount,
    row.name,
    row.openingTicketNumber,
    row.closingTicketNumber,
    row.sold,
    row.price,
    row.revenue
  ]);

  // @ts-ignore
  autoTable(doc,{
    head: [tableColumn],
    body: tableRows,
    startY: 20,
    styles: { fontSize: 10 }
  });

  doc.save("sold_tickets_summary.pdf");
};

     return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile Header */}
      <div className="sticky top-0 z-50 bg-gray-800/95 backdrop-blur border-b border-gray-700">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate(`/user/home?id=${userId}`)}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="hidden sm:inline">Home</span>
          </button>
          
          <h1 className="text-lg md:text-xl font-bold text-white truncate mx-4">
            Sold Tickets
          </h1>
          
          {/* Mobile menu toggle - shown on small screens */}
          <button className="lg:hidden bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>


      <div className="flex items-center gap-3 mb-6">
  <label className="text-gray-200 font-medium" htmlFor="date-picker">
    Select Date:
  </label>
  <input
    id="date-picker"
    type="date"
    className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none"
    value={selectedDate}
    onChange={e => setSelectedDate(e.target.value)}
    max={new Date().toISOString().slice(0, 10)}
  />
</div>
      <div className="p-4 max-w-7xl mx-auto">
        {/* Revenue Summary Card */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-6 mb-6 shadow-lg">
          <div className="text-center text-white">
            <p className="text-sm opacity-90 mb-1">Total Revenue</p>
            <p className="text-3xl md:text-4xl font-bold">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={downloadCSV}
            disabled={soldTickets.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-4 rounded-xl shadow-lg transition-colors touch-manipulation flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CSV
          </button>
          <button
            onClick={downloadPDF}
            disabled={soldTickets.length === 0}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-6 py-4 rounded-xl shadow-lg transition-colors touch-manipulation flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Download PDF
          </button>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="bg-gray-800 rounded-2xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-300 text-lg">Loading tickets...</p>
          </div>
        ) : error ? (
          <div className="bg-red-900/50 border border-red-700 rounded-2xl p-6 text-center">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-300 text-lg font-medium">{error}</p>
          </div>
        ) : soldTickets.length === 0 ? (
          <div className="bg-gray-800 rounded-2xl p-8 text-center">
            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-lg font-medium mb-2">No Data Available</p>
            <p className="text-gray-500">No sold ticket data found.</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
              {soldTickets.map((ticket, idx) => (
                <div key={idx} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-white font-semibold text-lg">Lot #{ticket.ticketLotNumber}</p>
                      <p className="text-gray-400 text-sm">Count: {ticket.ticketUniqueCount}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-lg">${ticket.revenue}</p>
                      <p className="text-gray-400 text-sm">{ticket.sold} sold</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Opening</p>
                      <p className="text-white font-medium">{ticket.openingTicketNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Closing</p>
                      <p className="text-white font-medium">{ticket.closingTicketNumber}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Price</p>
                      <p className="text-white font-medium">${ticket.price}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Revenue</p>
                      <p className="text-green-400 font-bold">${ticket.revenue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-gray-800 rounded-2xl overflow-hidden border border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Lot Number</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Ticket Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Unique Count</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Opening</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Closing</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Sold</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {soldTickets.map((ticket, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? "bg-gray-800" : "bg-gray-750 hover:bg-gray-700 transition-colors"}>
                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{ticket.ticketLotNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{ticket.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{ticket.ticketUniqueCount}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{ticket.openingTicketNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{ticket.closingTicketNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{ticket.sold}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">${ticket.price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-green-400 font-semibold">${ticket.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-green-900/50 border-t-2 border-green-600">
                      <td className="px-6 py-4 font-bold text-right text-white" colSpan={6}>
                        Total Revenue
                      </td>
                      <td className="px-6 py-4 font-bold text-green-400 text-lg">${totalRevenue.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}