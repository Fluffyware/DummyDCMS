import { NextRequest, NextResponse } from 'next/server';
import { authenticateCredentials, setSessionCookie } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan password wajib diisi.' },
        { status: 400 }
      );
    }

    const user = authenticateCredentials(username, password);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Username atau password salah. Silakan periksa kembali.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user,
    });

    setSessionCookie(response, user);

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan saat memproses login.' },
      { status: 500 }
    );
  }
}
