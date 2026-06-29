import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { BarChart3, Radar as RadarIcon } from 'lucide-react';

export default function ChartVisualisasi({ hasil, kriteria }) {
  if (!hasil || !hasil.ranking || !kriteria) return null;

  // 1. Data Bar Chart
  const barData = hasil.ranking.map(item => ({
    nama: item.nama.substring(0, 15) + (item.nama.length > 15 ? '...' : ''),
    skor: parseFloat(item.skor.toFixed(4)),
    rank: item.rank
  }));

  // 2. Data Radar Chart (Top 4 Alternatif)
  const top4 = hasil.ranking.slice(0, 4);
  const radarData = kriteria.map(k => ({
    kriteria: k.kode + ' (' + (k.nama.length > 8 ? k.nama.substring(0, 8) + '...' : k.nama) + ')',
    fullMark: 1
  }));

  // Isi data radar
  top4.forEach((alt, idx) => {
    if (alt.normalisasi) {
      kriteria.forEach((k, j) => {
        radarData[j][`Top ${idx+1}`] = alt.normalisasi[j] || 0;
      });
    }
  });

  const CHART_COLORS = ['#dc2626', '#475569', '#ef4444', '#94a3b8'];

  return (
    <div className="space-y-6">
      <section className="glass rounded-xl p-6 bg-white border border-slate-200">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-red-600" size={20} />
            Visualisasi Skor Final
          </h2>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" domain={[0, 1]} stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis 
                dataKey="nama" 
                type="category" 
                stroke="#64748b" 
                tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                width={120}
              />
              <RechartsTooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              />
              <Bar dataKey="skor" radius={[0, 4, 4, 0]} barSize={20}>
                {barData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index === 0 ? '#dc2626' : index === 1 ? '#475569' : index === 2 ? '#ef4444' : '#cbd5e1'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="glass rounded-xl p-6 bg-white border border-slate-200">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <RadarIcon className="text-red-600" size={20} />
            Kekuatan Kriteria (Top 4)
          </h2>
          <p className="text-xs text-slate-500 mt-1">Perbandingan nilai normalisasi antar kriteria</p>
        </div>
        
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis dataKey="kriteria" tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} />
              <PolarRadiusAxis angle={30} domain={[0, 1]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <RechartsTooltip />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              
              {top4.map((alt, idx) => (
                <Radar
                  key={idx}
                  name={`Top ${idx+1}: ${alt.nama.length > 15 ? alt.nama.substring(0, 15) + '...' : alt.nama}`}
                  dataKey={`Top ${idx+1}`}
                  stroke={CHART_COLORS[idx]}
                  fill={CHART_COLORS[idx]}
                  fillOpacity={idx === 0 ? 0.3 : 0.1}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
