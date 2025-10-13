// app/api/nikkah/profiles/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth"; // Pastikan path ini benar

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Handler untuk MENDAPATKAN DAFTAR profil Nikkah
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Ambil semua query params (limit, start, gender, dll.) dari request
    const { searchParams } = new URL(request.url);
    const fullUrl = `${API_BASE_URL}/nikkah/profiles?${searchParams.toString()}`;

    const apiRes = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      cache: 'no-store',
    });

    const data = await apiRes.json();
    if (!apiRes.ok) {
      return NextResponse.json(data, { status: apiRes.status });
    }
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('LIST NIKKAH PROFILES ERROR:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}