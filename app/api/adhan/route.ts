// File: app/api/adhan/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth"; // Ensure this path is correct

/**
 * Handles POST requests to create a new Adhan file record.
 * This function now correctly handles `multipart/form-data`.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    // 1. Parse the incoming request as FormData instead of JSON.
    const formData = await request.formData();
    const masjid_id = formData.get('masjid_id');
    const name = formData.get('name');
    const adhan_file = formData.get('adhan_file'); // This will be a File object

    // 2. Validate that all required fields are present.
    if (!masjid_id || !name || !adhan_file) {
      return NextResponse.json({ error: 'masjid_id, name, and adhan_file are required.' }, { status: 400 });
    }

    // 3. Create a new FormData payload to forward to the backend API.
    const backendFormData = new FormData();
    backendFormData.append('masjid_id', masjid_id);
    backendFormData.append('name', name);
    backendFormData.append('adhan_file', adhan_file);

    const api_url = `${process.env.NEXT_PUBLIC_API_URL}adhanfiles/upload`;

    // 4. Send the request to the backend.
    // NOTE: Do NOT set the 'Content-Type' header manually.
    // `fetch` will automatically set it to 'multipart/form-data' with the correct boundary.
    const apiResponse = await fetch(api_url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
      },
      body: backendFormData,
    });

    const result = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Backend API Error:", result);
      return NextResponse.json(
        { error: 'Failed to upload adhan file.', details: result },
        { status: apiResponse.status }
      );
    }

    return NextResponse.json(result, { status: 201 }); // 201 Created

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}

/**
 * Handles GET requests to list all Adhan files.
 */
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.accessToken) {
            return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
        }

        const api_url = `${process.env.NEXT_PUBLIC_API_URL}adhanfiles`;

        const apiResponse = await fetch(api_url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${session.accessToken}`,
            },
            cache: 'no-store',
        });

        const result = await apiResponse.json();

        if (!apiResponse.ok) {
            console.error("Backend API Error:", result);
            return NextResponse.json(
                { error: 'Failed to fetch adhan data.', details: result },
                { status: apiResponse.status }
            );
        }

        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        console.error("API Route Error:", error);
        return NextResponse.json(
            { error: 'An internal server error occurred.' },
            { status: 500 }
        );
    }
}