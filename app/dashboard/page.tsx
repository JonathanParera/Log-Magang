"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { PlusCircle, FileDown, Pencil, Trash2, Image as ImageIcon, Calendar, Clock, Activity, X } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // State untuk Pop-up Modal (Bisa Add atau Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [loadingForm, setLoadingForm] = useState(false);

  // State Form Input
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tanggal, setTanggal] = useState('');
  const [status, setStatus] = useState('Hadir');
  const [jamDatang, setJamDatang] = useState('');
  const [jamPulang, setJamPulang] = useState('');
  const [kegiatan, setKegiatan] = useState('');
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const checkUserAndFetchLogs = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      setUserId(session.user.id);
      fetchLogs(session.user.id);
    };
    checkUserAndFetchLogs();
  }, [router]);

  const fetchLogs = async (uid: string) => {
    const { data, error } = await supabase.from('daily_logs').select('*').eq('user_id', uid).order('tanggal', { ascending: true });
    if (!error) setLogs(data || []);
    setLoading(false);
  };

  // --- Fungsi Buka Modal Tambah Baru ---
  const openAddModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setTanggal(today); setStatus('Hadir'); setJamDatang(''); setJamPulang(''); setKegiatan(''); setFile(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  // --- Fungsi Buka Modal Edit ---
  const openEditModal = (log: any) => {
    setEditingId(log.id); setTanggal(log.tanggal); setStatus(log.status_kehadiran); 
    setJamDatang(log.jam_datang || ''); setJamPulang(log.jam_pulang || ''); setKegiatan(log.kegiatan || '');
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // --- Fungsi Submit (Save Add / Update Edit) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoadingForm(true);

    try {
      if (modalMode === 'add') {
        let fotoUrl = null;
        if (file && status === 'Hadir') {
          const fileName = `${userId}_${Date.now()}.${file.name.split('.').pop()}`;
          await supabase.storage.from('dokumentasi_magang').upload(fileName, file);
          const { data } = supabase.storage.from('dokumentasi_magang').getPublicUrl(fileName);
          fotoUrl = data.publicUrl;
        }
        await supabase.from('daily_logs').insert([{
          user_id: userId, tanggal, status_kehadiran: status, 
          jam_datang: status === 'Hadir' ? jamDatang : null, jam_pulang: status === 'Hadir' ? jamPulang : null, 
          kegiatan: status === 'Hadir' ? kegiatan : status, foto_url: fotoUrl
        }]);
      } else {
        await supabase.from('daily_logs').update({
          tanggal, status_kehadiran: status, 
          jam_datang: status === 'Hadir' ? jamDatang : null, jam_pulang: status === 'Hadir' ? jamPulang : null, 
          kegiatan
        }).eq('id', editingId);
      }
      setIsModalOpen(false);
      fetchLogs(userId);
    } catch (error: any) {
      alert('Kesalahan: ' + error.message);
    } finally {
      setLoadingForm(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus log ini?')) return;
    await supabase.from('daily_logs').delete().eq('id', id);
    fetchLogs(userId!);
  };

  const handleGenerateWord = () => window.open(`/api/generate-report?userId=${userId}`, '_blank');

  if (!userId) return <div className="h-screen flex items-center justify-center text-lg font-semibold text-slate-500">Memuat ruang kerja...</div>;

  return (
    <main className="min-h-screen p-6 md:p-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Rekap Log Magang</h1>
            <p className="text-slate-500 mt-1">Kelola dan pantau seluruh kegiatan harianmu di sini.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button onClick={openAddModal} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg">
              <PlusCircle size={20} /> Isi Log Harian
            </button>
            <button onClick={handleGenerateWord} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg">
              <FileDown size={20} /> Unduh Word
            </button>
          </div>
        </div>

        {/* Tabel Data Modern */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-slate-500 animate-pulse">Menarik data dari database...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-semibold">
                  <tr>
                    <th className="p-5"><div className="flex items-center gap-2"><Calendar size={16}/> Tanggal</div></th>
                    <th className="p-5"><div className="flex items-center gap-2"><Activity size={16}/> Status</div></th>
                    <th className="p-5"><div className="flex items-center gap-2"><Clock size={16}/> Jam Kerja</div></th>
                    <th className="p-5">Kegiatan</th>
                    <th className="p-5"><div className="flex items-center gap-2"><ImageIcon size={16}/> Foto</div></th>
                    <th className="p-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="p-5 text-slate-800 font-medium whitespace-nowrap">{log.tanggal}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide ${log.status_kehadiran === 'Hadir' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                          {log.status_kehadiran}
                        </span>
                      </td>
                      <td className="p-5 text-slate-600 whitespace-nowrap">
                        {log.status_kehadiran === 'Hadir' ? <span className="bg-slate-100 px-2 py-1 rounded-md">{log.jam_datang} - {log.jam_pulang}</span> : <span className="text-slate-400 italic">Kosong</span>}
                      </td>
                      <td className="p-5 text-slate-600 max-w-xs truncate" title={log.kegiatan}>{log.kegiatan}</td>
                      <td className="p-5">
                        {log.foto_url ? (
                          <img src={log.foto_url} alt="Dokumentasi" className="h-12 w-16 object-cover rounded-lg shadow-sm border border-slate-200" />
                        ) : (
                          <span className="text-slate-400 text-xs bg-slate-100 px-2 py-1 rounded-md">No Image</span>
                        )}
                      </td>
                      <td className="p-5">
                        <div className="flex gap-2 justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(log)} className="p-2 bg-yellow-100 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-lg transition-colors"><Pencil size={16} /></button>
                          <button onClick={() => handleDelete(log.id)} className="p-2 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && logs.length === 0 && (
            <div className="p-16 text-center text-slate-400 flex flex-col items-center">
              <ImageIcon size={48} className="opacity-20 mb-3" />
              <p>Belum ada data magang yang tersimpan.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL POP-UP (TAMBAH & EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-lg relative transform transition-all">
            {/* Tombol Silang (Tutup) */}
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 bg-slate-100 p-2 rounded-full transition-colors"><X size={20} /></button>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              {modalMode === 'add' ? <span className="bg-blue-100 text-blue-600 p-2 rounded-xl"><PlusCircle size={24}/></span> : <span className="bg-yellow-100 text-yellow-600 p-2 rounded-xl"><Pencil size={24}/></span>}
              {modalMode === 'add' ? 'Tambah Log Harian' : 'Edit Log Magang'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tanggal Kegiatan</label>
                <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required className="w-full border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-2.5 rounded-xl text-black transition-all outline-none" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status Kehadiran</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-2.5 rounded-xl text-black transition-all outline-none">
                  <option value="Hadir">Hadir di Kantor</option>
                  <option value="Work From Home(WFH)">Work From Home (WFH)</option>
                  <option value="Sakit">Sakit</option>
                  <option value="Izin">Izin</option>
                </select>
              </div>

              {status === 'Hadir' && (
                <div className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-1/2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jam Datang</label>
                    <input type="time" value={jamDatang} onChange={(e) => setJamDatang(e.target.value)} required className="w-full border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-2.5 rounded-xl text-black transition-all outline-none" />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Jam Pulang</label>
                    <input type="time" value={jamPulang} onChange={(e) => setJamPulang(e.target.value)} required className="w-full border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-2.5 rounded-xl text-black transition-all outline-none" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Rincian Kegiatan</label>
                <textarea rows={3} placeholder="Ceritakan apa yang kamu kerjakan hari ini..." value={kegiatan} onChange={(e) => setKegiatan(e.target.value)} required className="w-full border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 p-3 rounded-xl text-black transition-all outline-none resize-none"></textarea>
              </div>
              
              {modalMode === 'add' && status === 'Hadir' && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Unggah Foto Dokumentasi</label>
                  <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} required className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-all border-2 border-dashed border-slate-200 p-2 rounded-xl" />
                </div>
              )}
              
              <button type="submit" disabled={loadingForm} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-3.5 rounded-xl mt-6 hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50">
                {loadingForm ? 'Menyimpan Data...' : (modalMode === 'add' ? 'Simpan Log Harian' : 'Update Log')}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}