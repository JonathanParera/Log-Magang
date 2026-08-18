"use client";

import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Hash, BookOpen, GraduationCap, Building2, UserCircle, ArrowRight, UserPlus, FileSignature } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  // State untuk Auth
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // State khusus untuk Register (Data Profil)
  const [nama, setNama] = useState('');
  const [nim, setNim] = useState('');
  const [unitKerja, setUnitKerja] = useState('PT. Pelindo Terminal Petikemas TPK Bitung');
  const [jurusan, setJurusan] = useState('');
  const [prodi, setProdi] = useState('');
  const [pembimbing, setPembimbing] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // PROSES LOGIN
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        router.push('/dashboard');
      } else {
        // PROSES REGISTER
        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;

        if (authData.user) {
          const { error: profileError } = await supabase.from('profiles').insert([
            {
              id: authData.user.id,
              nama, nim, unit_kerja: unitKerja, jurusan, program_studi: prodi, pembimbing_lapangan: pembimbing
            }
          ]);
          if (profileError) throw profileError;
        }

        alert('Pendaftaran Berhasil! Silakan Login dengan akun yang baru dibuat.');
        setIsLogin(true);
        setPassword(''); // Kosongkan password demi keamanan
      }
    } catch (error: any) {
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-6">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
        
        {/* Header Biru */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white">
          <div className="bg-white/20 p-3 rounded-2xl inline-block mb-3 backdrop-blur-sm">
            <FileSignature size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-wide">
            {isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Magang'}
          </h1>
          <p className="text-blue-100 mt-2 text-sm">
            {isLogin ? 'Masuk untuk mengelola log kegiatan harianmu' : 'Lengkapi data diri untuk laporan Word otomatis'}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleAuth} className="space-y-4">
            
            {/* Input Email & Password */}
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Alamat Email" className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700" />
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Password (Min. 6 Karakter)" className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700" />
              </div>
            </div>

            {/* Form Tambahan (Hanya muncul jika mode Register) */}
            {!isLogin && (
              <div className="space-y-4 pt-4 mt-4 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
                  <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required placeholder="Nama Lengkap" className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700" />
                </div>
                
                <div className="flex gap-4">
                  <div className="relative w-1/2">
                    <Hash className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
                    <input type="text" value={nim} onChange={(e) => setNim(e.target.value)} required placeholder="NIM" className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700" />
                  </div>
                  <div className="relative w-1/2">
                    <BookOpen className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
                    <input type="text" value={jurusan} onChange={(e) => setJurusan(e.target.value)} required placeholder="Jurusan" className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700" />
                  </div>
                </div>

                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
                  <input type="text" value={prodi} onChange={(e) => setProdi(e.target.value)} required placeholder="Program Studi (Cth: D-4 Teknik Informatika)" className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700" />
                </div>

                <div className="relative">
                  <UserCircle className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
                  <input type="text" value={pembimbing} onChange={(e) => setPembimbing(e.target.value)} required placeholder="Nama Pembimbing Lapangan" className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700" />
                </div>

                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3.5 text-slate-400" size={20} />
                  <input type="text" value={unitKerja} onChange={(e) => setUnitKerja(e.target.value)} required placeholder="Unit Kerja" className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700" />
                </div>
              </div>
            )}

            {/* Tombol Submit Utama */}
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 mt-6">
              {loading ? 'Memproses...' : (isLogin ? <><ArrowRight size={20}/> Masuk ke Dashboard</> : <><UserPlus size={20}/> Daftar & Simpan Data</>)}
            </button>
          </form>
        </div>

        {/* Footer Toggle Login/Register */}
        <div className="bg-slate-50 p-6 text-center border-t border-slate-100">
          <p className="text-sm text-slate-600">
            {isLogin ? "Belum punya akun magang? " : "Sudah pernah mendaftar? "}
            <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
              {isLogin ? 'Daftar di sini' : 'Login di sini'}
            </button>
          </p>
        </div>

      </div>
    </main>
  );
}