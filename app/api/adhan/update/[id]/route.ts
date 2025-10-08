import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
// Pastikan path ke authOptions sudah benar
import { authOptions } from "@/lib/auth";

// Handler untuk permintaan PATCH ke /api/adhan
// Rute ini akan memperbarui file adhan yang sudah ada.
export async function PATCH(request: Request) {
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
    const { id, file } = body;

    if (!id || !file) {
        return NextResponse.json({ error: 'Adhan record ID and file are required.' }, { status: 400 });
    }

    // 4. Definisikan URL target untuk backend.
    const api_url = `http://198.199.81.24/api/v1/adhan/${id}`;

    // 5. Lakukan permintaan fetch ke backend.
    const apiResponse = await fetch(api_url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${bearerToken}`,
      },
      body: JSON.stringify({
        id,
        file,
      }),
    });

    // 6. Periksa apakah permintaan ke backend berhasil.
    if (!apiResponse.ok) {
      const errorResult = await apiResponse.json();
      console.error("Backend API Error:", errorResult);
      return NextResponse.json(
        { error: 'Failed to update adhan file.', details: errorResult },
        { status: apiResponse.status }
      );
    }

    // 7. Jika berhasil, parse dan kembalikan respons.
    const result = await apiResponse.json();
    return NextResponse.json(result, { status: 200 }); // 200 OK

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
