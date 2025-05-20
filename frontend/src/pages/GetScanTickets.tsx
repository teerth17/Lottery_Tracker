import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface ScanTicket{
    id:string;
    ticketNumber: string;
    ticketLotNumber: string;
    sessionType: string;
    scannedAt: string;
    ticket: {
        name:string;
        price: string;
    }
}



export const GetScanTickets = () => {
    const token = localStorage.getItem('token');
    const [searchParams]  = useSearchParams();
    const userId = searchParams.get('id') || "";
    const navigate = useNavigate();

    
    const [tickets,setTickets] = useState<ScanTicket[]>([])
    const [nextCursor,setNextCursor] = useState<string | null>(null)
    const [loading,setLoading] = useState(false)
    const [fromDate,setFromDate] = useState('');
    const [toDate,setToDate] = useState('');


    const loadTickets = async(reset = false) => {
        setLoading(true);

        const res = await axios.get("http://localhost:3000/api/v1/user/scanTicket/getAllScanTickets",{
            params: {
                take: 20,
                cursor: nextCursor,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined
            },
            headers: {
              Authorization: `Bearer ${token}`,
          },
        }) 

        console.log("got this resposne form load tickets: ", res.data)

        setTickets((prev) => [...prev,...res.data.data])
        setNextCursor(res.data.nextCursor);
        setLoading(false)
    }

    useEffect(() => {loadTickets()}, []);


    return(
        <div className='max-w-4xl mx-auto p-4'>
            <h2 className='text-2xl font-bold mb-4'>Scan History</h2>

            <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border rounded px-2 py-1"
          />
        </div>
        <button
          onClick={() => {
            setTickets([]);
            setNextCursor(null);
            loadTickets(true); 
          }}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Filter
        </button>

        <button
    onClick={() => navigate(`/user/home?id=${userId}`)}
    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow"
  >
    🏠 Home
  </button>
      </div>

            <div className='grid gap-4'>
                {tickets.map((scan) => (
                    <div key={scan.id}
                    className='border rounded-xl p-4 shadow flex justify-between items-center'>

                    <div>
                    <p><strong>Ticket:</strong> {scan.ticket.name}</p>
              <p><strong>Price:</strong> ${scan.ticket.price}</p>
              <p><strong>Lot:</strong> {scan.ticketLotNumber}</p>
              <p><strong>Scanned At:</strong> {new Date(scan.scannedAt).toLocaleString()}</p>
              <p><strong>Ticket Number:</strong> {scan.ticketNumber}</p>
              <p><strong>Session:</strong> {scan.sessionType}</p>
                    </div>    
                        </div>
                ))}

            {nextCursor && (
                <div className='text-center mt-4'>
                    <button
                    onClick={ () => loadTickets()}
                    className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
                    disabled= {loading}
                    >
                    {loading? 'Loading...': 'Load More'} 
                        </button>  
                 </div>
            )}
            </div>
        </div>
    )
}