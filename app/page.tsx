"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  const [tanggal, setTanggal] = useState('');
  const [status, setStatus] = useState('Hadir');
  const [jamDatang, setJamDatang] = useState('');
  const [jamPulang, setJamPulang] = useState('');
  const [kegiatan, setKegiatan] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // Cek apakah pengguna sudah login saat halaman dibuka
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login'); // Lempar ke halaman login jika belum masuk
      } else {
        setUserId(session.user.id);
      }
    };
    checkUser();

    // Isi tanggal otomatis
    const today = new Date().toISOString().split('T')[0];
    setTanggal(today);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return; // Pastikan user ID sudah ada
    setLoading(true);

    try {
      let fotoUrl = null;

      if (file && status === 'Hadir') {
        const fileExt = file.name.split('.').pop();
        // Beri nama foto dengan ID user agar tidak bentrok
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('dokumentasi_magang')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('dokumentasi_magang')
          .getPublicUrl(fileName);
        
        fotoUrl = publicUrl;
      }

      // Simpan data ke database beserta user_id-nya
      const { error: dbError } = await supabase
        .from('daily_logs')
        .insert([
          {
            user_id: userId,
            tanggal,
            status_kehadiran: status,
            jam_datang: status === 'Hadir' ? jamDatang : null,
            jam_pulang: status === 'Hadir' ? jamPulang : null,
            kegiatan: status === 'Hadir' ? kegiatan : status,
            foto_url: fotoUrl
          }
        ]);

      if (dbError) throw dbError;

      alert('Log harian berhasil disimpan!');
      setJamDatang('');
      setJamPulang('');
      setKegiatan('');
      setFile(null);

    } catch (error: any) {
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Jangan tampilkan form jika masih loading pengecekan akun
  if (!userId) return <div className="p-8 text-center">Memeriksa akses...</div>;

  return (
    <main className="p-6 flex justify-center w-full">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md h-fit">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Log Magang Harian</h1>
        {/* Sisa formnya sama persis seperti sebelumnya */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required className="w-full border border-gray-300 p-2 rounded-lg text-black" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status Kehadiran</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-300 p-2 rounded-lg text-black">
              <option value="Hadir">Hadir di Kantor</option>
              <option value="Work From Home(WFH)">Work From Home (WFH)</option>
              <option value="Sakit">Sakit</option>
              <option value="Izin">Izin</option>
            </select>
          </div>

          {status === 'Hadir' && (
            <>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Datang</label>
                  <input type="time" value={jamDatang} onChange={(e) => setJamDatang(e.target.value)} required className="w-full border border-gray-300 p-2 rounded-lg text-black" />
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jam Pulang</label>
                  <input type="time" value={jamPulang} onChange={(e) => setJamPulang(e.target.value)} required className="w-full border border-gray-300 p-2 rounded-lg text-black" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kegiatan / Keterangan</label>
                <textarea rows={4} value={kegiatan} onChange={(e) => setKegiatan(e.target.value)} required className="w-full border border-gray-300 p-2 rounded-lg text-black"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Upload Dokumentasi</label>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required className="w-full border border-gray-300 p-2 rounded-lg text-black text-sm" />
              </div>
            </>
          )}

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg mt-4 hover:bg-blue-700 transition disabled:bg-blue-300">
            {loading ? 'Menyimpan...' : 'Simpan Log Hari Ini'}
          </button>
        </form>
      </div>
    </main>
  );
}