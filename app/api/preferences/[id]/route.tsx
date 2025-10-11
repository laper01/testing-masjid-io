import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";

/**
 * Handles GET requests to fetch a single preference by its ID.
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Preference ID is required' }, { status: 400 });
    }

    const api_url = `${process.env.NEXT_PUBLIC_API_URL}preferences/${id}`;
    const apiResponse = await fetch(api_url, {
      method: "GET",
      headers: { "Authorization": `Bearer ${session.accessToken}` },
      cache: 'no-store',
    });

    const result = await apiResponse.json();
    if (!apiResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch preference data', details: result }, { status: apiResponse.status });
    }

    // The backend returns the object nested inside a `data` property.
    // Return `result.data` so the frontend gets the object directly.
    return NextResponse.json(result.data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handles PATCH requests to update an existing preference.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Preference ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const api_url = `${process.env.NEXT_PUBLIC_API_URL}preferences/${id}`;

    const apiResponse = await fetch(api_url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body), // For PATCH, the body is not nested
    });

    const result = await apiResponse.json();
    if (!apiResponse.ok) {
      return NextResponse.json({ error: 'Failed to update preference', details: result }, { status: apiResponse.status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to remove a preference.
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Preference ID is required' }, { status: 400 });
    }

    const api_url = `${process.env.NEXT_PUBLIC_API_URL}preferences/${id}`;
    const apiResponse = await fetch(api_url, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${session.accessToken}` },
    });

    if (apiResponse.status !== 204 && !apiResponse.ok) {
      const errorResult = await apiResponse.json();
      return NextResponse.json({ error: 'Failed to delete preference', details: errorResult }, { status: apiResponse.status });
    }

    return new Response(null, { status: 204 }); // Success, no content
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
