import { Settings2, Plus, Trash2 } from 'lucide-react';

export default function BobotKriteria({ kriteria, setKriteria, alternatif, setAlternatif }) {
  const total = kriteria.reduce((a, b) => a + (parseFloat(b.bobot) || 0), 0);
  const isValid = Math.abs(total - 100) < 0.01;

  const handleChange = (index, field, value) => {
    const newK = [...kriteria];
    newK[index][field] = value === '' && field === 'bobot' ? '' : (field === 'bobot' ? parseFloat(value) : value);
    setKriteria(newK);
  };

  const handleAdd = () => {
    const newKode = 'C' + (kriteria.length + 1);
    setKriteria([...kriteria, { kode: newKode, nama: 'Kriteria Baru', satuan: '-', tipe: 'Benefit', bobot: 0 }]);
    
    // Sinkronisasi alternatif
    const newAlt = alternatif.map(a => ({
      ...a,
      nilai: [...a.nilai, 0]
    }));
    setAlternatif(newAlt);
  };

  const handleRemove = (index) => {
    if (kriteria.length <= 2) {
      alert("Minimal harus ada 2 kriteria!");
      return;
    }
    const newK = kriteria.filter((_, i) => i !== index);
    // Update kode (opsional, tapi disarankan)
    newK.forEach((k, i) => k.kode = 'C' + (i + 1));
    setKriteria(newK);

    // Sinkronisasi alternatif
    const newAlt = alternatif.map(a => ({
      ...a,
      nilai: a.nilai.filter((_, i) => i !== index)
    }));
    setAlternatif(newAlt);
  };

  return (
    <section className="glass rounded-xl p-6 fade-in h-full">
      <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Settings2 className="text-red-600" size={20} />
            Bobot Kriteria Dinamis
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Atur nama, jenis (Benefit/Cost), dan bobot kriteria (Total Wajib 100%)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAdd}
            className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
          >
            <Plus size={16} /> Tambah Kriteria
          </button>
          <div
            className={`text-sm font-bold px-4 py-2 rounded-lg transition-all ${
              isValid
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'bg-red-100 text-red-800 border border-red-200 shadow-sm'
            }`}
          >
            {isValid ? `✓ Total: ${total}%` : `⚠ Error Total: ${total}%`}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kriteria.map((k, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-red-300 hover:shadow-sm transition-all relative group"
          >
            <button 
              onClick={() => handleRemove(i)}
              className="absolute top-2 right-2 text-slate-400 hover:text-red-500 transition-colors"
              title="Hapus Kriteria"
            >
              <Trash2 size={16} />
            </button>
            <div className="flex items-center gap-2 mb-2 w-full pr-6">
              <span className="text-xs font-bold bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">{k.kode}</span>
              <input 
                type="text" 
                value={k.nama}
                onChange={(e) => handleChange(i, 'nama', e.target.value)}
                className="input-dark w-full bg-transparent border-b border-dashed border-slate-300 text-xs font-bold uppercase tracking-wide focus:border-red-400 focus:outline-none"
                placeholder="Nama Kriteria"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="100"
                value={k.bobot}
                onChange={(e) => handleChange(i, 'bobot', e.target.value)}
                className="input-dark w-full px-3 py-2.5 rounded-lg text-center font-bold text-lg text-red-700 bg-white"
                placeholder="Bobot"
              />
              <span className="text-slate-400 font-bold text-lg">%</span>
            </div>
            <div className="flex items-center justify-between mt-3 px-1 gap-2">
              <select 
                value={k.tipe}
                onChange={(e) => handleChange(i, 'tipe', e.target.value)}
                className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200 outline-none focus:border-red-300 cursor-pointer w-full"
              >
                <option value="Benefit">Benefit</option>
                <option value="Cost">Cost</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
