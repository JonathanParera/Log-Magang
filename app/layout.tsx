import './globals.css'
import Sidebar from '../components/Sidebar'
import MainLayout from '../components/Mainlayout'

export const metadata = {
  title: 'My Intership',
  description: 'Aplikasi pencatatan kegiatan magang harian',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-black flex min-h-screen">
        {/* Sidebar sudah punya logikanya sendiri untuk sembunyi di halaman login */}
        <Sidebar />
        
        {/* Konten utama sekarang dibungkus oleh MainLayout yang dinamis */}
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  )
}