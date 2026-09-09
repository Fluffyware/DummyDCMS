'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { FilePlus, Share2, FolderOpen, Search, ArrowRight, CheckCircle2, Shield, Lightbulb } from 'lucide-react';

interface MasterlistEntry {
  id: number;
  dept: string;
  jenis: string;
  number: string;
  judul: string;
  released: string;
  revisi: string;
  status: 'CURRENT' | 'SUPERSEDED' | 'DRAFT';
}

const MASTERLIST_ENTRIES: MasterlistEntry[] = [
  {
    id: 1,
    dept: 'Geotechnical Operation',
    jenis: 'SOP',
    number: 'SOP-GEO-001',
    judul: 'Offshore Soil Investigation & Rotary Drilling Procedure',
    released: '01/08/2026',
    revisi: 'Rev.02',
    status: 'CURRENT',
  },
  {
    id: 2,
    dept: 'Mechanical & Construction',
    jenis: 'Instruksi Kerja (WI)',
    number: 'WI-OPS-002',
    judul: 'Excavation Safety, Heavy Winching & Deck Operations',
    released: '15/07/2026',
    revisi: 'Rev.01',
    status: 'CURRENT',
  },
  {
    id: 3,
    dept: 'QHSE',
    jenis: 'Kebijakan (Policy)',
    number: 'POL-QHSE-001',
    judul: 'QHSSE Corporate Management Policy & Zero Harm Mandate',
    released: '01/06/2026',
    revisi: 'Rev.03',
    status: 'CURRENT',
  },
  {
    id: 4,
    dept: 'Human Resources',
    jenis: 'Formulir',
    number: 'FRM-HR-003',
    judul: 'Employee Safety Induction & Offshore Readiness Checklist',
    released: '01/05/2026',
    revisi: 'Rev.01',
    status: 'CURRENT',
  },
  {
    id: 5,
    dept: 'Mechanical & Construction',
    jenis: 'SOP',
    number: 'SOP-OPS-004',
    judul: 'Heavy Equipment & Seabed CPT Deployment Procedure',
    released: '20/04/2026',
    revisi: 'Rev.00',
    status: 'CURRENT',
  },
  {
    id: 6,
    dept: 'QHSE',
    jenis: 'Manual',
    number: 'MAN-QHSE-001',
    judul: 'Integrated Management System (IMS) QHSSE Manual',
    released: '01/01/2026',
    revisi: 'Rev.02',
    status: 'CURRENT',
  },
  {
    id: 7,
    dept: 'Geotechnical Operation',
    jenis: 'Prosedur',
    number: 'PRO-GEO-002',
    judul: 'Geotechnical Core Logging & Sample Lithology Reporting',
    released: '12/03/2026',
    revisi: 'Rev.01',
    status: 'CURRENT',
  },
  {
    id: 8,
    dept: 'QHSE',
    jenis: 'SOP',
    number: 'SOP-ENV-001',
    judul: 'Marine Environmental Monitoring & Waste Disposal SOP',
    released: '01/03/2026',
    revisi: 'Rev.01',
    status: 'CURRENT',
  },
  {
    id: 9,
    dept: 'QHSE',
    jenis: 'Instruksi Kerja (WI)',
    number: 'WI-SAFE-003',
    judul: 'PPE Inspection & Offshore Rig Lifting Gear Certification',
    released: '18/02/2026',
    revisi: 'Rev.00',
    status: 'CURRENT',
  },
  {
    id: 10,
    dept: 'Geophysical Operation',
    jenis: 'Formulir',
    number: 'FRM-OPS-001',
    judul: 'Daily Safety Inspection & Pre-Shift Toolbox Talk (TBT) Record',
    released: '01/04/2026',
    revisi: 'Rev.02',
    status: 'CURRENT',
  },
  {
    id: 11,
    dept: 'Human Resources',
    jenis: 'Template',
    number: 'TMP-HR-002',
    judul: 'Offshore Safety Training Attendance & Competency Log Template',
    released: '01/02/2026',
    revisi: 'Rev.00',
    status: 'CURRENT',
  },
  {
    id: 12,
    dept: 'Geotechnical Operation',
    jenis: 'SOP',
    number: 'SOP-LAB-001',
    judul: 'Soil Mechanics Triaxial Shear & Oedometer Testing Standard',
    released: '10/01/2026',
    revisi: 'Rev.02',
    status: 'CURRENT',
  },
  {
    id: 13,
    dept: 'Commercial',
    jenis: 'Prosedur',
    number: 'PRO-PRJ-003',
    judul: 'Client QHSSE Bridging & Offshore Survey SIMOPS Protocol',
    released: '05/01/2026',
    revisi: 'Rev.01',
    status: 'CURRENT',
  },
  {
    id: 14,
    dept: 'Facility',
    jenis: 'Pedoman',
    number: 'GDL-ENG-002',
    judul: 'Downhole Piezocone Penetrometer (PCPT) Calibration Guidelines',
    released: '15/12/2025',
    revisi: 'Rev.01',
    status: 'CURRENT',
  },
  {
    id: 15,
    dept: 'Finance',
    jenis: 'Prosedur',
    number: 'PRO-AUD-001',
    judul: 'Financial Invoicing & Payment Reconciliation Procedure',
    released: '01/12/2025',
    revisi: 'Rev.02',
    status: 'CURRENT',
  },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  React.useEffect(() => {
    router.prefetch('/dashboard/registration');
    router.prefetch('/dashboard/distribution');
    router.prefetch('/dashboard/masterlist');
    router.prefetch('/dashboard/suggestions');
    router.prefetch('/dashboard/concepts');
  }, [router]);

  const activeUserName = user?.name || 'Reza Firmansyah';

  // Filtered entries based on search term across all columns
  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return MASTERLIST_ENTRIES;
    const term = searchTerm.toLowerCase();
    return MASTERLIST_ENTRIES.filter(
      item =>
        item.dept.toLowerCase().includes(term) ||
        item.jenis.toLowerCase().includes(term) ||
        item.number.toLowerCase().includes(term) ||
        item.judul.toLowerCase().includes(term) ||
        item.released.toLowerCase().includes(term) ||
        item.revisi.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  // Pagination calculation
  const totalEntries = filteredEntries.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (validCurrentPage - 1) * entriesPerPage;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + entriesPerPage);

  const getJenisBadgeStyle = (jenis: string) => {
    switch (jenis) {
      case 'SOP':
      case 'Standar Operasional Prosedur (SOP)':
        return { bg: '#e0f2fe', text: '#0369a1', border: '#bae6fd' };
      case 'Kebijakan (Policy)':
        return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      case 'Manual':
        return { bg: '#f3e8ff', text: '#6b21a8', border: '#e9d5ff' };
      case 'Instruksi Kerja (WI)':
        return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' };
      case 'Formulir':
        return { bg: '#f1f5f9', text: '#334155', border: '#cbd5e1' };
      case 'Prosedur':
        return { bg: '#e0e7ff', text: '#3730a3', border: '#c7d2fe' };
      default:
        return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        minWidth: 0,
        paddingBottom: '40px',
      }}
    >
      {/* ── 1. EXECUTIVE RESPONSIVE HEADER ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #0284c7',
          padding: '20px 24px',
          boxShadow: '0 2px 8px rgba(7, 28, 44, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '820px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#0369a1',
                background: '#f0f9ff',
                border: '1px solid #e0f2fe',
                padding: '2px 8px',
                borderRadius: '6px',
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7' }} />
              Document Control &amp; QHSSE Portal
            </span>
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(18px, 1.8vw, 22px)',
              fontWeight: 800,
              color: '#071c2c',
              fontFamily: 'var(--font-display, inherit)',
              lineHeight: 1.35,
              letterSpacing: '-0.01em',
            }}
          >
            Hi {activeUserName}, Welcome to Document Control - QHSSE Management System
          </h1>

          <div style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
            Pusat pengelolaan dokumen resmi, alur pengajuan revisi, dan repositori masterlist terintegrasi.
          </div>
        </div>
      </div>

      {/* ── 2. THREE CORE FEATURE TILES (QUICK ACCESS) ── */}
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Tile 1: Registrasi Dokumen */}
          <div
            onClick={() => router.push('/dashboard/registration')}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(7, 28, 44, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.22s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = '#0284c7';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(2, 132, 199, 0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(7, 28, 44, 0.04)';
            }}
          >
            {/* Top Accent Strip */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#0284c7' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #bae6fd',
                  }}
                >
                  <FilePlus size={22} strokeWidth={2.2} />
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#0369a1',
                    background: '#f0f9ff',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #e0f2fe',
                  }}
                >
                  Pendaftaran
                </span>
              </div>

              <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 800, color: '#071c2c' }}>
                Registrasi Dokumen
              </h3>

              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                Daftarkan dokumen baru atau ajukan revisi prosedur operasional, SOP, formulir, dan instruksi kerja baru ke antrean kendali.
              </p>
            </div>

            <div
              style={{
                marginTop: '18px',
                paddingTop: '14px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#0284c7',
                fontSize: '12.5px',
                fontWeight: 700,
              }}
            >
              <span>Buka Formulir Registrasi</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Tile 2: Distribusi Dokumen (Admin Master Only) */}
          {user?.role !== 'staff' && (
            <div
              onClick={() => router.push('/dashboard/distribution')}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(7, 28, 44, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.22s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.borderColor = '#16a34a';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(22, 163, 74, 0.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(7, 28, 44, 0.04)';
              }}
            >
              {/* Top Accent Strip */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#16a34a' }} />

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: '#f0fdf4',
                      color: '#16a34a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #bbf7d0',
                    }}
                  >
                    <Share2 size={22} strokeWidth={2.2} />
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: '#15803d',
                      background: '#f0fdf4',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid #dcfce7',
                    }}
                  >
                    Tanda Terima
                  </span>
                </div>

                <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 800, color: '#071c2c' }}>
                  Distribusi Dokumen
                </h3>

                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                  Kelola penyebaran dokumen resmi ke divisi terkait, pangkalan kapal survei, laboratorium, serta tracking acknowledgement pegawai.
                </p>
              </div>

              <div
                style={{
                  marginTop: '18px',
                  paddingTop: '14px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  color: '#16a34a',
                  fontSize: '12.5px',
                  fontWeight: 700,
                }}
              >
                <span>Buka Distribusi Hub</span>
                <ArrowRight size={15} />
              </div>
            </div>
          )}

          {/* Tile 3: Masterlist Dokumen */}
          <div
            onClick={() => router.push('/dashboard/masterlist')}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(7, 28, 44, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.22s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = '#4a3b7d';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(74, 59, 125, 0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(7, 28, 44, 0.04)';
            }}
          >
            {/* Top Accent Strip */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#4a3b7d' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#f5f3ff',
                    color: '#4a3b7d',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #ddd6fe',
                  }}
                >
                  <FolderOpen size={22} strokeWidth={2.2} />
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#4a3b7d',
                    background: '#f5f3ff',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #ede9fe',
                  }}
                >
                  15 Folder Aktif
                </span>
              </div>

              <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 800, color: '#071c2c' }}>
                Masterlist Dokumen
              </h3>

              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                Akses repositori terpusat 15 folder dokumen ISO &amp; maritim, riwayat revisi, status berlaku, dan berkas terverifikasi.
              </p>
            </div>

            <div
              style={{
                marginTop: '18px',
                paddingTop: '14px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#4a3b7d',
                fontSize: '12.5px',
                fontWeight: 700,
              }}
            >
              <span>Eksplorasi Masterlist</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Tile 4: Saran & Ide Perbaikan */}
          <div
            onClick={() => router.push('/dashboard/suggestions')}
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              padding: '24px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(7, 28, 44, 0.04)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.22s ease',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.borderColor = '#f59e0b';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(245, 158, 11, 0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(7, 28, 44, 0.04)';
            }}
          >
            {/* Top Accent Strip */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: '#f59e0b' }} />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '10px',
                    background: '#fffbeb',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #fde68a',
                  }}
                >
                  <Lightbulb size={22} strokeWidth={2.2} />
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#a16207',
                    background: '#fffbeb',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #fef3c7',
                  }}
                >
                  {user?.role === 'staff' ? 'Kirim Saran' : 'Inbox Saran'}
                </span>
              </div>

              <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 800, color: '#071c2c' }}>
                Saran & Ide Perbaikan
              </h3>

              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                {user?.role === 'staff'
                  ? 'Sampaikan saran dan ide perbaikan untuk meningkatkan proses kerja dan operasional perusahaan.'
                  : 'Tinjau dan kelola saran perbaikan dari seluruh staff untuk peningkatan kinerja.'
                }
              </p>
            </div>

            <div
              style={{
                marginTop: '18px',
                paddingTop: '14px',
                borderTop: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#f59e0b',
                fontSize: '12.5px',
                fontWeight: 700,
              }}
            >
              <span>{user?.role === 'staff' ? 'Tulis Saran Baru' : 'Lihat Saran Masuk'}</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. NEWEST UPDATE MASTERLIST DOKUMEN (TABLE) ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(7, 28, 44, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Table Top Header Title Strip */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e8eef5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#071c2c',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#071c2c' }}>
                Daftar Isi Masterlist Dokumen
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '1px' }}>
                Pembaruan terkini dokumen terkendali di lingkungan PT Taka Hydrocore Indonesia
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => router.push('/dashboard/masterlist')}
            style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#0284c7',
              background: '#e0f2fe',
              border: '1px solid #bae6fd',
              padding: '6px 14px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.18s ease',
            }}
          >
            <span>Buka Seluruh Direktori</span>
            <span>→</span>
          </button>
        </div>

        {/* Table Search & Show Entries Bar */}
        <div
          style={{
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            background: '#ffffff',
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          {/* Show Entries Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={e => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                color: '#0f172a',
                background: '#ffffff',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
          </div>

          {/* Search all columns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', color: '#475569', whiteSpace: 'nowrap' }}>Search all columns:</span>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 12px',
                width: '240px',
              }}
            >
              <Search size={14} style={{ color: '#94a3b8' }} />
              <input
                type="text"
                value={searchTerm}
                onChange={e => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari kata kunci..."
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '13px',
                  width: '100%',
                  color: '#0f172a',
                  background: 'transparent',
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '12px' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} className="table-responsive-container">
          <table style={{ width: '100%', minWidth: '680px', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '11.5px' }}>
                <th style={{ padding: '10px 8px', fontWeight: 800, width: '4%', textAlign: 'center' }}>#</th>
                <th style={{ padding: '10px 8px', fontWeight: 800, width: '18%' }}>Departemen</th>
                <th style={{ padding: '10px 8px', fontWeight: 800, width: '13%' }}>Jenis</th>
                <th style={{ padding: '10px 8px', fontWeight: 800, width: '43%' }}>Judul</th>
                <th style={{ padding: '10px 8px', fontWeight: 800, width: '13%' }}>Released</th>
                <th style={{ padding: '10px 8px', fontWeight: 800, width: '9%', textAlign: 'center' }}>Revisi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEntries.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8' }}>
                    Tidak ada dokumen yang sesuai dengan pencarian &quot;{searchTerm}&quot;
                  </td>
                </tr>
              ) : (
                paginatedEntries.map((item, index) => {
                  const actualIndex = startIndex + index + 1;
                  const jenisStyle = getJenisBadgeStyle(item.jenis);

                  return (
                    <tr
                      key={item.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      onClick={() => router.push('/dashboard/masterlist')}
                    >
                      {/* # */}
                      <td style={{ padding: '10px 8px', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '11.5px' }}>
                        {actualIndex}
                      </td>

                      {/* Dept/Sub Dept */}
                      <td style={{ padding: '10px 8px', fontWeight: 600, color: '#1e293b', fontSize: '11.5px', lineHeight: 1.35, wordBreak: 'break-word' }}>
                        {item.dept}
                      </td>

                      {/* Jenis */}
                      <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: jenisStyle.bg,
                            color: jenisStyle.text,
                            border: `1px solid ${jenisStyle.border}`,
                            display: 'inline-block',
                            lineHeight: 1.25,
                          }}
                        >
                          {item.jenis}
                        </span>
                      </td>

                      {/* Judul */}
                      <td style={{ padding: '10px 8px', wordBreak: 'break-word' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                            {item.number}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#071c2c', lineHeight: 1.35 }}>
                            {item.judul}
                          </span>
                        </div>
                      </td>

                      {/* Released */}
                      <td style={{ padding: '10px 8px', color: '#475569', fontWeight: 500, fontSize: '11.5px' }}>
                        {item.released}
                      </td>

                      {/* Revisi */}
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: '#071c2c',
                            color: '#ffffff',
                            fontFamily: 'monospace',
                          }}
                        >
                          {item.revisi}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #e8eef5',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '13px',
            color: '#64748b',
          }}
        >
          <div>
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entriesPerPage, totalEntries)} of {totalEntries} entries
            {searchTerm && ` (filtered from ${MASTERLIST_ENTRIES.length} total entries)`}
          </div>

          {/* Page Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              disabled={validCurrentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: validCurrentPage === 1 ? '#f1f5f9' : '#ffffff',
                color: validCurrentPage === 1 ? '#94a3b8' : '#071c2c',
                cursor: validCurrentPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '12.5px',
              }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
              const isCur = pageNum === validCurrentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: isCur ? '1px solid #071c2c' : '1px solid #cbd5e1',
                    background: isCur ? '#071c2c' : '#ffffff',
                    color: isCur ? '#ffffff' : '#071c2c',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '12.5px',
                  }}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              type="button"
              disabled={validCurrentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: validCurrentPage === totalPages || totalPages === 0 ? '#f1f5f9' : '#ffffff',
                color: validCurrentPage === totalPages || totalPages === 0 ? '#94a3b8' : '#071c2c',
                cursor: validCurrentPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '12.5px',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
