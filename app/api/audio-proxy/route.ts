// File: app/api/audio-proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 1. Ambil URL audio dari URL search params
  const audioUrl = request.nextUrl.searchParams.get('audioUrl');

  if (!audioUrl) {
    return NextResponse.json(
      { error: 'Query parameter "audioUrl" dibutuhkan' },
      { status: 400 }
    );
  }

  try {
    // 2. Fetch ke URL audio yang asli
    const audioResponse = await fetch(audioUrl);

    if (!audioResponse.ok || !audioResponse.body) {
      return NextResponse.json(
        { error: 'Gagal mengambil file audio' },
        { status: audioResponse.status }
      );
    }

    // 3. Buat header baru untuk respons
    const headers = new Headers();
    headers.set(
      'Content-Type',
      audioResponse.headers.get('content-type') || 'audio/mpeg'
    );
    const contentLength = audioResponse.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }
    // Header ini penting agar audio player bisa melakukan seeking (lompat-lompat)
    headers.set('Accept-Ranges', 'bytes');

    // 4. Kembalikan respons baru dengan body yang di-stream
    return new Response(audioResponse.body, {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    console.error('Kesalahan pada audio proxy:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}