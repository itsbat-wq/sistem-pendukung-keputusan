import { Users, Plus, Trash2, Upload, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useRef } from 'react';

export default function MatriksKeputusan({ kriteria, alternatif, setAlternatif }) {
  const fileInputRef = useRef(null);

  const handleChangeNilai = (idxAlt, idxKrit, value) => {
    const newAlt = [...alternatif];
    const newNilai = [...newAlt[idxAlt].nilai];
    newNilai[idxKrit] = value === '' ? '' : parseFloat(value);
    newAlt[idxAlt] = { ...newAlt[idxAlt], nilai: newNilai };
    setAlternatif(newAlt);
  };

  const handleChangeText = (idxAlt, field, value) => {
    const newAlt = [...alternatif];
    newAlt[idxAlt] = { ...newAlt[idxAlt], [field]: value };
    setAlternatif(newAlt);
  };

  const handleRemove = (idxAlt) => {
    if (alternatif.length <= 2) {
      alert("Minimal harus ada 2 pelanggan untuk dihitung!");
      return;
    }
    const newAlt = alternatif.filter((_, i) => i !== idxAlt);
    setAlternatif(newAlt);
  };

  const handleAdd = () => {
    setAlternatif([
      ...alternatif,
      { nama: '', witel: '', nilai: Array(kriteria.length).fill(0) }
    ]);
    
    setTimeout(() => {
      const inputs = document.querySelectorAll('.input-nama');
      if (inputs.length > 0) {
        const lastInput = inputs[inputs.length - 1];
        lastInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        lastInput.focus();
      }
    }, 50);
  };

  const handleDownloadTemplate = () => {
    const headers = ['Nama Pelanggan', 'Witel', ...kriteria.map(k => k.kode)];
    const sampleData = ['PT Contoh', 'Balikpapan', ...kriteria.map(() => 5)];
    
    const ws = XLSX.utils.aoa_to_sheet([headers, sampleData]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data_Pelanggan");
    XLSX.writeFile(wb, "Template_Import_SPK.xlsx");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        // Baca data sebagai matriks array 2D
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        if (data.length < 1) {
           alert("Data Excel kosong!");
           return;
        }

        // VALIDASI STRICT FORMAT EXCEL
        const expectedHeaders = ['Nama Pelanggan', 'Witel', ...kriteria.map(k => k.kode)];
        const headerRow = data[0];

        if (headerRow.length < expectedHeaders.length) {
          alert(`Format Excel salah! Diharapkan memiliki ${expectedHeaders.length} kolom: ${expectedHeaders.join(', ')}`);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        let isValid = true;
        for (let i = 0; i < expectedHeaders.length; i++) {
          const expected = expectedHeaders[i].toString().toLowerCase().trim();
          const actual = headerRow[i] ? headerRow[i].toString().toLowerCase().trim() : "";
          if (expected !== actual) {
            isValid = false;
            break;
          }
        }

        if (!isValid) {
          alert(`Format Header baris pertama salah!\n\nHeader yang benar:\n${expectedHeaders.join(', ')}\n\nSilakan Download Template terlebih dahulu.`);
          if (fileInputRef.current) fileInputRef.current.value = "";
          return;
        }

        // BACA DATA (Baris ke-2 dst)
        const newAlt = [];
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          // Cek jika baris kosong (tidak ada nama)
          if (!row || row.length === 0 || !row[0]) continue;
          
          let nama = row[0];
          let witel = row[1] || '-';
          
          const nilai = [];
          for (let j = 0; j < kriteria.length; j++) {
            const val = parseFloat(row[2 + j]) || 0;
            nilai.push(val);
          }
          newAlt.push({ nama, witel, nilai });
        }
        
        if (newAlt.length > 0) {
          setAlternatif(newAlt);
          alert(`Sukses mengimport ${newAlt.length} baris data pelanggan dari template!`);
        } else {
          alert("Tidak ada baris data yang ditemukan di bawah header.");
        }
      } catch (err) {
        console.error(err);
        alert("Gagal membaca file Excel. Pastikan format valid.");
      }
      
      // Reset input file agar bisa import file yg sama 2x
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  return (
    <section className="glass rounded-xl p-6 fade-in h-full flex flex-col">
      <div className="mb-5 border-b border-slate-100 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-red-600" size={20} />
            Matriks Keputusan (X)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gunakan file template khusus untuk import data dari Excel
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleDownloadTemplate}
            className="flex items-center gap-1 bg-white hover:bg-slate-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-200 transition-colors shadow-sm"
          >
            <Download size={16} /> Unduh Template
          </button>

          <input 
            type="file" 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 transition-colors shadow-sm"
          >
            <Upload size={16} /> Import Data
          </button>

          <button 
            onClick={handleAdd}
            className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 transition-colors"
          >
            <Plus size={16} /> Tambah Pelanggan
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-grow">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-3 py-3 font-bold w-12 text-center">No</th>
              <th className="px-2 py-3 font-bold w-48">Nama Pelanggan</th>
              <th className="px-2 py-3 font-bold w-32">Witel</th>
              {kriteria.map((k, idx) => (
                 <th key={idx} className="px-2 py-3 text-center">
                   {k.kode} <span className="block text-[10px] text-slate-400 normal-case mt-0.5">{k.nama.length > 10 ? k.nama.substring(0,10)+'...' : k.nama}</span>
                 </th>
              ))}
              <th className="px-2 py-3 text-center w-12">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {alternatif.map((alt, i) => (
              <tr key={i} className="border-b border-slate-100 hover:bg-red-50/30 transition-colors">
                <td className="px-3 py-2 font-semibold text-slate-400 text-center">{i + 1}</td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={alt.nama}
                    onChange={(e) => handleChangeText(i, 'nama', e.target.value)}
                    className="input-nama input-dark w-full px-2 py-1.5 rounded text-sm font-medium"
                    placeholder="Nama"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    value={alt.witel}
                    onChange={(e) => handleChangeText(i, 'witel', e.target.value)}
                    className="input-dark w-full px-2 py-1.5 rounded text-xs text-slate-600"
                    placeholder="Witel"
                  />
                </td>
                {alt.nilai.map((val, j) => (
                  <td key={j} className="px-2 py-2">
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => handleChangeNilai(i, j, e.target.value)}
                      className="input-dark w-full px-2 py-1.5 rounded text-center text-sm font-semibold"
                    />
                  </td>
                ))}
                <td className="px-2 py-2 text-center">
                  <button 
                    onClick={() => handleRemove(i)}
                    className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
