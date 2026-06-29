import { Table2 } from 'lucide-react';

export default function HasilNormalisasi({ hasil, kriteria }) {
  if (!hasil || !hasil.normalisasi_semua) return null;

  return (
    <section className="glass rounded-xl p-6 fade-in border border-slate-200 mt-6 bg-white">
      <div className="mb-5 border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Table2 className="text-red-600" size={20} />
          Matriks Normalisasi (R)
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Hasil normalisasi berdasarkan rumus tipe Benefit (X/Max) atau Cost (Min/X). Skala 0.0 - 1.0
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-bold">No</th>
              <th className="px-4 py-3 font-bold">Nama Pelanggan</th>
              {kriteria.map((k, i) => (
                <th key={i} className="px-4 py-3 text-center">R{i+1} ({k.kode})</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hasil.normalisasi_semua.map((row, i) => {
              const itemInfo = hasil.ranking.find(r => r.index === i);
              return (
                <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-500">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{itemInfo?.nama || `Alt ${i+1}`}</td>
                  {row.map((val, j) => (
                    <td key={j} className="px-4 py-3 text-center text-slate-600 font-mono">
                      {val.toFixed(3)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
