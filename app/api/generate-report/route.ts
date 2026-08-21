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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID tidak ditemukan' }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) throw profileError;

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
        // RAHASIA KESUKSESAN: Jangan pernah beri string kosong "" ke mesin Word
        foto: log.foto_url && log.foto_url !== '' ? log.foto_url : 'TIDAK_ADA_FOTO'
      };
    }) || [];

    // 6. Siapkan Mesin Docxtemplater
    const templatePath = path.join(process.cwd(), 'public', 'template_laporan.docx');
    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);

    const imageOptions = {
      centered: false,
      getImage: function (tagValue: string) {
        return new Promise((resolve) => {
          const blankImg = Buffer.from(
            "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
            "base64"
          );

          // Jika teksnya 'TIDAK_ADA_FOTO', langsung berikan gambar transparan (tanpa memicu error)
          if (tagValue === 'TIDAK_ADA_FOTO') {
            return resolve(blankImg);
          }

          // Jika itu benar-benar link URL, biarkan Next.js mendownloadnya
          fetch(tagValue)
            .then((res) => {
              if (!res.ok) throw new Error("Link mati");
              return res.arrayBuffer();
            })
            .then((buffer) => resolve(Buffer.from(buffer)))
            .catch(() => resolve(blankImg));
        });
      },
      getSize: function (img: any, tagValue: string, tagName: string) {
        return [150, 110]; // Ukuran foto (px)
      },
    };

    const imageModule = new ImageModule(imageOptions);
    const doc = new Docxtemplater(zip, {
      modules: [imageModule],
      paragraphLoop: true,
      linebreaks: true,
    });

    // Menentukan bulan laporan otomatis 
    const namaBulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    let teksBulanLaporan = "";
    
    if (logs && logs.length > 0) {
      const tanggalLog = new Date(logs[0].tanggal);
      teksBulanLaporan = `${namaBulan[tanggalLog.getMonth()]} ${tanggalLog.getFullYear()}`;
    } else {
      const tanggalSekarang = new Date();
      teksBulanLaporan = `${namaBulan[tanggalSekarang.getMonth()]} ${tanggalSekarang.getFullYear()}`;
    }

    // 7. SUNTIKKAN DATA ASINKRON (Karena kita menggunakan trik 'TIDAK_ADA_FOTO', ini bebas error!)
    await doc.resolveData({
      nama: profile.nama,
      nim: profile.nim,
      unit_kerja: profile.unit_kerja,
      jurusan: profile.jurusan,
      program_studi: profile.program_studi,
      pembimbing_lapangan: profile.pembimbing_lapangan,
      bulan_laporan: teksBulanLaporan, 
      logs: formattedLogs
    });
    
    doc.render();

    // 8. Jadikan file biner
    const buf = doc.getZip().generate({
      type: 'uint8array',
      compression: 'DEFLATE',
    });

    // 9. Kirim file
    return new NextResponse(buf as any, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="Laporan_Magang_${profile.nama}.docx"`, 
      },
    });

  } catch (error: any) {
    console.error("Terjadi kesalahan:", error);
    return NextResponse.json({ error: 'Gagal membuat dokumen Word' }, { status: 500 });
  }
}