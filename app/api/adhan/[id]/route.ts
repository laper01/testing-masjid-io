// File: app/api/adhan/[id]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth"; // Ensure this path is correct

/**
 * Handles GET requests to fetch a single Adhan file by its ID.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Adhan file ID is required.' }, { status: 400 });
    }

    const api_url = `${process.env.NEXT_PUBLIC_API_URL}adhanfiles/${id}`;

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

/**
 * Handles PATCH requests to update an existing Adhan file record.
 * This function also correctly handles `multipart/form-data`.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Adhan file ID is required.' }, { status: 400 });
    }
    
    // 1. Parse as FormData to handle potential file updates.
    const formData = await request.formData();
    
    // 2. Create the payload to forward.
    const backendFormData = new FormData();
    
    // Append fields only if they exist in the incoming form data.
    if (formData.has('name')) {
        backendFormData.append('name', formData.get('name')!);
    }
    if (formData.has('masjid_id')) {
        backendFormData.append('masjid_id', formData.get('masjid_id')!);
    }
    if (formData.has('adhan_file')) {
        backendFormData.append('adhan_file', formData.get('adhan_file')!);
    }

    const api_url = `${process.env.NEXT_PUBLIC_API_URL}adhanfiles/${id}`;
    
    // 3. Send the PATCH request. `fetch` will handle the Content-Type.
    const apiResponse = await fetch(api_url, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
      },
      body: backendFormData,
    });

    const result = await apiResponse.json();

    if (!apiResponse.ok) {
      console.error("Backend API Error:", result);
      return NextResponse.json(
        { error: 'Failed to update adhan file.', details: result },
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


/**
 * Handles DELETE requests to remove an Adhan file record.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Adhan file ID is required.' }, { status: 400 });
    }

    const api_url = `${process.env.NEXT_PUBLIC_API_URL}adhanfiles/${id}`;

    const apiResponse = await fetch(api_url, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${session.accessToken}`,
      },
    });

    if (!apiResponse.ok) {
        try {
            const errorResult = await apiResponse.json();
            console.error("Backend API Error:", errorResult);
            return NextResponse.json(
              { error: 'Failed to delete adhan file.', details: errorResult },
              { status: apiResponse.status }
            );
        } catch (e) {
            // Handle cases where the error response is not JSON
             return NextResponse.json(
              { error: 'Failed to delete adhan file.'},
              { status: apiResponse.status }
            );
        }
    }
    
    // For DELETE, a 204 No Content is standard and has no body.
    return new Response(null, { status: 204 });

  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}