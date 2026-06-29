export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Logo & Title */}
        <div className="flex items-center gap-4">
          <img src="/telkom-logo.png" alt="Telkom Indonesia" className="h-10 md:h-12 object-contain" />
          <div className="border-l-2 border-slate-200 pl-4">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 leading-tight">
              Sistem Pemilihan Pelanggan Prioritas
            </h1>
            <p className="text-slate-500 text-sm font-medium">
              Konversi <span className="text-red-600 font-semibold">Passive → Promoter</span>
            </p>
          </div>
        </div>

        {/* Right Side: Info */}
        <div className="flex flex-col items-start md:items-end gap-1 hidden md:flex">
          <p className="text-slate-500 text-sm font-semibold mt-1">
            Telkom RSMES Regional 4 Kalimantan
          </p>
        </div>

      </div>
    </header>
  );
}
