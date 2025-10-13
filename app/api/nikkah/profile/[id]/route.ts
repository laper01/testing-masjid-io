// app/api/nikkah/profile/[id]/route.ts

import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth"; // Pastikan path ini benar

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

interface Params {
  params: { id: string };
}

// Handler untuk MENGUPDATE profil Nikkah by ID
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = params;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // PENTING: Backend Anda harus memverifikasi bahwa pengguna (dari session.accessToken) 
    // adalah pemilik sah dari profil dengan {id} ini.
    // Next.js hanya meneruskan permintaan.

    const body = await req.json();
    const apiRes = await fetch(`${API_BASE_URL}/nikkah/profile/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await apiRes.json();
    if (!apiRes.ok) {
      return NextResponse.json(data, { status: apiRes.status });
    }
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error(`UPDATE NIKKAH PROFILE (${id}) ERROR:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// Handler untuk MENDAPATKAN profil Nikkah PUBLIK by ID
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = params;
  try {
    // Rute ini bersifat publik sesuai contoh, jadi tidak perlu cek sesi
    const apiRes = await fetch(`${API_BASE_URL}/nikkah/profile/${id}`, {
      method: 'GET',
      cache: 'no-store',
    });

    const data = await apiRes.json();
    if (!apiRes.ok) {
      return NextResponse.json(data, { status: apiRes.status });
    }
    return NextResponse.json(data, { status: 200 });
    
  } catch (error) {
    console.error(`GET NIKKAH PROFILE (${id}) ERROR:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}