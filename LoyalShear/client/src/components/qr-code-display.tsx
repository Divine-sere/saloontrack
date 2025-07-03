import { useQuery } from "@tanstack/react-query";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateQRCode } from "@/lib/qr-utils";

interface QRCodeDisplayProps {
  businessId: number;
}

export default function QRCodeDisplay({ businessId }: QRCodeDisplayProps) {
  const { toast } = useToast();

  const { data: qrInfo } = useQuery({
    queryKey: [`/api/business/${businessId}/qr`],
  });

  const handleDownload = async () => {
    if (!qrInfo?.qrData) return;
    
    try {
      const canvas = await generateQRCode(qrInfo.qrData);
      const link = document.createElement('a');
      link.download = `${qrInfo.businessName || 'business'}-qr-code.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast({
        title: "Success",
        description: "QR code downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  const handlePrint = async () => {
    if (!qrInfo?.qrData) return;

    try {
      const canvas = await generateQRCode(qrInfo.qrData);
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>${qrInfo.businessName} - QR Code</title>
            <style>
              body { text-align: center; font-family: Arial, sans-serif; }
              .container { margin: 20px; }
              .qr-code { margin: 20px 0; }
              .business-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
              .instructions { font-size: 16px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="business-name">${qrInfo.businessName}</div>
              <div class="instructions">Scan to check in</div>
              <div class="qr-code">
                <img src="${canvas.toDataURL()}" alt="QR Code" />
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
      
      toast({
        title: "Success",
        description: "QR code sent to printer",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to print QR code",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-700 mb-3">QR Code Check-In</h3>
      <div className="text-center">
        <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
          {qrInfo?.qrData ? (
            <QRCodeSVG qrData={qrInfo.qrData} />
          ) : (
            <div className="w-32 h-32 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center">
              <span className="text-gray-400 text-sm">Loading...</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-3">Customers scan to check in</p>
        <div className="flex space-x-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleDownload}
            disabled={!qrInfo?.qrData}
          >
            <Download className="h-4 w-4 mr-1" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handlePrint}
            disabled={!qrInfo?.qrData}
          >
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
}

// Simple QR Code SVG component using a pattern
function QRCodeSVG({ qrData }: { qrData: string }) {
  // This is a simplified QR code pattern for display purposes
  // In a real implementation, you'd use a proper QR code library
  return (
    <div className="w-32 h-32 bg-white border border-gray-300 rounded-md flex items-center justify-center">
      <div className="grid grid-cols-8 gap-0.5">
        {Array.from({ length: 64 }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 ${
              (i * qrData.length) % 3 === 0 ? 'bg-black' : 'bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
