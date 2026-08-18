"use client";

import { usePathname } from 'next/navigation';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Jika halamannya /login, jangan beri margin kiri. Jika halaman lain, beri margin (ruang untuk sidebar)
  const isLogin = pathname === '/login';

  return (
    <div className={`flex-1 w-full min-h-screen ${!isLogin ? 'md:ml-64' : ''}`}>
      {children}
    </div>
  );
}