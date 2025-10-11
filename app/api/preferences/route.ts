
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";

/**
 * Handles GET requests to list all user preferences.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const api_url = `${process.env.NEXT_PUBLIC_API_URL}preferences?${searchParams.toString()}`;

    const apiResponse = await fetch(api_url, {
      method: "GET",
      headers: { "Authorization": `Bearer ${session.accessToken}` },
      cache: 'no-store',
    });

    const result = await apiResponse.json();
    if (!apiResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch preferences', details: result }, { status: apiResponse.status });
    }

    // The backend returns the list in a "preferences" array, so we return the whole result
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handles POST requests to create a new user preference.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const api_url = `${process.env.NEXT_PUBLIC_API_URL}preferences`;
    
    // The backend API expects the data to be nested inside a "preferences" object.
    const payload = {
      preferences: body
    };

    const apiResponse = await fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await apiResponse.json();
    if (!apiResponse.ok) {
      return NextResponse.json({ error: 'Failed to create preference', details: result }, { status: apiResponse.status });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
