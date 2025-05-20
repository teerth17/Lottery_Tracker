import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import BarcodeScannerBox from "../components/BarcodeScannerBox";

type Ticket = {
  lotNumber: string;
  lotHint: string;
  name: string;
  price: number;
};
type ScanTicket = {
  id: string;
  ticketNumber: string;
  ticketLotNumber: string;
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
  const [ticketNumber, setTicketNumber] = useState("");
  const [scannedTickets, setScannedTickets] = useState<ScanTicket[]>([]);
  const [scanning, setScanning] = useState(false);
  const [message, setMessage] = useState("");
  const [alreadyScannedToday, setAlreadyScannedToday] = useState(false);

  const extractLotHint = (ticketNumber: string) => ticketNumber.slice(0, 4);
  console.log("got user id: ", userId);

  const checkingScannedToday = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/v1/user/scanTicket/getLastTicketInfo",
        {
          params: {sessionType},
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("response from lastticketINfo: ", response.data);
      // 2025-04-23T04:05:29.374Z
      const lastTicketScannedAt = response.data.scannedAt;
      const lastScanDate = new Date(lastTicketScannedAt)
        .toISOString()
        .split("T")[0];
      const currentScanDate = new Date(new Date()).toISOString().split("T")[0];

      console.log("last scan date: ", lastScanDate);
      console.log("current date: ", currentScanDate);

      
      if ( lastScanDate == currentScanDate) {
        console.log("same ");
        setAlreadyScannedToday(true);
      } else {
        setAlreadyScannedToday(false);
      }
    } catch (error) {
      console.log("error fetching ticket info: ", error);
    }
  };

  const handleDelete = async (scanId: string) => {
    console.log("got this scanId: ", scanId);
    try {
      await axios.post(
        "http://localhost:3000/api/v1/user/scanTicket/deleteScanTicket",
        {
          id: scanId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setScannedTickets((prev) => prev.filter((scan) => scan.id !== scanId));
    } catch (error) {
      console.error("Failed to delete scan:", error);
    }
  };

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
        "http://localhost:3000/api/v1/user/scanTicket/deleteScanBatch",
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
      const payload = scannedTickets.map((t) => ({
        ticketNumber: t.ticketNumber,
        ticketLotNumber: t.ticketLotNumber,
        sessionType,
        userId
      }))

      await axios.post("http://localhost:3000/api/v1/user/scanTicket/addScanBatch",
        {tickets: payload},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )

      setMessage("Ticket insert success..")
    }catch (error) {
      console.error("Failed to save batch:", error);
      setMessage("Failed to save scanned tickets. Try again.");
    }
  };

  const handleScanFromCamera = async (scannedData: string) => {
    console.log("Scanned from camera:", scannedData);

    if (alreadyScannedToday) {
      setMessage(
        "Ticket Already scanned for today, To scan again you need to delete or You can scan tommorrow"
      );
      return;
    }

    if(scannedTickets.some((t) => t.ticketNumber == scannedData)){
      console.log("Duplicate ticket skipped.");
      return
    }

    try {
      const lotHint = extractLotHint(scannedData);
      const response = await axios.get(
        "http://localhost:3000/api/v1/user/newTicket/getTicketByLotHint",
        {
          params: {
            lotHint,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("ticket response fron lotHint:  ", response.data.ticket);
      const ticket: Ticket = response.data;

      const newTicket: ScanTicket = {
        id: crypto.randomUUID(),
        ticketNumber: scannedData,
        ticketLotNumber: ticket.lotNumber,
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
  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Scan Tickets</h2>

      {alreadyScannedToday ? (
        <div className="bg-yellow-100 p-4 rounded shadow-md">
          <p className="text-yellow-800 font-medium">
            You've already scanned for today's {sessionType} session.
          </p>
          <button
            className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            onClick={handleDeleteBatch}
          >
            Delete Previous Scans
          </button>
        </div>
      ) : (
        <>
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Session</label>
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="border rounded p-2 w-full max-w-xs"
          >
            <option value="Opening">Opening</option>
            <option value="Closing">Closing</option>
          </select>
        </div>

        <div className="mb-4">
          {!scanning ? (
            <button
              onClick={() => setScanning(true)}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              Start Camera
            </button>
          ) : (
            <button
              onClick={() => setScanning(false)}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Stop Camera
            </button>
          )}
        </div>

        {scanning && (
          <BarcodeScannerBox
            onScan={handleScanFromCamera}
            onClose={() => setScanning(false)}
          />
        )}

        <div className="grid gap-4 mt-6">
          {scannedTickets.map((scan) => (
            <div
              key={scan.id}
              className="border rounded-xl p-4 shadow flex justify-between items-center"
            >
              <div>
                <p><strong>Ticket:</strong> {scan.ticket?.name}</p>
                <p><strong>Price:</strong> ${scan.ticket?.price}</p>
                <p><strong>Lot:</strong> {scan.ticketLotNumber}</p>
                <p><strong>Scanned At:</strong> {new Date(scan.scannedAt).toLocaleString()}</p>
                <p><strong>Ticket Number:</strong> {scan.ticketNumber}</p>
                <p><strong>Session:</strong> {scan.sessionType}</p>
              </div>
              <button
                onClick={() => handleDelete(scan.id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {scannedTickets.length > 0 && (
          <div className="mt-6 text-right">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-6 py-2 rounded"
            >
              Save
            </button>
          </div>
        )}

        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.includes("successfully") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </>

  )};
  </div>

)};
