import BarcodeScanner from "react-qr-barcode-scanner";

interface BarcodeScannerBoxProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

const BarcodeScannerBox: React.FC<BarcodeScannerBoxProps> = ({ onScan, onClose }) => {
  const handleUpdate = (err: any, result: any) => {
    if (result) {
      onScan(result.getText());
      onClose(); // stop scanning after successful scan
    }
    if (err) {
      console.error("Scanner error:", err);
    }
  };

  return (
    <div className="mb-4">
      <BarcodeScanner
        width={400}
        height={300}
        onUpdate={handleUpdate}
      />
    </div>
  );
};

export default BarcodeScannerBox;
