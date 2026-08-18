"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { User, Save, ShieldCheck } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // State Data Profil
  const [email, setEmail] = useState('');
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [unitKerja, setUnitKerja] = useState('');
  const [jurusan, setJurusan] = useState('');
  const [prodi, setProdi] = useState('');
  const [pembimbing, setPembimbing] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserId(session.user.id);
      setEmail(session.user.email || '');

      // Ambil data dari tabel profiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setNama(data.nama || '');
        setNim(data.nim || '');
        setUnitKerja(data.unit_kerja || '');
        setJurusan(data.jurusan || '');
        setProdi(data.program_studi || '');
        setPembimbing(data.pembimbing_lapangan || '');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        nama,
        nim,
        unit_kerja: unitKerja,
        jurusan,
        program_studi: prodi,
        pembimbing_lapangan: pembimbing,
      })
      .eq('id', userId);

    if (error) {
      alert('Gagal memperbarui profil: ' + error.message);
    } else {
      alert('Profil berhasil diperbarui! Data ini akan otomatis masuk ke laporan Word.');
    }
    setSaving(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">Memuat data profil...</div>;

  return (
    <main className="min-h-screen p-6 md:p-8 bg-slate-50 flex justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl">
              <User size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-800">Pengaturan Akun</h1>
              <p className="text-slate-500 text-sm">Informasi data diri yang akan tercetak otomatis pada laporan Word.</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Terdaftar</label>
              <input type="email" value={email} disabled className="w-full bg-slate-100 border-2 border-slate-200 p-3 rounded-xl text-slate-500 cursor-not-allowed text-sm" />
              <p className="text-xs text-slate-400 mt-1">Email tidak dapat diubah.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Lengkap & Gelar</label>
              <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required className="w-full border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-3 rounded-xl text-black transition-all outline-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">NIM</label>
                <input type="text" value={nim} onChange={(e) => setNim(e.target.value)} required className="w-full border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-3 rounded-xl text-black transition-all outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jurusan</label>
                <input type="text" value={jurusan} onChange={(e) => setJurusan(e.target.value)} required className="w-full border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-3 rounded-xl text-black transition-all outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Program Studi</label>
              <input type="text" value={prodi} onChange={(e) => setProdi(e.target.value)} required className="w-full border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-3 rounded-xl text-black transition-all outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unit Kerja / Penempatan</label>
              <input type="text" value={unitKerja} onChange={(e) => setUnitKerja(e.target.value)} required className="w-full border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-3 rounded-xl text-black transition-all outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Pembimbing Lapangan</label>
              <input type="text" value={pembimbing} onChange={(e) => setPembimbing(e.target.value)} required className="w-full border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-3 rounded-xl text-black transition-all outline-none" />
            </div>

            <button type="submit" disabled={saving} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 mt-6">
              <Save size={18} /> {saving ? 'Menyimpan Perubahan...' : 'Simpan Perubahan Profil'}
            </button>
          </form>

        </div>
      </div>
    </main>
  );
}