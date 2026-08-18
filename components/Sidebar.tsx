"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, FileSignature, LogOut, UserCheck } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === '/login') return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="w-64 bg-slate-900 text-white h-screen shadow-2xl fixed flex flex-col hidden md:flex">
      {/* Header Sidebar */}
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <div className="bg-blue-500 p-2 rounded-lg">
          <FileSignature size={24} className="text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide">Log Magang</h1>
          <p className="text-xs text-slate-400">Laporanmu</p>
        </div>
      </div>
      
      {/* Navigasi Utama */}
      <nav className="flex-1 p-4 space-y-2 mt-4">
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
  );
}