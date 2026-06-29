import axios from 'axios';

// Menggunakan environment variable jika ada (saat di Vercel), jika tidak gunakan localhost (saat di laptop)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const sawApi = {
  async healthCheck() {
    const res = await axios.get(`${API_BASE}/api/health`);
    return res.data;
  },
  async getKriteria() {
    const res = await axios.get(`${API_BASE}/api/kriteria`);
    return res.data;
  },
  async getDefaultData() {
    const res = await axios.get(`${API_BASE}/api/default-data`);
    return res.data;
  },
  async hitungSAW(kriteria, alternatif) {
    const res = await axios.post(`${API_BASE}/api/hitung-saw`, {
      kriteria,
      alternatif,
    });
    return res.data.data;
  },
};
