import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';
import BarcodeScanner from '../components/BarcodeScanner';
import AddProductForm from '../components/AddProductForm';

interface OpenFoodFactsProduct {
  name: string;
  category: string;
  image_url: string | null;
}

async function lookupBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await res.json();
    if (data.status !== 1) return null;
    const p = data.product;
    return {
      name: p.product_name || p.product_name_pl || 'Nieznany produkt',
      category: mapOffCategory(p.categories_tags?.[0] || ''),
      image_url: p.image_front_small_url || null,
    };
  } catch {
    return null;
  }
}

function mapOffCategory(offCategory: string): string {
  const lower = offCategory.toLowerCase();
  if (lower.includes('dairy') || lower.includes('milk') || lower.includes('mlecz')) return 'nabiał';
  if (lower.includes('meat') || lower.includes('mięs') || lower.includes('wędlin')) return 'wędlina';
  if (lower.includes('cheese') || lower.includes('ser')) return 'ser twardy';
  if (lower.includes('juice') || lower.includes('sok')) return 'sok';
  if (lower.includes('bread') || lower.includes('piecz') || lower.includes('chleb')) return 'pieczywo';
  if (lower.includes('fruit') || lower.includes('owoc')) return 'owoce';
  if (lower.includes('vegetable') || lower.includes('warzyw')) return 'warzywa';
  return 'inne';
}

export default function AddProductPage() {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  const { profile } = useAuth();
  const [mode, setMode] = useState<'choose' | 'scan' | 'manual'>('choose');
  const [scannedData, setScannedData] = useState<{
    barcode: string;
    name?: string;
    category?: string;
    image_url?: string | null;
  } | null>(null);
  const [scanLoading, setScanLoading] = useState(false);

  async function handleScan(barcode: string) {
    setScanLoading(true);
    const offData = await lookupBarcode(barcode);
    setScannedData({
      barcode,
      name: offData?.name,
      category: offData?.category,
      image_url: offData?.image_url,
    });
    setScanLoading(false);
    setMode('manual');
  }

  if (mode === 'choose') {
    return (
      <div className="page">
        <h2>Dodaj produkt</h2>
        <div className="choose-mode">
          <button className="choose-btn" onClick={() => setMode('scan')}>
            <span className="choose-icon">📷</span>
            <span>Skanuj kod</span>
          </button>
          <button className="choose-btn" onClick={() => setMode('manual')}>
            <span className="choose-icon">✏️</span>
            <span>Dodaj ręcznie</span>
          </button>
        </div>
      </div>
    );
  }

  if (mode === 'scan') {
    if (scanLoading) {
      return <div className="page"><p>Szukam produktu...</p></div>;
    }
    return <BarcodeScanner onScan={handleScan} onClose={() => setMode('choose')} />;
  }

  return (
    <div className="page">
      <h2>{scannedData ? 'Potwierdź produkt' : 'Dodaj ręcznie'}</h2>
      <AddProductForm
        initial={scannedData ? {
          name: scannedData.name,
          barcode: scannedData.barcode,
          category: scannedData.category,
          image_url: scannedData.image_url,
        } : undefined}
        onSubmit={async (data) => {
          await addProduct({
            ...data,
            opened_at: null,
            added_by: profile?.id || null,
            status: 'active',
          });
          navigate('/');
        }}
        onCancel={() => {
          setScannedData(null);
          setMode('choose');
        }}
      />
    </div>
  );
}
