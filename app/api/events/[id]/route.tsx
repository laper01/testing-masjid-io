import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";

/**
 * Handles GET requests to fetch a single event by its ID.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const api_url = `${process.env.NEXT_PUBLIC_API_URL}event/${id}`;
    const apiResponse = await fetch(api_url, {
      method: "GET",
      headers: { "Authorization": `Bearer ${session.accessToken}` },
      cache: 'no-store',
    });

    const result = await apiResponse.json();
    if (!apiResponse.ok) {
      console.error("Backend API Error (GET Event):", result);
      return NextResponse.json({ error: 'Failed to fetch event data', details: result }, { status: apiResponse.status });
    }

    // --- FIX ---
    // The backend nests the event object in an "event" property.
    // We extract and return it directly so the frontend doesn't have to.
    return NextResponse.json(result.event, { status: 200 });

  } catch (error) {
    console.error("API Route Error (GET Event):", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handles PATCH requests to update an existing event.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const api_url = `${process.env.NEXT_PUBLIC_API_URL}event/${id}`;

    // --- FIX ---
    // The backend API expects the update payload to be nested inside an "event" object.
    const payload = {
      event: body
    };

    const apiResponse = await fetch(api_url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await apiResponse.json();
    if (!apiResponse.ok) {
      console.error("Backend API Error (PATCH Event):", result);
      return NextResponse.json({ error: 'Failed to update event', details: result }, { status: apiResponse.status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API Route Error (PATCH Event):", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to remove an event.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const api_url = `${process.env.NEXT_PUBLIC_API_URL}event/${id}`;
    const apiResponse = await fetch(api_url, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${session.accessToken}` },
    });

    // A successful DELETE often returns 204 No Content, which is not an error.
    if (apiResponse.status === 204) {
      return new Response(null, { status: 204 });
    }
    
    if (!apiResponse.ok) {
      const errorResult = await apiResponse.json();
      console.error("Backend API Error (DELETE Event):", errorResult);
      return NextResponse.json({ error: 'Failed to delete event', details: errorResult }, { status: apiResponse.status });
    }
    
    // Fallback for APIs that might return 200 OK on DELETE
    const result = await apiResponse.json();
    return NextResponse.json(result, { status: apiResponse.status });

  } catch (error) {
    console.error("API Route Error (DELETE Event):", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

