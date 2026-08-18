"use client";

import { usePathname } from 'next/navigation';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const isLogin = pathname === '/login';

  return (
    <div className={`flex-1 w-full min-h-screen flex flex-col bg-slate-50 ${!isLogin ? 'md:ml-64' : ''}`}>
      
      {/* Konten utama */}
      <div className="flex-1">
        {children}
      </div>

      {/* Footer Utama (Posisi Teks di Tengah) */}
      {!isLogin && (
        <footer className="w-full border-t border-slate-200 bg-white py-6 mt-auto">
          <div className="flex flex-col items-center justify-center text-center gap-1 text-sm text-slate-500 font-medium">
            <p>
              &copy; {new Date().getFullYear()} WiL. All rights reserved.
            </p>
            <p className="flex items-center gap-1.5 justify-center">
              Developed for <span className="text-blue-600 font-bold">All Off You</span>
            </p>
          </div>
        </footer>
      )}
      
    </div>
  );
}