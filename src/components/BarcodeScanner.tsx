import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

interface Props {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: Props) {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode('scanner-region');
    scannerRef.current = scanner;

    scanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 150 } },
      (decodedText) => {
        scanner.stop().then(() => onScan(decodedText));
      },
      () => {}
    ).catch((err) => {
      console.error('Scanner error:', err);
    });

    return () => {
      scanner.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="scanner-overlay">
      <div className="scanner-header">
        <span>Skanuj kod kreskowy</span>
        <button onClick={onClose} className="scanner-close">✕</button>
      </div>
      <div id="scanner-region" className="scanner-region" />
      <p className="scanner-hint">Skieruj kamerę na kod kreskowy</p>
    </div>
  );
}
