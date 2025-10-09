import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from "@/lib/auth";

/**
 * Handles GET requests to list all events, passing through query parameters.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const api_url = `${process.env.NEXT_PUBLIC_API_URL}event?${searchParams.toString()}`;

    const apiResponse = await fetch(api_url, {
      method: "GET",
      headers: { "Authorization": `Bearer ${session.accessToken}` },
      cache: 'no-store',
    });

    const result = await apiResponse.json();
    if (!apiResponse.ok) {
      console.error("Backend API Error:", result);
      return NextResponse.json({ error: 'Failed to fetch events', details: result }, { status: apiResponse.status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handles POST requests to create a new event.
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const api_url = `${process.env.NEXT_PUBLIC_API_URL}event`;

    const apiResponse = await fetch(api_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const result = await apiResponse.json();
    if (!apiResponse.ok) {
      console.error("Backend API Error:", result);
      return NextResponse.json({ error: 'Failed to create event', details: result }, { status: apiResponse.status });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
