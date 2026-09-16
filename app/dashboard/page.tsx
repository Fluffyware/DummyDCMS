'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { FilePlus, Share2, FolderOpen, Search, ArrowRight, CheckCircle2, Shield, Lightbulb } from 'lucide-react';

import {
  MasterFolder,
  loadMasterFolders,
  getAllFlattenedDocs,
  loadDistributions,
  DistributionDoc,
} from '@/lib/masterlist-data';

interface MasterlistEntry {
  id: string | number;
  dept: string;
  jenis: string;
  number: string;
  judul: string;
  released: string;
  revisi: string;
  status: 'CURRENT' | 'SUPERSEDED' | 'DRAFT' | 'Released';
  r2Url?: string;
  isRecent?: boolean;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [masterFolders, setMasterFolders] = useState<MasterFolder[]>([]);
  const [distributions, setDistributions] = useState<DistributionDoc[]>([]);

  React.useEffect(() => {
    router.prefetch('/dashboard/registration');
    router.prefetch('/dashboard/distribution');
    router.prefetch('/dashboard/masterlist');
    router.prefetch('/dashboard/suggestions');
    router.prefetch('/dashboard/concepts');

    setMasterFolders(loadMasterFolders());
    setDistributions(loadDistributions());

    const handleSync = () => {
      setMasterFolders(loadMasterFolders());
      setDistributions(loadDistributions());
    };

    window.addEventListener('thi_master_folders_v3', handleSync);
    window.addEventListener('thi_distributions_updated', handleSync);
    return () => {
      window.removeEventListener('thi_master_folders_v3', handleSync);
      window.removeEventListener('thi_distributions_updated', handleSync);
    };
  }, [router]);

  const activeUserName = user?.name || 'Reza Firmansyah';

  // Build unified dynamic document list combining masterlist & recent distributions
  const allMasterEntries = useMemo<MasterlistEntry[]>(() => {
    const list: MasterlistEntry[] = [];
    const flattened = getAllFlattenedDocs(masterFolders);

    // 1. Add flattened masterlist docs
    flattened.forEach((doc, idx) => {
      list.push({
        id: `ml-${doc.id || idx}`,
        dept: doc.folderName || 'QHSE',
        jenis: doc.type || 'SOP',
        number: doc.number || `THI-DOC-${String(idx + 1).padStart(3, '0')}`,
        judul: doc.title,
        released: doc.effectiveDate || '—',
        revisi: doc.revision || 'Rev.00',
        status: doc.status === 'DRAFT' ? 'DRAFT' : 'CURRENT',
        r2Url: doc.r2Url,
        isRecent: false,
      });
    });

    // 2. Add or update from distributions (recent releases)
    distributions.forEach((dist, idx) => {
      const matchIdx = list.findIndex(
        l => (dist.idRegistrasi !== '-' && l.number === dist.idRegistrasi) || l.judul.toLowerCase() === dist.judul.toLowerCase()
      );

      if (matchIdx >= 0) {
        list[matchIdx] = {
          ...list[matchIdx],
          released: dist.createdAt || list[matchIdx].released,
          revisi: dist.revisi.startsWith('Rev.') ? dist.revisi : `Rev.${dist.revisi}`,
          r2Url: dist.fileUrl || list[matchIdx].r2Url,
          isRecent: true,
        };
      } else {
        list.unshift({
          id: `dist-${dist.id || idx}`,
          dept: dist.dept || dist.folder || 'QHSE',
          jenis: dist.jenis || 'Dokumen',
          number: dist.idRegistrasi !== '-' ? dist.idRegistrasi : dist.id,
          judul: dist.judul,
          released: dist.createdAt || '—',
          revisi: dist.revisi.startsWith('Rev.') ? dist.revisi : `Rev.${dist.revisi}`,
          status: 'Released',
          r2Url: dist.fileUrl,
          isRecent: true,
        });
      }
    });

    return list;
  }, [masterFolders, distributions]);

  // Filtered entries based on search term across all columns
  const filteredEntries = useMemo(() => {
    if (!searchTerm.trim()) return allMasterEntries;
    const term = searchTerm.toLowerCase();
    return allMasterEntries.filter(
      item =>
        item.dept.toLowerCase().includes(term) ||
        item.jenis.toLowerCase().includes(term) ||
        item.number.toLowerCase().includes(term) ||
        item.judul.toLowerCase().includes(term) ||
        item.released.toLowerCase().includes(term) ||
        item.revisi.toLowerCase().includes(term)
    );
  }, [allMasterEntries, searchTerm]);

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>

          {/* Tile 1: Distribusi Dokumen (Admin QHSE Only) */}
          {user?.role !== 'staff' && (
            <div
              onClick={() => router.push('/dashboard/distribution')}
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '16px 20px',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(7, 28, 44, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '14px',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#0284c7';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.09)';
                const iconBox = e.currentTarget.querySelector('.tile-icon-box') as HTMLElement;
                if (iconBox) {
                  iconBox.style.background = '#f0f9ff';
                  iconBox.style.borderColor = '#bae6fd';
                  iconBox.style.color = '#0284c7';
                }
                const arrowBox = e.currentTarget.querySelector('.tile-arrow-box') as HTMLElement;
                if (arrowBox) {
                  arrowBox.style.background = '#0284c7';
                  arrowBox.style.borderColor = '#0284c7';
                  arrowBox.style.color = '#ffffff';
                  arrowBox.style.transform = 'translateX(3px)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(7, 28, 44, 0.04)';
                const iconBox = e.currentTarget.querySelector('.tile-icon-box') as HTMLElement;
                if (iconBox) {
                  iconBox.style.background = '#f8fafc';
                  iconBox.style.borderColor = '#e2e8f0';
                  iconBox.style.color = '#071c2c';
                }
                const arrowBox = e.currentTarget.querySelector('.tile-arrow-box') as HTMLElement;
                if (arrowBox) {
                  arrowBox.style.background = '#f8fafc';
                  arrowBox.style.borderColor = '#e2e8f0';
                  arrowBox.style.color = '#64748b';
                  arrowBox.style.transform = 'translateX(0)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                <div
                  className="tile-icon-box"
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#071c2c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Share2 size={20} strokeWidth={2} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#071c2c', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                    Distribusi Dokumen
                  </h3>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                    Buka Hub Distribusi
                  </span>
                </div>
              </div>
              <div
                className="tile-arrow-box"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                <ArrowRight size={14} strokeWidth={2.2} />
              </div>
            </div>
          )}

          {/* Tile 2: Masterlist Dokumen */}
          <div
            onClick={() => router.push('/dashboard/masterlist')}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '16px 20px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(7, 28, 44, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#0284c7';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.09)';
              const iconBox = e.currentTarget.querySelector('.tile-icon-box') as HTMLElement;
              if (iconBox) {
                iconBox.style.background = '#f0f9ff';
                iconBox.style.borderColor = '#bae6fd';
                iconBox.style.color = '#0284c7';
              }
              const arrowBox = e.currentTarget.querySelector('.tile-arrow-box') as HTMLElement;
              if (arrowBox) {
                arrowBox.style.background = '#0284c7';
                arrowBox.style.borderColor = '#0284c7';
                arrowBox.style.color = '#ffffff';
                arrowBox.style.transform = 'translateX(3px)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(7, 28, 44, 0.04)';
              const iconBox = e.currentTarget.querySelector('.tile-icon-box') as HTMLElement;
              if (iconBox) {
                iconBox.style.background = '#f8fafc';
                iconBox.style.borderColor = '#e2e8f0';
                iconBox.style.color = '#071c2c';
              }
              const arrowBox = e.currentTarget.querySelector('.tile-arrow-box') as HTMLElement;
              if (arrowBox) {
                arrowBox.style.background = '#f8fafc';
                arrowBox.style.borderColor = '#e2e8f0';
                arrowBox.style.color = '#64748b';
                arrowBox.style.transform = 'translateX(0)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
              <div
                className="tile-icon-box"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#071c2c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                <FolderOpen size={20} strokeWidth={2} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#071c2c', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                  Masterlist Dokumen
                </h3>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  Eksplorasi Masterlist
                </span>
              </div>
            </div>
            <div
              className="tile-arrow-box"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowRight size={14} strokeWidth={2.2} />
            </div>
          </div>

          {/* Tile 3: Saran & Ide Perbaikan */}
          <div
            onClick={() => router.push('/dashboard/suggestions')}
            style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '16px 20px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(7, 28, 44, 0.04)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '14px',
              transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#0284c7';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.09)';
              const iconBox = e.currentTarget.querySelector('.tile-icon-box') as HTMLElement;
              if (iconBox) {
                iconBox.style.background = '#f0f9ff';
                iconBox.style.borderColor = '#bae6fd';
                iconBox.style.color = '#0284c7';
              }
              const arrowBox = e.currentTarget.querySelector('.tile-arrow-box') as HTMLElement;
              if (arrowBox) {
                arrowBox.style.background = '#0284c7';
                arrowBox.style.borderColor = '#0284c7';
                arrowBox.style.color = '#ffffff';
                arrowBox.style.transform = 'translateX(3px)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#e2e8f0';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(7, 28, 44, 0.04)';
              const iconBox = e.currentTarget.querySelector('.tile-icon-box') as HTMLElement;
              if (iconBox) {
                iconBox.style.background = '#f8fafc';
                iconBox.style.borderColor = '#e2e8f0';
                iconBox.style.color = '#071c2c';
              }
              const arrowBox = e.currentTarget.querySelector('.tile-arrow-box') as HTMLElement;
              if (arrowBox) {
                arrowBox.style.background = '#f8fafc';
                arrowBox.style.borderColor = '#e2e8f0';
                arrowBox.style.color = '#64748b';
                arrowBox.style.transform = 'translateX(0)';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
              <div
                className="tile-icon-box"
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#071c2c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                <Lightbulb size={20} strokeWidth={2} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#071c2c', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                  Saran &amp; Ide Perbaikan
                </h3>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#0284c7', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  {user?.role === 'staff' ? 'Tulis Saran Baru' : 'Lihat Saran Masuk'}
                </span>
              </div>
            </div>
            <div
              className="tile-arrow-box"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowRight size={14} strokeWidth={2.2} />
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
                    {searchTerm
                      ? `Tidak ada dokumen yang sesuai dengan pencarian "${searchTerm}"`
                      : 'Belum ada dokumen yang terdaftar dalam masterlist.'}
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', fontFamily: 'monospace' }}>
                              {item.number}
                            </span>
                            {item.isRecent && (
                              <span style={{ fontSize: '9.5px', fontWeight: 800, color: '#15803d', background: '#dcfce7', border: '1px solid #bbf7d0', padding: '1px 5px', borderRadius: '4px' }}>
                                UPDATE
                              </span>
                            )}
                          </div>
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
