import { useState, useEffect } from 'react';
import Header from './components/Header';
import BobotKriteria from './components/BobotKriteria';
import MatriksKeputusan from './components/MatriksKeputusan';
import HasilNormalisasi from './components/HasilNormalisasi';
import HasilRanking from './components/HasilRanking';
import ChartVisualisasi from './components/ChartVisualisasi';
import { sawApi } from './api/sawApi';
import { Calculator, Loader2 } from 'lucide-react';

const DEFAULT_KRITERIA = [
  { kode: 'C1', nama: 'Lama Berlangganan', satuan: 'Tahun', tipe: 'Benefit', bobot: 15 },
  { kode: 'C2', nama: 'Level RDI', satuan: 'Skala 1-4', tipe: 'Benefit', bobot: 20 },
  { kode: 'C3', nama: 'Revenue Kontribusi', satuan: 'Skala 1-5', tipe: 'Benefit', bobot: 35 },
  { kode: 'C4', nama: 'Skor NPS Witel', satuan: 'Skor 0-100', tipe: 'Benefit', bobot: 30 },
];

const DEFAULT_ALTERNATIF = [
  { nama: 'PT Mosad', witel: 'Balikpapan', nilai: [5, 3, 5, 75] },
  { nama: 'Stikes Eka Harap Pk', witel: 'Kalselteng', nilai: [3, 2, 3, 25] },
  { nama: 'Muhosindo PT', witel: 'Balikpapan', nilai: [7, 2, 5, 75] },
  { nama: 'Universitas Balikpapan', witel: 'Balikpapan', nilai: [8, 2, 5, 75] },
  { nama: 'PT Kayan Marine Shipyard', witel: 'Kaltimtara', nilai: [4, 2, 4, 37.5] },
  { nama: 'Perumdam Tirta Lamandau', witel: 'Kalselteng', nilai: [6, 3, 3, 25] },
  { nama: 'PT Petro Perkasa Ind', witel: 'Balikpapan', nilai: [5, 2, 5, 75] },
  { nama: 'PDAM Tirta Barito', witel: 'Kalselteng', nilai: [10, 3, 3, 25] },
];

function App() {
  const [kriteria, setKriteria] = useState(DEFAULT_KRITERIA);
  const [alternatif, setAlternatif] = useState(DEFAULT_ALTERNATIF);
  const [hasil, setHasil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverStatus, setServerStatus] = useState('connecting');

  useEffect(() => {
    const checkServer = async () => {
      try {
        await sawApi.healthCheck();
        setServerStatus('connected');
        // Ignore getDefaultData for criteria to allow local dynamic modifications easily
      } catch {
        setServerStatus('offline');
      }
    };
    checkServer();
  }, []);

  const handleHitung = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await sawApi.hitungSAW(kriteria, alternatif);
      setHasil(response);
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Gagal terhubung ke server Python!';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-12">
      <Header serverStatus={serverStatus} />
      <main className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
        <div className="grid lg:grid-cols-1 gap-6">
          <BobotKriteria kriteria={kriteria} setKriteria={setKriteria} alternatif={alternatif} setAlternatif={setAlternatif} />
          <MatriksKeputusan kriteria={kriteria} alternatif={alternatif} setAlternatif={setAlternatif} />
        </div>

        <div className="flex flex-col items-center gap-3 py-4">
          <button
            onClick={handleHitung}
            disabled={loading || serverStatus === 'offline'}
            className={`btn-primary text-white px-10 py-3 rounded-lg font-semibold text-base flex items-center gap-2 ${
              loading ? 'opacity-70 cursor-wait' : serverStatus === 'offline' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 shadow-md'
            } transition-all`}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Calculator size={20} />}
            {loading ? 'Menghitung...' : 'HITUNG RANKING (SAW)'}
          </button>
          
          {serverStatus === 'offline' && (
            <p className="text-red-500 text-sm font-medium">
              ⚠ API Server offline. Jalankan: <code className="bg-red-50 px-2 py-0.5 rounded font-mono text-red-600 border border-red-200">python backend/main.py</code>
            </p>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm max-w-lg text-center shadow-sm">
              {error}
            </div>
          )}
        </div>

        {hasil && (
          <div className="space-y-6 slide-up">
            <div className="flex items-center justify-center">
              <h2 className="text-xl font-bold text-slate-800 tracking-wide uppercase px-6 py-2 border-b-2 border-red-600">
                H A S I L &nbsp; A N A L I S I S
              </h2>
            </div>
            <div className="grid xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-5">
                <HasilRanking hasil={hasil} />
              </div>
              <div className="xl:col-span-7">
                <ChartVisualisasi hasil={hasil} kriteria={kriteria} />
              </div>
            </div>
            <HasilNormalisasi hasil={hasil} kriteria={kriteria} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
