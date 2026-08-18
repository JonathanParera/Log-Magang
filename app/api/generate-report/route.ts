import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// @ts-ignore
import PizZip from 'pizzip';
// @ts-ignore
import Docxtemplater from 'docxtemplater';
// @ts-ignore
import ImageModule from 'docxtemplater-image-module-free';

export async function GET(request: Request) {
  try {
    // 1. Ambil ID User dari URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID tidak ditemukan' }, { status: 400 });
    }

    // 2. Inisialisasi Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // 3. Tarik Data Profil User
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

    // 4. Tarik data Log HANYA milik user ini
    const { data: logs, error: logsError } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', userId)
      .order('tanggal', { ascending: true });

    if (logsError) throw logsError;

    // 5. Rapikan format tanggal & jam
    const formattedLogs = logs?.map((log, index) => {
      const dateObj = new Date(log.tanggal);
      const formattedDate = dateObj.toLocaleDateString('id-ID', {
        weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
      });

      return {
        no: index + 1,
        tanggal: formattedDate,
        jam_datang: log.jam_datang ? log.jam_datang.substring(0, 5) : '-',
        jam_pulang: log.jam_pulang ? log.jam_pulang.substring(0, 5) : '-',
        kegiatan: log.kegiatan,
        foto: log.foto_url || '' 
      };
    }) || [];

    // 6. Siapkan Mesin Docxtemplater
    const templatePath = path.join(process.cwd(), 'public', 'template_laporan.docx');
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);

    const imageOptions = {
      centered: false,
      getImage: function (tagValue: string) {
        return new Promise((resolve, reject) => {
          if (!tagValue) return resolve(Buffer.from(''));
          fetch(tagValue)
            .then((res) => res.arrayBuffer())
            .then((buffer) => resolve(Buffer.from(buffer)))
            .catch(reject);
        });
      },
      getSize: function () {
        return [150, 110]; // Ukuran foto (px)
      },
    };

    const imageModule = new ImageModule(imageOptions);
    const doc = new Docxtemplater(zip, {
      modules: [imageModule],
      paragraphLoop: true,
      linebreaks: true,
    });

    // 7. SUNTIKKAN DATA PROFIL & LOG KE WORD
    await doc.resolveData({
      nama: profile.nama,
      nim: profile.nim,
      unit_kerja: profile.unit_kerja,
      jurusan: profile.jurusan,
      program_studi: profile.program_studi,
      pembimbing_lapangan: profile.pembimbing_lapangan,
      bulan_laporan: "Agustus 2026", // Kamu bisa ubah ini otomatis nanti jika mau
      logs: formattedLogs
    });
    
    doc.render();

    // 8. Jadikan file biner (Menggunakan uint8array sesuai perbaikan sebelumnya)
    const buf = doc.getZip().generate({
      type: 'uint8array',
      compression: 'DEFLATE',
    });

    // 9. Kirim file (Menggunakan as any sesuai perbaikan sebelumnya)
    return new NextResponse(buf as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Laporan_Magang_${profile.nama}.docx"`, // Nama file otomatis pakai nama user!
      },
    });

  } catch (error: any) {
    console.error("Terjadi kesalahan:", error);
    return NextResponse.json({ error: 'Gagal membuat dokumen Word' }, { status: 500 });
  }
}