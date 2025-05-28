import axios from "axios";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom"
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const SoldTicketsSummary = () => {
    const token = localStorage.getItem('token')
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('id') || "";
    const [soldTickets,setSoldTickets] = useState<any[]>([])
    const [loading,setLoading] = useState(false);
    const [error,setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchSoldTickets = async () => {
            setLoading(true)
            setError(null)

            try{
                const response = await axios.get("http://localhost:3000/api/v1/user/scanTicket/getSoldTicketsData",{
                    headers: {
                Authorization: `Bearer ${token}`,
            },
                })
                setSoldTickets(response.data.data)
            }catch(err) {
                setError("Falied to fetch sold tickets..")
            }finally{
                setLoading(false)
            }
        }
        fetchSoldTickets();
    },[])

    const downloadCSV = () => {
        const headers = ["Lot Number", "Unique Count", "Opening Ticket", "Closing Ticket", "Sold", "Price", "Revenue"];
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

    // pdf download
    const downloadPDF = () => {
  const doc = new jsPDF();
  doc.text("Sold Tickets Summary", 14, 16);

  const tableColumn = [
    "Lot Number",
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
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Sold Tickets Summary</h1>
      <button
        onClick={downloadCSV}
        className="mb-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        disabled={soldTickets.length === 0}
      >
        Download CSV
      </button>

      <button
  onClick={downloadPDF}
  className="mb-4 ml-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
  disabled={soldTickets.length === 0}
>
  Download PDF
</button>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : soldTickets.length === 0 ? (
        <p className="text-gray-500">No sold ticket data found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1">Lot Number</th>
                <th className="border px-2 py-1">Unique Count</th>
                <th className="border px-2 py-1">Opening Ticket</th>
                <th className="border px-2 py-1">Closing Ticket</th>
                <th className="border px-2 py-1">Sold</th>
                <th className="border px-2 py-1">Price</th>
                <th className="border px-2 py-1">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {soldTickets.map((row, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{row.ticketLotNumber}</td>
                  <td className="border px-2 py-1">{row.ticketUniqueCount}</td>
                  <td className="border px-2 py-1">{row.openingTicketNumber}</td>
                  <td className="border px-2 py-1">{row.closingTicketNumber}</td>
                  <td className="border px-2 py-1">{row.sold}</td>
                  <td className="border px-2 py-1">${row.price}</td>
                  <td className="border px-2 py-1">${row.revenue}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
    <tr>
      <td className="border px-2 py-1 font-bold text-right" colSpan={6}>Total Revenue</td>
      <td className="border px-2 py-1 font-bold">${soldTickets.length > 0 ? soldTickets[soldTickets.length - 1].totalRevenue : 0}</td>
    </tr>
  </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}