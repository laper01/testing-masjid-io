// app/api/masjids/[id]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth"; // Pastikan path ini benar

// Handler untuk GET /api/masjids/[id]
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}masjids/${id}`;

    const apiResponse = await fetch(apiUrl, {
      method: "GET",
      headers: { "Authorization": `Bearer ${session.accessToken}` },
      cache: 'no-store',
    });

    const result = await apiResponse.json();
    return NextResponse.json(result, { status: apiResponse.status });

  } catch (error) {
    console.error(`GET MASJID ${params.id} API ERROR:`, error);
    return NextResponse.json({ message: 'Kesalahan Server Internal' }, { status: 500 });
  }
}

// Handler untuk PATCH /api/masjids/[id]
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}masjids/${id}`;

    const apiResponse = await fetch(apiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const result = await apiResponse.json();
    return NextResponse.json(result, { status: apiResponse.status });

  } catch (error) {
    console.error(`PATCH MASJID ${params.id} API ERROR:`, error);
    return NextResponse.json({ message: 'Kesalahan Server Internal' }, { status: 500 });
  }
}

// Handler untuk DELETE /api/masjids/[id]
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.accessToken) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}masjids/${id}`;

    const apiResponse = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
      },
    });

    if (apiResponse.status === 204 || apiResponse.ok) { // 204 No Content adalah respons umum untuk DELETE
        return new NextResponse(null, { status: 204 });
    }

    const result = await apiResponse.json();
    return NextResponse.json(result, { status: apiResponse.status });

  } catch (error) {
    console.error(`DELETE MASJID ${params.id} API ERROR:`, error);
    return NextResponse.json({ message: 'Kesalahan Server Internal' }, { status: 500 });
  }
}