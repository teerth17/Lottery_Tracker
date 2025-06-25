// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useNavigate, useSearchParams } from 'react-router-dom';

// interface ScanTicket{
//     id:string;
//     ticketNumber: string;
//     ticketLotNumber: string;
//     sessionType: string;
//     scannedAt: string;
//     ticket: {
//         name:string;
//         price: string;
//     }
// }



// export const GetScanTickets = () => {
//     const token = localStorage.getItem('token');
//     const [searchParams]  = useSearchParams();
//     const userId = searchParams.get('id') || "";
//     const navigate = useNavigate();

    
//     const [tickets,setTickets] = useState<ScanTicket[]>([])
//     const [nextCursor,setNextCursor] = useState<string | null>(null)
//     const [loading,setLoading] = useState(false)
//     const [fromDate,setFromDate] = useState('');
//     const [toDate,setToDate] = useState('');


//     const loadTickets = async(reset = false) => {
//         setLoading(true);

//         const res = await axios.get("http://localhost:3000/api/v1/user/scanTicket/getAllScanTickets",{
//             params: {
//                 take: 20,
//                 cursor: nextCursor,
//                 fromDate: fromDate || undefined,
//                 toDate: toDate || undefined
//             },
//             headers: {
//               Authorization: `Bearer ${token}`,
//           },
//         }) 

//        if (reset) {
//     setTickets(res.data.data); // Replace tickets
//   } else {
//     setTickets((prev) => [...prev, ...res.data.data]); // Append tickets
//   }
//   setNextCursor(res.data.nextCursor);
//   setLoading(false);
//     }

//     useEffect(() => {loadTickets(true)}, []);


//     return(
//         <div className='max-w-4xl mx-auto p-4'>
//             <h2 className='text-2xl font-bold mb-4'>Scan History</h2>

//             <div className="flex gap-4 mb-4 items-end">
//         <div>
//           <label className="block text-sm font-medium mb-1">From Date</label>
//           <input
//             type="date"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//             className="border rounded px-2 py-1"
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium mb-1">To Date</label>
//           <input
//             type="date"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//             className="border rounded px-2 py-1"
//           />
//         </div>
//         <button
//           onClick={() => {
//             setTickets([]);
//             setNextCursor(null);
//             loadTickets(true); 
//           }}
//           className="bg-green-600 text-white px-4 py-2 rounded"
//         >
//           Filter
//         </button>

//         <button
//     onClick={() => navigate(`/user/home?id=${userId}`)}
//     className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow"
//   >
//     🏠 Home
//   </button>
//       </div>

//             <div className='grid gap-4'>
//                 {tickets.map((scan) => (
                  
//                     <div key={scan.id}
//                     className='border rounded-xl p-4 shadow flex justify-between items-center'>

//                     <div>
//                       <p>length: {tickets.length}</p>
//                     <p><strong>Ticket:</strong> {scan.ticket.name}</p>
//               <p><strong>Price:</strong> ${scan.ticket.price}</p>
//               <p><strong>Lot:</strong> {scan.ticketLotNumber}</p>
//               <p><strong>Scanned At:</strong> {new Date(scan.scannedAt).toLocaleString()}</p>
//               <p><strong>Ticket Number:</strong> {scan.ticketNumber}</p>
//               <p><strong>Session:</strong> {scan.sessionType}</p>
//                     </div>    
//                         </div>
//                 ))}

//             {nextCursor && (
//                 <div className='text-center mt-4'>
//                     <button
//                     onClick={ () => loadTickets()}
//                     className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
//                     disabled= {loading}
//                     >
//                     {loading? 'Loading...': 'Load More'} 
//                         </button>  
//                  </div>
//             )}
//             </div>
//         </div>
//     )
// }

import { useEffect, useState } from 'react';
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

        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/user/scanTicket/getAllScanTickets`,{
                params: {
                    take: 20,
                    cursor: reset ? null : nextCursor,
                    fromDate: fromDate || undefined,
                    toDate: toDate || undefined
                },
                headers: {
                  Authorization: `Bearer ${token}`,
              },
            }) 

           if (reset) {
                setTickets(res.data.data);
            } else {
                setTickets((prev) => [...prev, ...res.data.data]);
            }
            setNextCursor(res.data.nextCursor);
        } catch (error) {
            console.error('Failed to load tickets:', error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {loadTickets(true)}, []);

    const handleFilter = () => {
        setTickets([]);
        setNextCursor(null);
        loadTickets(true);
    };

    const clearFilters = () => {
        setFromDate('');
        setToDate('');
        setTickets([]);
        setNextCursor(null);
        setTimeout(() => loadTickets(true), 100);
    };

    return(
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
                        Scan History
                    </h1>
                    
                    <div className="flex items-center gap-2">
                        <div className="bg-gray-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {tickets.length}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 max-w-7xl mx-auto">
                {/* Filter Section */}
                <div className="bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-700">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Filter Scans
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleFilter}
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors touch-manipulation flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {loading ? 'Filtering...' : 'Apply Filter'}
                        </button>
                        <button
                            onClick={clearFilters}
                            disabled={loading}
                            className="flex-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors touch-manipulation flex items-center justify-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Clear
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                {tickets.length === 0 && !loading ? (
                    <div className="bg-gray-800 rounded-2xl p-8 text-center border border-gray-700">
                        <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-400 text-lg font-medium mb-2">No Scans Found</p>
                        <p className="text-gray-500">No ticket scans match your current filters.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {tickets.map((scan) => (
                            <div key={scan.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-gray-600 transition-colors">
                                {/* Mobile Layout */}
                                <div className="lg:hidden">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-white font-semibold text-lg">{scan.ticket.name}</h3>
                                            <p className="text-green-400 font-bold text-lg">${scan.ticket.price}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                scan.sessionType === 'WIN' 
                                                    ? 'bg-green-900 text-green-300 border border-green-700' 
                                                    : 'bg-red-900 text-red-300 border border-red-700'
                                            }`}>
                                                {scan.sessionType}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-gray-400">Lot Number</p>
                                            <p className="text-white font-medium">{scan.ticketLotNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-400">Ticket #</p>
                                            <p className="text-white font-medium">{scan.ticketNumber}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-gray-400">Scanned At</p>
                                            <p className="text-white font-medium">{new Date(scan.scannedAt).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Layout */}
                                <div className="hidden lg:flex items-center justify-between">
                                    <div className="flex items-center space-x-6">
                                        <div>
                                            <h3 className="text-white font-semibold text-lg">{scan.ticket.name}</h3>
                                            <p className="text-gray-400 text-sm">Lot: {scan.ticketLotNumber} • Ticket: {scan.ticketNumber}</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-green-400 font-bold text-xl">${scan.ticket.price}</p>
                                            <p className="text-gray-400 text-sm">Price</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-white font-medium">{new Date(scan.scannedAt).toLocaleDateString()}</p>
                                            <p className="text-gray-400 text-sm">{new Date(scan.scannedAt).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                            scan.sessionType === 'WIN' 
                                                ? 'bg-green-900 text-green-300 border border-green-700' 
                                                : 'bg-red-900 text-red-300 border border-red-700'
                                        }`}>
                                            {scan.sessionType}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Load More Button */}
                        {nextCursor && (
                            <div className="text-center pt-6">
                                <button
                                    onClick={() => loadTickets()}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold px-8 py-4 rounded-xl transition-colors touch-manipulation flex items-center justify-center gap-2 mx-auto min-w-[160px]"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Loading...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Load More
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}