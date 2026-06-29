import { Trophy, Target, Crown } from 'lucide-react';

export default function HasilRanking({ hasil, bobot }) {
  if (!hasil || !hasil.ranking) return null;

  const top3 = hasil.ranking.slice(0, 3);

  return (
    <div className="space-y-6">
      <section className="glass rounded-xl p-6 bg-white border border-slate-200">
        <div className="mb-5 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Trophy className="text-amber-500" size={20} />
            Leaderboard Ranking
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Skor Final (Vi) = Σ (Bobot × Normalisasi)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-bold w-16 text-center">Rank</th>
                <th className="px-4 py-3 font-bold">Nama Pelanggan</th>
                <th className="px-4 py-3 font-bold text-right">Skor Final</th>
              </tr>
            </thead>
            <tbody>
              {hasil.ranking.map((row, i) => (
                <tr key={i} className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${i < 3 ? 'font-semibold' : ''}`}>
                  <td className="px-4 py-3 text-center">
                    <span className={i < 3 ? "text-red-600 font-black text-lg" : "text-slate-500 font-bold text-base"}>
                      #{i + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-800">
                    {row.nama}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-block bg-red-50 text-red-700 px-3 py-1 rounded font-mono font-bold border border-red-100">
                      {row.skor.toFixed(4)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Rekomendasi Panel */}
      <section className="bg-slate-800 rounded-xl p-6 text-white shadow-lg border border-slate-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Target size={120} className="text-red-500" />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Target className="text-red-500" size={20} />
            Rekomendasi Keputusan
          </h2>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed">
            Berdasarkan perhitungan SPK SAW, berikut adalah <strong className="text-white">Top 3 Pelanggan</strong> yang direkomendasikan untuk segera dilakukan konversi (Passive → Promoter):
          </p>
          
          <div className="space-y-3">
            {top3.map((alt, i) => (
              <div key={i} className="flex items-center gap-4 bg-slate-700/50 backdrop-blur-md p-3 rounded-lg border border-slate-600">
                <div className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-sm">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-bold text-white">{alt.nama}</h3>
                  <p className="text-xs text-slate-400">Skor Kelayakan: <span className="text-red-400 font-bold">{alt.skor.toFixed(4)}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
