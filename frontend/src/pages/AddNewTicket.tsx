import axios from "axios";
import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { BrowserMultiFormatReader } from "@zxing/library"
import BarcodeScanner from "react-qr-barcode-scanner";

export const AddNewTicket = () => {
    const token = localStorage.getItem('token') || "";
    const [lotNumber,setLotNumber] = useState("");
    const [name,setName] = useState("");
    const [batchSize,setBatchSize] = useState(0);
    const [price, setPrice] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [scanning,setScanning] = useState(false);

    const navigate = useNavigate();
    const [searchParams]  = useSearchParams();
    const userId = searchParams.get('id') || "";
    console.log("got user id: ", userId);

 
    const handleScan = (data: string | null) => {
        if (data) {
          console.log("Scanned: ", data);
          setLotNumber(data);
          setScanning(false);
          console.log("code from handlescan: ",data)
        }
      };
    
      const handleError = (err: any) => {
        console.error("Scanner error:", err);
      };    

    const handleAddTicket = async () => {
        if (!lotNumber || !batchSize || !name || !price || !userId || !token) {
          setMessage("Please fill all fields and ensure you're logged in.");
          return;
        }
        if(lotNumber.length != 12 ){
          setMessage("lottery number should be 12 digit, try again!")
          return;
        }

        console.log("this is lotNumber: " , lotNumber)
        const lotHint = lotNumber.slice(-5,-1)
        console.log("got this lotHint: ",lotHint);

        setLoading(true);
        try {
          const response = await axios.post(
            "http://localhost:3000/api/v1/user/newTicket/addNewTicket",
            {
              lotNumber,
              name,
              price,
              userId,
              lotHint,
              batchSize
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
    
          setMessage("Ticket added successfully!");
          console.log("Response from add ticket:", response.data);
        } catch (error: any) {
          console.error("Error adding ticket:", error);
          if(error.response && error.response.status == 400){
            const msg ="Ticket already inserted."
            setMessage(msg)
          }
          else{
            setMessage("Failed to add ticket. Please try again.");
          }
          
        } finally {
          setLoading(false);
        }
    }

//     return(
//         <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
//             <div className="mb-4">
//   <button
//     onClick={() => navigate(`/user/home?id=${userId}`)}
//     className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow"
//   >
//     🏠 Home
//   </button>
// </div>

//       <h2 className="text-xl font-bold mb-4">Add New Ticket</h2>

        
//         <div className="mb-4">
//             {!scanning ? (
//                 <button onClick={() => setScanning(true)}
//                 className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
//                     Start Scanning
//                 </button>
//             ): (
//                 <button onClick={() => setScanning(false)}
//                 className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">
//                     Stop Scanning
//                 </button>
//             )}
//         </div>


//       {scanning && (
//         <div className="mb-2 text-sm text-gray-700">
//         <BarcodeScanner width={500} height={500 }
//         onUpdate={(err,result) => {
//             console.log("result from onupdate: ", result)
//             if(result) handleScan(result.getText());
//             if(err) handleError(err);
//         }} 
//         />
//         </div>
//       )} 


//       <input
//         type="text"
//         placeholder="Lot Number"
//         value={lotNumber}
//         onChange={(e) => setLotNumber(e.target.value)}
//         className="w-full mb-2 p-2 border rounded"
//       />

//       <input
//         type="text"
//         placeholder="Ticket Name"
//         value={name}
//         onChange={(e) => setName(e.target.value)}
//         className="w-full mb-2 p-2 border rounded"
//       />

//       <input
//         type="number"
//         placeholder="Price"
//         value={price}
//         onChange={(e) => setPrice(Number(e.target.value))}
//         className="w-full mb-4 p-2 border rounded"
//       />

//       <input
//         type="number"
//         placeholder="Batch Size"
//         value={batchSize}
//         onChange={(e) => setBatchSize(Number(e.target.value))}
//         className="w-full mb-4 p-2 border rounded"
//       />


//       <button
//         onClick={handleAddTicket}
//         className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
//         disabled={loading}
//       >
//         {loading ? "Adding..." : "Add Ticket"}
//       </button>

//       {message && (
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
                        Add New Ticket
                    </h2>
                </div>
            </div>

            <div className="p-4 max-w-md mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-300">
                    {/* Scanner Controls */}
                    <div className="mb-4 flex gap-2">
                        {!scanning ? (
                            <button
                                onClick={() => setScanning(true)}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-200"
                            >
                                Start Scanning
                            </button>
                        ) : (
                            <button
                                onClick={() => setScanning(false)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-xl font-semibold transition-all duration-200"
                            >
                                Stop Scanning
                            </button>
                        )}
                    </div>

                    {scanning && (
                        <div className="mb-4 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700 p-2">
                            <BarcodeScanner
                                width={400}
                                height={300}
                                onUpdate={(err, result) => {
                                    if (result) handleScan(result.getText());
                                    if (err) handleError(err);
                                }}
                            />
                        </div>
                    )}

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Lot Number"
                            value={lotNumber}
                            onChange={(e) => setLotNumber(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl transition-all duration-200"
                        />
                        <input
                            type="text"
                            placeholder="Ticket Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl transition-all duration-200"
                        />
                        <input
                            type="number"
                            placeholder="Price"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl transition-all duration-200"
                        />
                        <input
                            type="number"
                            placeholder="Batch Size"
                            value={batchSize}
                            onChange={(e) => setBatchSize(Number(e.target.value))}
                            className="w-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white px-4 py-3 rounded-xl transition-all duration-200"
                        />
                    </div>

                    <button
                        onClick={handleAddTicket}
                        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                        disabled={loading}
                    >
                        {loading ? "Adding..." : "Add Ticket"}
                    </button>

                    {message && (
                        <div className={`mt-4 text-center text-sm font-medium ${message.includes("success") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                            {message}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

