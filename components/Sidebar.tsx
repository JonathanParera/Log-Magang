"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, FileSignature, LogOut, UserCheck, Menu, X } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // State untuk melacak apakah sidebar sedang terbuka di HP
  const [isOpen, setIsOpen] = useState(false);

  // Tutup sidebar otomatis setiap kali kita pindah halaman (klik menu) di HP
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  if (pathname === '/login') return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      {/* 1. MOBILE TOP BAR (Hanya muncul di HP) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
          <div className="bg-blue-500 p-1.5 rounded-lg">
            <FileSignature size={20} className="text-white" />
          </div>
          <span>My Internship</span>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition">
          <Menu size={24} />
        </button>
      </div>

      {/* 2. OVERLAY HITAM (Hanya muncul di HP saat sidebar terbuka) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)} // Klik di luar sidebar untuk menutup
        />
      )}

      {/* 3. SIDEBAR UTAMA (Fixed di Desktop, Sliding di HP) */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white h-screen shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        
        {/* Header Sidebar */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <FileSignature size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-wide">My Internship</h1>
              <p className="text-xs text-slate-400">Log Magang</p>
            </div>
          </div>
          {/* Tombol Tutup (Silang) khusus untuk HP */}
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-red-500 rounded-lg transition">
            <X size={20} />
          </button>
        </div>
        
        {/* Navigasi Utama */}
        <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
          <Link 
            href="/dashboard" 
            className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all duration-300 ${pathname === '/dashboard' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard Utama
          </Link>

          <Link 
            href="/profile" 
            className={`flex items-center gap-3 p-3 rounded-xl font-medium transition-all duration-300 ${pathname === '/profile' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <UserCheck size={20} />
            Akun & Profil
          </Link>
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 w-full text-left font-medium p-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all duration-300"
          >
            <LogOut size={20} />
            Logout Keluar
          </button>
        </div>
      </div>
    </>
  );
}