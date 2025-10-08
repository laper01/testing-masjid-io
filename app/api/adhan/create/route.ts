import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
// Pastikan path ke authOptions sudah benar
import { authOptions } from "@/lib/auth";

// Handler untuk permintaan POST ke /api/adhan
// Rute ini akan mengunggah file adhan baru untuk sebuah masjid.
export async function POST(request: Request) {
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

    // 3. Dapatkan data dari body permintaan yang masuk.
    const body = await request.json();
    const { masjid_id, file } = body;

    if (!masjid_id || !file) {
        return NextResponse.json({ error: 'Masjid ID and file are required.' }, { status: 400 });
    }

    // 4. Definisikan URL target untuk backend.
    const api_url = `${process.env.NEXT_PUBLIC_API_URL}adhan`;

    // 5. Lakukan permintaan fetch ke backend.
    const apiResponse = await fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        masjid_id,
        file,
      }),
    });

    // 6. Periksa apakah permintaan ke backend berhasil.
    if (!apiResponse.ok) {
      const errorResult = await apiResponse.json();
      console.error("Backend API Error:", errorResult);
      return NextResponse.json(
        { error: 'Failed to upload adhan file.', details: errorResult },
        { status: apiResponse.status }
      );
    }

    // 7. Jika berhasil, parse dan kembalikan respons dengan status 201.
    const result = await apiResponse.json();
    return NextResponse.json(result, { status: 201 }); // 201 Created

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
