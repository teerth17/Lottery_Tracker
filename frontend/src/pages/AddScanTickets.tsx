import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BarcodeScannerBox from "../components/BarcodeScannerBox";

type Ticket = [{
  lotNumber: string;
  lotHint: string;
  name: string;
  price: number;
   batchSize: number,
    uniqueCount: number
}];
type ScanTicket = {
  id: string;
  ticketNumber: string;
  ticketLotNumber: string;
  ticketUniqueCount: number;
  sessionType: string;
  scannedAt: string;
  ticket?: Ticket;
};
export const AddScanTickets = () => {
  const token = localStorage.getItem("token");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userId = searchParams.get("id") || "";
  const [sessionType, setSessionType] = useState("Opening");
  const [ticketUniqueCount,setTicketUniqueCount] = useState(0);
  const [scannedTickets, setScannedTickets] = useState<ScanTicket[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanningWithScanner, setScanningWithScanner] = useState(false);
  const [message, setMessage] = useState("");
  const [alreadyScannedToday, setAlreadyScannedToday] = useState(false);
   const [loading, setLoading] = useState(false);
  const extractLotHint = (ticketNumber: string) => ticketNumber.slice(0, 4);
  console.log("got user id: ", userId);
  const scannerInputRef = useRef<HTMLInputElement>(null);
  const scanTimeout = useRef<number | null>(null);

  const checkingScannedToday = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/scanTicket/getLastTicketInfo`,
        {
          params: {sessionType},
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("response from lastticketINfo: ", response.data);

      if(!response.data.scannedAt){
        console.log("Didn't got any scans..")
        setAlreadyScannedToday(false);
      }else{
        // 2025-04-23T04:05:29.374Z
      const lastTicketScannedAt = response.data.scannedAt;
      const lastScanDate = new Date(lastTicketScannedAt)
        .toISOString()
        .split("T")[0];
      const currentScanDate = new Date(new Date()).toISOString().split("T")[0];

      console.log("last scan date: ", lastScanDate);
      console.log("current date: ", currentScanDate);

      
      if ( lastScanDate == currentScanDate && response.data.sessionType == sessionType) {
        console.log("same ");
        setAlreadyScannedToday(true);
      } else {
        setAlreadyScannedToday(false);
      }
      }
      
    } catch (error) {
      console.log("error fetching ticket info: ", error);
    }
  };

  // const handleDelete = async (scanId: string) => {
  //   console.log("got this scanId: ", scanId);
  //   try {
  //     await axios.post(
  //       "http://localhost:3000/api/v1/user/scanTicket/deleteScanTicket",
  //       {
  //         id: scanId,
  //       },
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
  //     setScannedTickets((prev) => prev.filter((scan) => scan.id !== scanId));
  //   } catch (error) {
  //     console.error("Failed to delete scan:", error);
  //   }
  // };

  const handleDeleteBatch = async () => {
    console.log("got into handlet delete batch..");
    console.log("this userId: ", userId);
    console.log("session type in delete: ", sessionType);

    const confirm = window.confirm(
      `Are you sure you want to delete all today's ${sessionType} scans?`
    );
    if (!confirm) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/user/scanTicket/deleteScanBatch`,
        {
          userId,
          sessionType,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAlreadyScannedToday(false);
      setScannedTickets([]);
    } catch (error) {
      console.log("faield to delete batch..", error);
      setMessage("Failed to delete previous beathc. Try again");
    }
  };

  const handleSave = async () => {
    
    try{
      setLoading(true);
      const payload = scannedTickets.map((t) => ({
        ticketNumber: t.ticketNumber,
        ticketLotNumber: t.ticketLotNumber,
        sessionType,
        ticketUniqueCount: t.ticketUniqueCount,
        userId
      }))
setLoading(false);
      await axios.post(`${import.meta.env.VITE_API_URL}/user/scanTicket/addScanBatch`,
        {tickets: payload},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

       setMessage("Tickets saved successfully!");
      setTimeout(() => setMessage(""), 3000);
      navigate(`/user/scanTicket/?id=${userId}`)

    }catch (error) {
      console.error("Failed to save batch:", error);
      setMessage("Failed to save tickets");
      setTimeout(() => setMessage(""), 3000);
    }finally{
      setLoading(false);
    }
  };

  const handleScanFromCamera = async (scannedData: string) => {
    console.log("Scanned from camera:", scannedData);
    scannedData = scannedData.slice(0,-2);
    
   if (scannerInputRef.current) {
            scannerInputRef.current.value = "";
            scannerInputRef.current.focus();
        }
    

    if (alreadyScannedToday) {
      setMessage(
        "Ticket Already scanned for today, To scan again you need to delete or You can scan tommorrow"
      );
      return;
    }

    
    console.log("Got this count outside if: " + ticketUniqueCount);
    try {
      const lotHint = extractLotHint(scannedData);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/newTicket/getTicketByLotHint`,
        {
          params: {
            lotHint,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("ticket response fron lotHint:  ", response.data);
      const ticket: Ticket = response.data.tickets;

      // unique count logic: 
      const maxCountForLot = Math.max(-1,
        ...scannedTickets.filter(t => t.ticketLotNumber === ticket[0].lotNumber).map(t => t.ticketUniqueCount)
      )
      console.log("maxCount; " + maxCountForLot)
      const nextUniqueCount = maxCountForLot +1;
      console.log("next count: " + nextUniqueCount)
      setTicketUniqueCount(nextUniqueCount);
      console.log("UNqiue count: " + ticketUniqueCount)

      if (
      scannedTickets.some(
        (t) =>
          t.ticketNumber === scannedData &&
          t.ticket &&
          nextUniqueCount > t.ticket.length - 1
      )
    ) {
      console.log("Got this count: " + nextUniqueCount);
      console.log("Duplicate ticket skipped.");
      
      setMessage("No ticket found. You need to add the ticket First")
      return;
    }

      const newTicket: ScanTicket = {
        id: crypto.randomUUID(),
        ticketNumber: scannedData,
        ticketLotNumber: ticket[0].lotNumber,
        ticketUniqueCount: nextUniqueCount, 
        sessionType,
        scannedAt: new Date().toISOString(),
        ticket,
      };
      setScannedTickets((prev) => [...prev, newTicket]);

    } catch (error: any) {
      setMessage("No ticket found, try again or add ticket")
      console.error("Scan failed: ", error);
    }
  };

  useEffect(() => {
    checkingScannedToday();
  }, [sessionType]);

  useEffect(() => {
    if(scanningWithScanner && scannerInputRef.current){
      scannerInputRef.current.focus();
    }
  },[scanningWithScanner])
//   return (
//     <div className="p-4 max-w-3xl mx-auto">
//       <button
//     onClick={() => navigate(`/user/home?id=${userId}`)}
//     className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow"
//   >
//     🏠 Home
//   </button>
//       <h2 className="text-2xl font-bold mb-4">Scan Tickets</h2>

//       <div className="mb-4">
//           <label className="block mb-1 font-medium">Select Session</label>
//           <select
//             value={sessionType}
//             onChange={(e) => setSessionType(e.target.value)}
//             className="border rounded p-2 w-full max-w-xs"
//           >
//             <option value="Opening">Opening</option>
//             <option value="Closing">Closing</option>
//           </select>
//         </div>

//       {alreadyScannedToday ? (
//         <div className="bg-yellow-100 p-4 rounded shadow-md">
//           <p className="text-yellow-800 font-medium">
//             You've already scanned for today's {sessionType} session.
//           </p>
//           <button
//             className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
//             onClick={handleDeleteBatch}
//           >
//             Delete Previous Scans
//           </button>
//         </div>
//       ) : (
//         <>
        

//         <div className="mb-4">
//           {!scanning ? (
//             <button
//               onClick={() => setScanning(true)}
//               className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
//             >
//               Start Camera
//             </button>
//           ) : (
//             <button
//               onClick={() => setScanning(false)}
//               className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
//             >
//               Stop Camera
//             </button>
//           )}
//         </div>

//         {scanning && (
//           <BarcodeScannerBox
//             onScan={handleScanFromCamera}
//             onClose={() => setScanning(false)}
//           />
//         )}

//         <div className="grid gap-4 mt-6">
//           {scannedTickets.map((scan) => (
//             <div
//                key={`${scan.ticketLotNumber}-${scan.ticketUniqueCount}`}
//               className="border rounded-xl p-4 shadow flex justify-between items-center"
//             >
//               <div>
//                 <p><strong>Ticket:</strong> {scan.ticket?.[0]?.name}</p>
//                 <p><strong>Price:</strong> ${scan.ticket?.[0]?.price}</p>
//                 <p><strong>Lot:</strong> {scan.ticketLotNumber}</p>
//                 <p><strong>Ticket Unique Count:</strong> {scan.ticketUniqueCount}</p>
//                 <p><strong>Scanned At:</strong> {new Date(scan.scannedAt).toLocaleString()}</p>
//                 <p><strong>Ticket Number:</strong> {scan.ticketNumber}</p>
//                 <p><strong>Session:</strong> {scan.sessionType}</p>
//               </div>

//               {scannedTickets.some(s => s.ticketLotNumber === scan.ticketLotNumber && s.ticketUniqueCount === scan.ticketUniqueCount+1) ?
//               (
//                 <button
//                onClick={() => {
//           setMessage("To Delete this ticket, U need to delete all tickets with higher unique count.")
//           setTimeout(() => setMessage(""),3000)
//         }}
//                 className="bg-red-500 text-white px-3 py-1 rounded"
//               >
//                 Delete
//               </button>
//               ): (
                

//                <button
//                 onClick={() => {
//                   setScannedTickets(prev => prev.filter(t => !(t.ticketLotNumber === scan.ticketLotNumber && t.ticketUniqueCount === scan.ticketUniqueCount)))
//                 }}
//                 className="bg-red-500 text-white px-3 py-1 rounded"
//               >
//                 Delete
//               </button>
//               )  
//             }
              
//             </div>
//           ))}
//         </div>

//         {scannedTickets.length > 0 && (
//           <div className="mt-6 text-right">
//             <button
//               onClick={handleSave}
//               className="bg-green-600 text-white px-6 py-2 rounded"
//             >
//               Save
//             </button>
//           </div>
//         )}

//         {message && (
//           <p
//             className={`mt-4 text-center text-sm ${
//               message.includes("successfully") ? "text-green-600" : "text-red-600"
//             }`}
//           >
//             {message}
//           </p>
//         )}
//       </>

//   )};
//   </div>

// )
// 
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Select Session Type</h2>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Session Type
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="Opening">Opening Session</option>
              <option value="Closing">Closing Session</option>
            </select>
          </div>
        </div>

        {/* Already Scanned Warning */}
        {alreadyScannedToday && (
          <div className="bg-amber-50 dark:bg-amber-900/50 border border-amber-200 dark:border-amber-700 rounded-2xl p-6 mb-6 transition-colors duration-300">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-amber-800 dark:text-amber-200 mb-2">
                  Session Already Completed
                </h3>
                <p className="text-amber-700 dark:text-amber-300 mb-4">
                  You've already scanned tickets for today's {sessionType} session.
                </p>
                <button
                  onClick={handleDeleteBatch}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 touch-manipulation flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Previous Scans
                </button>
              </div>
            </div>
          </div>
        )}

        {!alreadyScannedToday && (
          <>
            {/* Scanner Control Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Camera Scanner</h2>
              </div>

              

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                {!scanning ? (
                  <button
                    onClick={() => setScanning(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-200 touch-manipulation flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Start Camera Scanner
                  </button>
                ) : (
                  <button
                    onClick={() => setScanning(false)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-200 touch-manipulation flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6L9 15" />
                    </svg>
                    Stop Camera Scanner
                  </button>
                )}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                {!scanningWithScanner ? (
                  <button
                    onClick={() => setScanningWithScanner(true)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-200 touch-manipulation flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Scan with Scanner
                  </button>
                ) : (
                  <button
                    onClick={() => setScanningWithScanner(false)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-4 rounded-xl transition-all duration-200 touch-manipulation flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6L9 15" />
                    </svg>
                    Stop Scanning
                  </button>
                )}
              </div>
                </div>

              {scanning && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-center text-gray-600 dark:text-gray-300">
                    <div className="mb-4">
                      <div className="w-64 h-48 mx-auto bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                        <p>Camera Scanner Placeholder</p>
                      </div>
                    </div>
                    <p className="text-sm">Point your camera at the barcode to scan</p>
                  </div>
                  {/* Replace this div with your actual BarcodeScannerBox component */}
                  <BarcodeScannerBox
            onScan={handleScanFromCamera}
           
          />
                  {/* <BarcodeScannerBox onScan={handleScanFromCamera} onClose={() => setScanning(false)} /> */}
                </div>
              )}

              {scanningWithScanner && (
                <div className="mb-4">
                            <input
                                ref={scannerInputRef}
                                type="text"
                                className="w-full px-4 py-3 border border-blue-400 rounded-xl text-lg tracking-widest bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="Scan barcode here..."
                                 onChange={e => {
    if (scanTimeout.current) clearTimeout(scanTimeout.current);
    const value = e.currentTarget.value;
    scanTimeout.current = setTimeout(() => {
      if (value) {
        handleScanFromCamera(value);
        e.currentTarget.value = "";
      }
    }, 200); }}
                                autoFocus
                            />
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Focus is here. Scan with your external scanner.
                            </div>
                        </div>
              )}
            </div>

            {/* Scanned Tickets List */}
            {scannedTickets.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Scanned Tickets</h2>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium">
                    {scannedTickets.length} tickets
                  </div>
                </div>

                <div className="space-y-4">
                  {scannedTickets.map((scan) => (
                    <div
                      key={`${scan.ticketLotNumber}-${scan.ticketUniqueCount}`}
                      className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 hover:border-gray-300 dark:hover:border-gray-500 transition-colors duration-200"
                    >
                      {/* Mobile Layout */}
                      <div className="lg:hidden">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-gray-900 dark:text-white font-semibold text-lg">
                              {scan.ticket?.[0]?.name || 'Unknown Ticket'}
                            </h3>
                            <p className="text-green-600 dark:text-green-400 font-bold text-lg">
                              ${scan.ticket?.[0]?.price || '0.00'}
                            </p>
                          </div>
                          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                            {scan.sessionType}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Lot Number</p>
                            <p className="text-gray-900 dark:text-white font-medium">{scan.ticketLotNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Unique Count</p>
                            <p className="text-gray-900 dark:text-white font-medium">{scan.ticketUniqueCount}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Ticket Number</p>
                            <p className="text-gray-900 dark:text-white font-medium">{scan.ticketNumber}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-gray-400">Scanned At</p>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {new Date(scan.scannedAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Layout */}
                      <div className="hidden lg:flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div>
                            <h3 className="text-gray-900 dark:text-white font-semibold text-lg">
                              {scan.ticket?.[0]?.name || 'Unknown Ticket'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              Lot: {scan.ticketLotNumber} • Count: {scan.ticketUniqueCount} • #{scan.ticketNumber}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-green-600 dark:text-green-400 font-bold text-xl">
                              ${scan.ticket?.[0]?.price || '0.00'}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Price</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-900 dark:text-white font-medium">
                              {new Date(scan.scannedAt).toLocaleDateString()}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              {new Date(scan.scannedAt).toLocaleTimeString()}
                            </p>
                          </div>
                          <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium">
                            {scan.sessionType}
                          </span>
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="flex justify-end mt-4 lg:mt-0">
                        {scannedTickets.some(s => 
                          s.ticketLotNumber === scan.ticketLotNumber && 
                          s.ticketUniqueCount === scan.ticketUniqueCount + 1
                        ) ? (
                          <button
                            onClick={() => {
                              setMessage("To delete this ticket, you need to delete all tickets with higher unique count.");
                              setTimeout(() => setMessage(""), 3000);
                            }}
                            className="bg-gray-400 dark:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors cursor-not-allowed flex items-center gap-2"
                            disabled
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Cannot Delete
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setScannedTickets(prev => 
                                prev.filter(t => 
                                  !(t.ticketLotNumber === scan.ticketLotNumber && 
                                    t.ticketUniqueCount === scan.ticketUniqueCount)
                                )
                              );
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 touch-manipulation flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Save Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-semibold px-8 py-4 rounded-xl transition-all duration-200 touch-manipulation flex items-center gap-3 min-w-[160px] justify-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save All Tickets
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {scannedTickets.length === 0 && !scanning && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Tickets Scanned</h3>
                <p className="text-gray-500 dark:text-gray-400">Start the camera scanner to begin scanning tickets.</p>
              </div>
            )}
          </>
        )}

        {/* Message Toast */}
        {message && (
          <div className={`fixed bottom-4 left-4 right-4 mx-auto max-w-md z-50 p-4 rounded-xl shadow-lg transition-all duration-300 ${
            message.includes("successfully") 
              ? "bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-200" 
              : "bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-200"
          }`}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {message.includes("successfully") ? (
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

};
