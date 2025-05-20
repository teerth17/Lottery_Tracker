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
        if (!lotNumber || !name || !price || !userId || !token) {
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
              lotHint
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

    return(
        <div className="p-6 max-w-md mx-auto bg-white rounded shadow">
            <div className="mb-4">
  <button
    onClick={() => navigate(`/user/home?id=${userId}`)}
    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow"
  >
    🏠 Home
  </button>
</div>

      <h2 className="text-xl font-bold mb-4">Add New Ticket</h2>

        
        <div className="mb-4">
            {!scanning ? (
                <button onClick={() => setScanning(true)}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded">
                    Start Scanning
                </button>
            ): (
                <button onClick={() => setScanning(false)}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">
                    Stop Scanning
                </button>
            )}
        </div>


      {scanning && (
        <div className="mb-2 text-sm text-gray-700">
        <BarcodeScanner width={500} height={500 }
        onUpdate={(err,result) => {
            console.log("result from onupdate: ", result)
            if(result) handleScan(result.getText());
            if(err) handleError(err);
        }} 
        />
        </div>
      )} 


      <input
        type="text"
        placeholder="Lot Number"
        value={lotNumber}
        onChange={(e) => setLotNumber(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />

      <input
        type="text"
        placeholder="Ticket Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full mb-2 p-2 border rounded"
      />

      <input
        type="number"
        placeholder="Price"
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="w-full mb-4 p-2 border rounded"
      />

      <button
        onClick={handleAddTicket}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Ticket"}
      </button>

      {message && (
  <p className={`mt-4 text-center text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
    {message}
  </p>
)}
    </div>

    )
}

