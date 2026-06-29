"""
SPK SAW - Backend API Server
Sistem Pendukung Keputusan menggunakan metode Simple Additive Weighting (SAW)
Ariel Itsbat — 10231018 — Sistem Informasi ITK

Endpoint:
  POST /api/hitung-saw  → Menerima data alternatif + bobot, mengembalikan hasil normalisasi & ranking
  GET  /api/health      → Health check
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional

# ============================================================
# INISIALISASI FASTAPI
# ============================================================
app = FastAPI(
    title="SPK SAW API",
    description="API untuk perhitungan Sistem Pendukung Keputusan menggunakan metode SAW (Simple Additive Weighting)",
    version="1.0.0",
)

# Mengizinkan React Frontend mengakses API (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Izinkan semua origin (untuk development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# MODEL DATA (Pydantic) — Validasi otomatis input dari React
# ============================================================
class Alternatif(BaseModel):
    nama: str = Field(..., min_length=1, description="Nama pelanggan")
    witel: str = Field(default="-", description="Nama Witel")
    nilai: list[float] = Field(..., description="Nilai [C1, C2, C3, ...]")

class KriteriaInput(BaseModel):
    kode: str
    nama: str
    tipe: str
    bobot: float

class SAWRequest(BaseModel):
    kriteria: list[KriteriaInput] = Field(..., description="Daftar kriteria dinamis")
    alternatif: list[Alternatif] = Field(..., min_length=2, description="Minimal 2 alternatif")

class KriteriaInfo(BaseModel):
    kode: str
    nama: str
    satuan: str
    tipe: str
    min_val: float
    max_val: float

# ============================================================
# DATA KRITERIA (Definisi tetap)
# ============================================================
KRITERIA = [
    KriteriaInfo(kode="C1", nama="Lama Berlangganan", satuan="Tahun", tipe="Benefit", min_val=0, max_val=100),
    KriteriaInfo(kode="C2", nama="Level RDI", satuan="Skala 1-4", tipe="Benefit", min_val=1, max_val=4),
    KriteriaInfo(kode="C3", nama="Revenue Kontribusi", satuan="Skala 1-5", tipe="Benefit", min_val=1, max_val=5),
    KriteriaInfo(kode="C4", nama="Skor NPS Witel", satuan="Skor 0-100", tipe="Benefit", min_val=0, max_val=100),
]

# Data default 8 pelanggan (dari Excel)
DEFAULT_ALTERNATIF = [
    Alternatif(nama="PT Mosad", witel="Balikpapan", nilai=[5, 3, 5, 75]),
    Alternatif(nama="Stikes Eka Harap Pk", witel="Kalselteng", nilai=[3, 2, 3, 25]),
    Alternatif(nama="Muhosindo PT", witel="Balikpapan", nilai=[7, 2, 5, 75]),
    Alternatif(nama="Universitas Balikpapan", witel="Balikpapan", nilai=[8, 2, 5, 75]),
    Alternatif(nama="PT Kayan Marine Shipyard", witel="Kaltimtara", nilai=[4, 2, 4, 37.5]),
    Alternatif(nama="Perumdam Tirta Lamandau", witel="Kalselteng", nilai=[6, 3, 3, 25]),
    Alternatif(nama="PT Petro Perkasa Ind", witel="Balikpapan", nilai=[5, 2, 5, 75]),
    Alternatif(nama="PDAM Tirta Barito", witel="Kalselteng", nilai=[10, 3, 3, 25]),
]

DEFAULT_BOBOT = [15, 20, 35, 30]

# ============================================================
# LOGIKA PERHITUNGAN SAW (INTI ALGORITMA)
# ============================================================
def hitung_saw(alternatif: list[Alternatif], kriteria: list[KriteriaInput]) -> dict:
    """
    Menghitung SAW secara dinamis (mendukung Benefit & Cost).
    """
    n = len(alternatif)
    m = len(kriteria)

    # ── TAHAP 1: Cari nilai MAX dan MIN per kriteria ──
    max_val = []
    min_val = []
    for j in range(m):
        mx = max(alt.nilai[j] for alt in alternatif)
        mn = min(alt.nilai[j] for alt in alternatif)
        max_val.append(mx if mx != 0 else 1)
        min_val.append(mn)

    # ── TAHAP 2: Normalisasi ──
    normalisasi = []
    for i in range(n):
        row = []
        for j in range(m):
            if kriteria[j].tipe.lower() == "benefit":
                r = alternatif[i].nilai[j] / max_val[j]
            else: # Cost
                r = min_val[j] / alternatif[i].nilai[j] if alternatif[i].nilai[j] != 0 else 0
            row.append(round(r, 4))
        normalisasi.append(row)

    # ── TAHAP 3: Skor Final = SUMPRODUCT(Normalisasi × Bobot) ──
    bobot_desimal = [k.bobot / 100 for k in kriteria]
    skor_final = []
    for i in range(n):
        skor = sum(normalisasi[i][j] * bobot_desimal[j] for j in range(m))
        skor_final.append({
            "index": i,
            "nama": alternatif[i].nama,
            "witel": alternatif[i].witel,
            "nilai_asli": alternatif[i].nilai,
            "normalisasi": normalisasi[i],
            "skor": round(skor, 4),
            "detail_perhitungan": " + ".join(
                f"({normalisasi[i][j]:.4f} × {bobot_desimal[j]})"
                for j in range(m)
            ),
        })

    # ── TAHAP 4: Ranking (Sort Descending) ──
    skor_final.sort(key=lambda x: x["skor"], reverse=True)
    for rank, item in enumerate(skor_final):
        item["ranking"] = rank + 1

    return {
        "max_val": max_val,
        "min_val": min_val,
        "bobot_desimal": bobot_desimal,
        "normalisasi_semua": normalisasi,
        "ranking": skor_final,
        "total_alternatif": n,
        "total_kriteria": m,
    }

# ============================================================
# ENDPOINTS API
# ============================================================
@app.get("/api/health")
def health_check():
    """Health check — untuk mengecek apakah server hidup."""
    return {"status": "ok", "message": "SPK SAW API berjalan dengan baik!"}

@app.get("/api/kriteria")
def get_kriteria():
    """Mengambil informasi kriteria (kode, nama, satuan, tipe, batas min/max)."""
    return {"kriteria": [k.model_dump() for k in KRITERIA]}

@app.get("/api/default-data")
def get_default_data():
    """Mengambil data default 8 pelanggan dan bobot awal."""
    return {
        "alternatif": [a.model_dump() for a in DEFAULT_ALTERNATIF],
        "bobot": DEFAULT_BOBOT,
    }

@app.post("/api/hitung-saw")
def endpoint_hitung_saw(data: SAWRequest):
    """
    🧮 Endpoint utama: Menghitung SAW secara dinamis.
    """
    num_kriteria = len(data.kriteria)
    for alt in data.alternatif:
        if len(alt.nilai) != num_kriteria:
            raise HTTPException(
                status_code=400,
                detail=f"Jumlah nilai untuk '{alt.nama}' tidak sesuai dengan jumlah kriteria."
            )

    total_bobot = sum(k.bobot for k in data.kriteria)
    if abs(total_bobot - 100) > 0.01:
        raise HTTPException(
            status_code=400,
            detail=f"Total bobot harus 100%! Saat ini: {total_bobot}%",
        )

    hasil = hitung_saw(data.alternatif, data.kriteria)

    return {
        "status": "success",
        "message": "Perhitungan SAW berhasil!",
        "data": hasil,
    }
# ============================================================
# ENTRY POINT
# ============================================================
if __name__ == "__main__":
    import uvicorn
    print("[*] Menjalankan SPK SAW API Server...")
    print("[i] Dokumentasi API: http://localhost:8000/docs")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
