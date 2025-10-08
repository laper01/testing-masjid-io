// app/api/masjids/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth"; // Pastikan path ini benar

export async function POST(req: Request) {
  try {
    // 1. Dapatkan sesi untuk memastikan pengguna terautentikasi
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Ambil data dari body permintaan
    const body = await req.json();

    // 3. Panggil API backend untuk membuat masjid baru
    const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}masjids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await apiRes.json();

    // 4. Jika API backend mengembalikan error, teruskan ke klien
    if (!apiRes.ok) {
      return NextResponse.json(
        { message: data.message || 'Gagal membuat masjid' },
        { status: apiRes.status }
      );
    }

    // 5. Kirim respons sukses kembali ke klien
    return NextResponse.json(data, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('MASJID CREATE API ERROR:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server internal.' },
      { status: 500 }
    );
  }
}

// Tambahkan ini ke app/api/masjids/route.ts

export async function GET(request: Request) {
  try {
    // 1. Dapatkan sesi untuk memastikan pengguna terautentikasi
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // 2. Ekstrak parameter kueri dari URL permintaan
    const { searchParams } = new URL(request.url);
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}masjids`;
    const fullUrl = `${baseUrl}?${searchParams.toString()}`;

    // 3. Panggil API backend untuk mendapatkan daftar masjid
    const apiResponse = await fetch(fullUrl, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
      },
      cache: 'no-store', // Selalu ambil data terbaru
    });

    // 4. Periksa apakah permintaan backend berhasil
    if (!apiResponse.ok) {
      const errorResult = await apiResponse.json();
      return NextResponse.json(
        { message: 'Gagal mengambil daftar masjid.', details: errorResult },
        { status: apiResponse.status }
      );
    }

    // 5. Jika berhasil, parse dan kembalikan respons
    const result = await apiResponse.json();
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("MASJID LIST API ERROR:", error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan server internal.' },
      { status: 500 }
    );
  }
}