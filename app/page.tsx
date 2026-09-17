'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Image from 'next/image';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [user, isLoading, router]);

  return (
    <>
      <style>{`
        @keyframes taka-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes taka-fade-in {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#ffffff',
          gap: 0,
        }}
      >
        {/* Logo wrapper dengan fade-in */}
        <div
          style={{
            animation: 'taka-fade-in 0.5s ease both',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 28,
          }}
        >
          {/* Logo Taka */}
          <div style={{ position: 'relative', width: 200, height: 80 }}>
            <Image
              src="/thi-center-logo.png"
              alt="Taka Hydrocore Indonesia"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>

          {/* Spinner ring */}
          <div style={{ position: 'relative', width: 44, height: 44 }}>
            {/* Track (ring luar, abu tipis) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '3px solid rgba(7, 28, 44, 0.10)',
              }}
            />
            {/* Spinner aktif */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '3px solid transparent',
                borderTopColor: '#30256f',
                borderRightColor: 'rgba(48, 37, 111, 0.35)',
                animation: 'taka-spin 0.85s cubic-bezier(0.6, 0.2, 0.4, 0.8) infinite',
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
