"use client";

import { usePathname } from 'next/navigation';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isLogin = pathname === '/login';

  return (
    // Tambahkan flex dan flex-col agar kita bisa mendorong footer ke bawah
    <div className={`flex-1 w-full min-h-screen flex flex-col bg-slate-50 ${!isLogin ? 'md:ml-64' : ''}`}>
      
      {/* Konten utama akan mengambil seluruh sisa ruang di atas */}
      <div className="flex-1">
        {children}
      </div>

      {/* Footer Utama (Sengaja disembunyikan di halaman Login agar desain form tetap rapi) */}
      {!isLogin && (
        <footer className="w-full border-t border-slate-200 bg-white py-5 mt-auto">
          <div className="max-w-6xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-slate-500 font-medium">
            <p>
              &copy; {new Date().getFullYear()} WIL. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5">
              Developed for <span className="text-blue-600 font-bold">All Of You</span>
            </p>
          </div>
        </footer>
      )}
      
    </div>
  );
}