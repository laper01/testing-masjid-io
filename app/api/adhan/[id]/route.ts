import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
// Pastikan path ke authOptions sudah benar
import { authOptions } from "@/lib/auth";

// Handler untuk permintaan GET ke /api/adhan/[id]
// Rute ini akan mengambil file adhan berdasarkan ID masjid.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // 1. Dapatkan sesi pengguna saat ini untuk memastikan autentikasi.
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // 2. Ekstrak bearer token dari sesi.
    const bearerToken = session.accessToken;

    if (!bearerToken) {
      console.error("Server configuration error: Access token not found in session.");
      return NextResponse.json(
        { error: 'Authentication token is missing.' },
        { status: 500 }
      );
    }

    // 3. Dapatkan ID masjid dari parameter rute dinamis.
    const { id } = params;
    if (!id) {
        return NextResponse.json({ error: 'Masjid ID is required in the URL.' }, { status: 400 });
    }

    // 4. Definisikan URL target untuk backend.
    const api_url = `${process.env.NEXT_PUBLIC_API_URL}adhan/${id}`;

    // 5. Lakukan permintaan fetch ke backend.
    const apiResponse = await fetch(api_url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${bearerToken}`,
      },
      cache: 'no-store',
    });

    // 6. Periksa apakah permintaan ke backend berhasil.
    if (!apiResponse.ok) {
      const errorResult = await apiResponse.json();
      console.error("Backend API Error:", errorResult);
      return NextResponse.json(
        { error: 'Failed to fetch adhan data.', details: errorResult },
        { status: apiResponse.status }
      );
    }

    // 7. Jika berhasil, parse dan kembalikan respons.
    const result = await apiResponse.json();
    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
