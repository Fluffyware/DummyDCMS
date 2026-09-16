'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  Plus,
  Search,
  FileText,
  Download,
  Eye,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  UploadCloud,
  FileCheck,
  Building2,
  Share2,
  Sparkles,
  Filter,
  LayoutGrid,
  List,
  Copy,
  QrCode,
  ShieldCheck,
  Anchor,
  Compass,
  FileCode,
  ExternalLink,
  Users,
  Check,
} from 'lucide-react';

/* ─── Type Definitions ────────────────────────────────────────── */
export interface RegisteredDoc {
  id: string; // e.g. REG0523.001
  no: number;
  dept: string;
  jenis: string;
  judul: string;
  listDokumen: string[]; // distribution targets: ['Customer', 'Seluruh Karyawan', etc.]
  fileName: string | null;
  fileSize?: string;
  catatan: string;
  status: 'Released' | 'Approved' | 'Under Review' | 'Draft';
  author: string;
  createdAt: string;
}

/* ─── Document Registration Dataset ──────────────────────────── */
const INITIAL_REGISTRATIONS: RegisteredDoc[] = [];

export const DEPARTMENTS = [
  { name: 'Finance', code: 'FN' },
  { name: 'Purchasing', code: 'PRO' },
  { name: 'Human Resources', code: 'HR' },
  { name: 'General Affairs', code: 'GA' },
  { name: 'Commercial', code: 'COM' },
  { name: 'Logistics', code: 'Log' },
  { name: 'QHSE', code: 'QHSE' },
  { name: 'Geotechnical Operation', code: 'GTO' },
  { name: 'Geophysical Operation', code: 'GFO' },
  { name: 'PPEC', code: 'PPEC' },
  { name: 'Facility', code: 'FC' },
  { name: 'Mechanical & Construction', code: 'ENG' },
];

const DEPT_OPTIONS = [
  'Finance',
  'Purchasing',
  'Human Resources',
  'General Affairs',
  'Commercial',
  'Logistics',
  'QHSE',
  'Geotechnical Operation',
  'Geophysical Operation',
  'PPEC',
  'Facility',
  'Mechanical & Construction',
];

const JENIS_OPTIONS = [
  'Form / Standar',
  'Kebijakan (Policy)',
  'Manual (Manual Sistem Manajemen)',
  'Prosedur (Procedure)',
  'Standar Operasional Prosedur (SOP)',
  'Instruksi Kerja (Work Instruction)',
  'Formulir (Form)',
  'Template (Template)',
  'Pedoman (Guideline)',
  'Laporan Teknis (Technical Report)',
];

export default function RegistrationPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<RegisteredDoc[]>(INITIAL_REGISTRATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [entriesPerPage, setEntriesPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailDoc, setDetailDoc] = useState<RegisteredDoc | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [dept, setDept] = useState('');
  const [jenis, setJenis] = useState('');
  const [judulDokumen, setJudulDokumen] = useState('');
  const [distribusi, setDistribusi] = useState<{ [key: string]: boolean }>({
    'Seluruh Karyawan': false,
    'Vendor / Kontraktor': false,
    'Customer': false,
    'Auditor': false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [catatan, setCatatan] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    showToast(`ID ${id} disalin ke clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCheckboxChange = (key: string) => {
    setDistribusi(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const invalidChars = /[!"',/\\;&>#]/;
      if (invalidChars.test(file.name)) {
        setErrorMessage('Penamaan file tidak boleh mengandung karakter seperti (!",\'\',/\\;&>#)');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Ukuran file melebihi batas maksimal 2MB.');
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      setErrorMessage('');
      setSelectedFile(file);
    }
  };

  const handleResetForm = () => {
    setDept('');
    setJenis('');
    setJudulDokumen('');
    setDistribusi({
      'Seluruh Karyawan': false,
      'Vendor / Kontraktor': false,
      'Customer': false,
      'Auditor': false,
    });
    setSelectedFile(null);
    setCatatan('');
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitNewDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dept) {
      setErrorMessage('Silakan pilih Departemen.');
      return;
    }
    if (!jenis) {
      setErrorMessage('Silakan pilih Jenis dokumen.');
      return;
    }
    if (!judulDokumen.trim()) {
      setErrorMessage('Silakan isi Judul Dokumen.');
      return;
    }

    const selectedDist = Object.keys(distribusi).filter(k => distribusi[k]);
    const distList = selectedDist.length > 0 ? selectedDist : ['Internal Department'];

    const newIdNum = registrations.length + 1;
    const formattedId = `REG0926.${String(newIdNum).padStart(3, '0')}`;

    const currentAuthor = user?.name || (user?.role === 'admin' ? 'Rizal (QMS)' : 'Staff');

    const newDocItem: RegisteredDoc = {
      no: 1,
      id: formattedId,
      dept,
      jenis,
      judul: judulDokumen.trim(),
      listDokumen: distList,
      fileName: selectedFile ? selectedFile.name : null,
      fileSize: selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB` : '',
      catatan: catatan.trim() || 'Registrasi berkas baru sistem kendali DCMS.',
      status: user?.role === 'admin' ? 'Approved' : 'Under Review',
      author: currentAuthor,
      createdAt: 'Hari Ini',
    };

    const updated = [newDocItem, ...registrations].map((item, idx) => ({
      ...item,
      no: idx + 1,
    }));

    setRegistrations(updated);
    setIsModalOpen(false);
    handleResetForm();
    showToast(`Dokumen ${formattedId} berhasil didaftarkan ke antrean registrasi!`);
  };

  const handleDeleteItem = (id: string, title: string) => {
    if (confirm(`Hapus registrasi berkas ${id} (${title})?`)) {
      const filtered = registrations.filter(r => r.id !== id).map((item, idx) => ({
        ...item,
        no: idx + 1,
      }));
      setRegistrations(filtered);
      showToast(`Registrasi dokumen ${id} telah dihapus.`);
    }
  };

  // Metrics Count
  const metrics = useMemo(() => {
    const total = registrations.length;
    const released = registrations.filter(r => r.status === 'Released').length;
    const approved = registrations.filter(r => r.status === 'Approved').length;
    const underReview = registrations.filter(r => r.status === 'Under Review').length;
    const draft = registrations.filter(r => r.status === 'Draft').length;
    return { total, released, approved, underReview, draft };
  }, [registrations]);

  // Filtered dataset
  const filteredRegistrations = useMemo(() => {
    return registrations.filter(r => {
      const matchSearch =
        !searchTerm.trim() ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.jenis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.listDokumen.some(d => d.toLowerCase().includes(searchTerm.toLowerCase())) ||
        r.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.catatan.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchDept = deptFilter === 'ALL' || r.dept === deptFilter;

      return matchSearch && matchStatus && matchDept;
    });
  }, [registrations, searchTerm, statusFilter, deptFilter]);

  // Pagination
  const totalEntries = filteredRegistrations.length;
  const totalPages = Math.ceil(totalEntries / entriesPerPage) || 1;
  const validPage = Math.min(currentPage, totalPages);
  const startIndex = (validPage - 1) * entriesPerPage;
  const paginatedDocs = filteredRegistrations.slice(startIndex, startIndex + entriesPerPage);

  const getStatusBadge = (status: RegisteredDoc['status']) => {
    switch (status) {
      case 'Released':
        return {
          bg: '#e0f2fe',
          text: '#0369a1',
          border: '#bae6fd',
          dot: '#0284c7',
          label: 'Released',
        };
      case 'Approved':
        return {
          bg: '#dcfce7',
          text: '#15803d',
          border: '#bbf7d0',
          dot: '#16a34a',
          label: 'Approved',
        };
      case 'Under Review':
        return {
          bg: '#fef3c7',
          text: '#92400e',
          border: '#fde68a',
          dot: '#f59e0b',
          label: 'Under Review',
        };
      case 'Draft':
        return {
          bg: '#f1f5f9',
          text: '#475569',
          border: '#cbd5e1',
          dot: '#94a3b8',
          label: 'Draft',
        };
    }
  };

  const getDeptColor = (dept: string) => {
    if (dept.includes('QHSE')) return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' };
    if (dept.includes('Geotechnical') || dept.includes('Geophysical')) return { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' };
    if (dept.includes('Mechanical') || dept.includes('Facility')) return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
    if (dept.includes('Commercial') || dept.includes('Purchasing') || dept.includes('Logistics')) return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' };
    if (dept.includes('Human Resources') || dept.includes('General Affairs')) return { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' };
    if (dept.includes('Finance')) return { bg: '#fefce8', text: '#a16207', border: '#fef08a' };
    if (dept.includes('PPEC')) return { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' };
    return { bg: '#f8fafc', text: '#334155', border: '#e2e8f0' };
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            background: '#071c2c',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13.5px',
            fontWeight: 600,
            border: '1px solid #38bdf8',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <CheckCircle2 size={18} style={{ color: '#38bdf8' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 1. HEADER SECTION & METRICS ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span
              style={{
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
              Document Control Queue
            </span>
          </div>
          <h1
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: '#071c2c',
              margin: 0,
              fontFamily: 'var(--font-display, inherit)',
              letterSpacing: '-0.01em',
            }}
          >
            Registrasi Dokumen
          </h1>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
            Alur Manual: Pengajuan berkas baru oleh Staff → Verifikasi &amp; Approval manual oleh QMS.
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          style={{
            background: '#071c2c',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 18px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            boxShadow: '0 1px 3px rgba(7,28,44,0.12)',
            transition: 'background 0.15s ease',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#0d2d47')}
          onMouseOut={e => (e.currentTarget.style.background = '#071c2c')}
        >
          <Plus size={14} strokeWidth={2.2} />
          Tambah Baru
        </button>
      </div>

      {/* ── 2. INTERACTIVE KPI METRIC STRIP (CLICKABLE QUICK FILTERS) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        {/* Card Total */}
        <div
          onClick={() => { setStatusFilter('ALL'); setCurrentPage(1); }}
          style={{
            background: statusFilter === 'ALL' ? '#ffffff' : '#ffffff',
            borderRadius: '10px',
            border: statusFilter === 'ALL' ? '2px solid #071c2c' : '1px solid #e2e8f0',
            padding: '16px 18px',
            cursor: 'pointer',
            boxShadow: statusFilter === 'ALL' ? '0 4px 14px rgba(7, 28, 44, 0.08)' : '0 1px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Total Registrasi</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#071c2c', marginTop: '2px' }}>{metrics.total}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#071c2c' }}>
            <FileText size={18} />
          </div>
        </div>

        {/* Card Released */}
        <div
          onClick={() => { setStatusFilter('Released'); setCurrentPage(1); }}
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: statusFilter === 'Released' ? '2px solid #0284c7' : '1px solid #e2e8f0',
            padding: '16px 18px',
            cursor: 'pointer',
            boxShadow: statusFilter === 'Released' ? '0 4px 14px rgba(2, 132, 199, 0.12)' : '0 1px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#0369a1' }}>Released (Aktif)</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>{metrics.released}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <CheckCircle2 size={18} />
          </div>
        </div>

        {/* Card Approved */}
        <div
          onClick={() => { setStatusFilter('Approved'); setCurrentPage(1); }}
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: statusFilter === 'Approved' ? '2px solid #16a34a' : '1px solid #e2e8f0',
            padding: '16px 18px',
            cursor: 'pointer',
            boxShadow: statusFilter === 'Approved' ? '0 4px 14px rgba(22, 163, 74, 0.12)' : '0 1px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#15803d' }}>Approved (Terverifikasi)</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>{metrics.approved}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <ShieldCheck size={18} />
          </div>
        </div>

        {/* Card Under Review */}
        <div
          onClick={() => { setStatusFilter('Under Review'); setCurrentPage(1); }}
          style={{
            background: '#ffffff',
            borderRadius: '10px',
            border: statusFilter === 'Under Review' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
            padding: '16px 18px',
            cursor: 'pointer',
            boxShadow: statusFilter === 'Under Review' ? '0 4px 14px rgba(245, 158, 11, 0.12)' : '0 1px 4px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#b45309' }}>Menunggu Review</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#f59e0b', marginTop: '2px' }}>{metrics.underReview}</div>
          </div>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* ── 3. MAIN CONTAINER: LIST / TABLE VIEW ── */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 12px rgba(7, 28, 44, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Filter & Toolbar Header */}
        <div
          style={{
            padding: '16px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            borderBottom: '1px solid #eef2f6',
            background: 'linear-gradient(180deg, #ffffff 0%, #fafcff 100%)',
          }}
        >
          {/* Status Tabs Strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { key: 'ALL', label: 'Semua' },
              { key: 'Released', label: 'Released' },
              { key: 'Approved', label: 'Approved' },
              { key: 'Under Review', label: 'Under Review' },
              { key: 'Draft', label: 'Draft' },
            ].map(tab => {
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    fontSize: '12.5px',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer',
                    border: active ? '1px solid #071c2c' : '1px solid #e2e8f0',
                    background: active ? '#071c2c' : '#ffffff',
                    color: active ? '#ffffff' : '#64748b',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Right Controls: Dept Filter + Search + View Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Dept Filter Dropdown */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} style={{ color: '#64748b' }} />
              <select
                value={deptFilter}
                onChange={e => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12.5px',
                  color: '#0f172a',
                  background: '#ffffff',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="ALL">Semua Departemen</option>
                {DEPT_OPTIONS.map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 12px',
                width: '230px',
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
                placeholder="Cari ID, judul, dept..."
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: '12.5px',
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

            {/* View Mode Toggle: Table / Grid */}
            <div style={{ display: 'flex', alignItems: 'center', background: '#f1f5f9', padding: '2px', borderRadius: '6px' }}>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Tampilan Tabel"
                style={{
                  border: 'none',
                  background: viewMode === 'table' ? '#ffffff' : 'transparent',
                  color: viewMode === 'table' ? '#071c2c' : '#64748b',
                  borderRadius: '4px',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Tampilan Kartu"
                style={{
                  border: 'none',
                  background: viewMode === 'grid' ? '#ffffff' : 'transparent',
                  color: viewMode === 'grid' ? '#071c2c' : '#64748b',
                  borderRadius: '4px',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: viewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Show Entries & Count Header */}
        <div
          style={{
            padding: '10px 22px',
            background: '#f8fafc',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12.5px',
            color: '#64748b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Show</span>
            <select
              value={entriesPerPage}
              onChange={e => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
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

          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Menampilkan <strong>{paginatedDocs.length}</strong> dari <strong>{totalEntries}</strong> dokumen
          </div>
        </div>

        {/* ── CONDITIONAL VIEW: TABLE OR GRID ── */}
        {viewMode === 'table' ? (
          /* ── TABLE VIEW ── */
          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#ffffff', borderBottom: '2px solid #e8eef5', color: '#475569', fontSize: '11.5px' }}>
                  <th style={{ padding: '10px 4px', width: '3%', fontWeight: 700, textAlign: 'center' }}>#</th>
                  <th style={{ padding: '10px 6px', width: '8.5%', fontWeight: 700 }}>ID</th>
                  <th style={{ padding: '10px 6px', width: '12%', fontWeight: 700 }}>Departemen</th>
                  <th style={{ padding: '10px 6px', width: '9%', fontWeight: 700 }}>Jenis</th>
                  <th style={{ padding: '10px 6px', width: '20%', fontWeight: 700 }}>Judul Dokumen</th>
                  <th style={{ padding: '10px 6px', width: '13%', fontWeight: 700 }}>List Dokumen</th>
                  <th style={{ padding: '10px 4px', width: '6.5%', fontWeight: 700, textAlign: 'center' }}>File</th>
                  <th style={{ padding: '10px 6px', width: '12%', fontWeight: 700 }}>Catatan</th>
                  <th style={{ padding: '10px 4px', width: '8%', fontWeight: 700, textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '10px 6px', width: '8%', fontWeight: 700, textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDocs.length > 0 ? (
                  paginatedDocs.map((doc, idx) => {
                    const statusStyle = getStatusBadge(doc.status);
                    const deptStyle = getDeptColor(doc.dept);
                    const isEven = idx % 2 === 1;
                    return (
                      <tr
                        key={doc.id}
                        style={{
                          background: isEven ? '#fafcff' : '#ffffff',
                          borderBottom: '1px solid #f1f5f9',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f0f7ff')}
                        onMouseLeave={e => (e.currentTarget.style.background = isEven ? '#fafcff' : '#ffffff')}
                      >
                        {/* # */}
                        <td style={{ padding: '10px 6px', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '11.5px' }}>
                          {startIndex + idx + 1}
                        </td>

                        {/* ID with Copy action */}
                        <td style={{ padding: '10px 6px', wordBreak: 'break-word' }}>
                          <button
                            type="button"
                            onClick={e => handleCopyId(doc.id, e)}
                            title="Klik untuk menyalin ID"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              fontFamily: 'monospace',
                              fontSize: '11px',
                              fontWeight: 700,
                              color: '#071c2c',
                              background: '#f1f5f9',
                              padding: '2px 5px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            <span>{doc.id}</span>
                            {copiedId === doc.id ? <Check size={10} style={{ color: '#16a34a' }} /> : <Copy size={10} style={{ color: '#94a3b8' }} />}
                          </button>
                        </td>

                        {/* Dept/Sub Dept Badge */}
                        <td style={{ padding: '10px 6px', wordBreak: 'break-word' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              fontSize: '11px',
                              fontWeight: 600,
                              color: deptStyle.text,
                              background: deptStyle.bg,
                              border: `1px solid ${deptStyle.border}`,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              lineHeight: 1.3,
                            }}
                          >
                            {doc.dept}
                          </span>
                        </td>

                        {/* Jenis */}
                        <td style={{ padding: '10px 6px', color: '#334155', fontWeight: 500, fontSize: '11.5px', lineHeight: 1.35, wordBreak: 'break-word' }}>
                          {doc.jenis}
                        </td>

                        {/* Judul Dokumen & Subtitle */}
                        <td style={{ padding: '10px 6px', wordBreak: 'break-word' }}>
                          <div
                            style={{
                              color: '#071c2c',
                              fontWeight: 700,
                              fontSize: '11.5px',
                              lineHeight: 1.35,
                              cursor: 'pointer',
                            }}
                            onClick={() => setDetailDoc(doc)}
                            title="Klik untuk melihat detail berkas"
                          >
                            {doc.judul}
                          </div>
                          <div style={{ fontSize: '10.5px', color: '#8fa0b0', marginTop: '2px' }}>
                            {doc.author} · {doc.createdAt}
                          </div>
                        </td>

                        {/* List Dokumen (Distribution Targets) */}
                        <td style={{ padding: '10px 6px', wordBreak: 'break-word' }}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                            {doc.listDokumen.map((target, tIdx) => (
                              <span
                                key={tIdx}
                                style={{
                                  fontSize: '10.5px',
                                  fontWeight: 600,
                                  color: '#475569',
                                  background: '#f8fafc',
                                  border: '1px solid #e2e8f0',
                                  padding: '1px 5px',
                                  borderRadius: '3px',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                  lineHeight: 1.25,
                                }}
                              >
                                <span>{target}</span>
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* File Dokumen */}
                        <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                          {doc.fileName ? (
                            <button
                              type="button"
                              onClick={() => showToast(`Mengunduh berkas: ${doc.fileName}`)}
                              title={`Unduh ${doc.fileName} (${doc.fileSize})`}
                              style={{
                                background: '#eff6ff',
                                color: '#0284c7',
                                border: '1px solid #bfdbfe',
                                borderRadius: '4px',
                                padding: '3px 6px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#dbeafe')}
                              onMouseLeave={e => (e.currentTarget.style.background = '#eff6ff')}
                            >
                              <FileText size={12} />
                              <span>{doc.fileSize || 'PDF'}</span>
                            </button>
                          ) : (
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 600,
                                color: '#94a3b8',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                padding: '1px 5px',
                                borderRadius: '8px',
                              }}
                            >
                              no file
                            </span>
                          )}
                        </td>

                        {/* Catatan */}
                        <td style={{ padding: '10px 6px', color: '#64748b', fontSize: '11px', lineHeight: 1.35, wordBreak: 'break-word' }}>
                          <div title={doc.catatan}>
                            {doc.catatan}
                          </div>
                        </td>

                        {/* Status Badge with Live Dot */}
                        <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '4px',
                              background: statusStyle.bg,
                              color: statusStyle.text,
                              border: `1px solid ${statusStyle.border}`,
                              padding: '2px 6px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: statusStyle.dot }} />
                            <span>{statusStyle.label}</span>
                          </span>
                        </td>

                        {/* Action Icons */}
                        <td style={{ padding: '10px 4px', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '3px' }}>
                            {/* View Detail */}
                            <button
                              type="button"
                              onClick={() => setDetailDoc(doc)}
                              title="Lihat Detail Dokumen"
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                border: '1px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#0284c7',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#f0f9ff')}
                              onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
                            >
                              <Eye size={12} strokeWidth={2} />
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(doc.id, doc.judul)}
                              title="Hapus Registrasi"
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '4px',
                                border: '1px solid #fecaca',
                                background: '#ffffff',
                                color: '#dc2626',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.15s ease',
                              }}
                              onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                              onMouseLeave={e => (e.currentTarget.style.background = '#ffffff')}
                            >
                              <Trash2 size={12} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} style={{ padding: '36px 20px', textAlign: 'center', color: '#94a3b8' }}>
                      Tidak ada dokumen registrasi yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* ── GRID CARD VIEW ── */
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', background: '#f8fafc' }}>
            {paginatedDocs.map(doc => {
              const statusStyle = getStatusBadge(doc.status);
              const deptStyle = getDeptColor(doc.dept);
              return (
                <div
                  key={doc.id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    padding: '18px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '14px',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#0284c7';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(2, 132, 199, 0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                  }}
                >
                  <div>
                    {/* Card Top: ID & Status */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: '#071c2c',
                          background: '#f1f5f9',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {doc.id}
                      </span>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          background: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                      >
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: statusStyle.dot }} />
                        {statusStyle.label}
                      </span>
                    </div>

                    {/* Dept & Jenis */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: deptStyle.text,
                          background: deptStyle.bg,
                          border: `1px solid ${deptStyle.border}`,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        {doc.dept}
                      </span>
                      <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                        {doc.jenis}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => setDetailDoc(doc)}
                      style={{
                        margin: '0 0 8px',
                        fontSize: '14.5px',
                        fontWeight: 700,
                        color: '#071c2c',
                        lineHeight: 1.4,
                        cursor: 'pointer',
                      }}
                    >
                      {doc.judul}
                    </h3>

                    {/* Catatan */}
                    <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.45 }}>
                      {doc.catatan}
                    </p>
                  </div>

                  {/* Card Bottom: File & Distribution */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {doc.fileName ? (
                        <button
                          type="button"
                          onClick={() => showToast(`Mengunduh berkas: ${doc.fileName}`)}
                          style={{
                            background: '#eff6ff',
                            color: '#0284c7',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <FileText size={12} />
                          <span>{doc.fileSize}</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>no attachment</span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setDetailDoc(doc)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          color: '#071c2c',
                          cursor: 'pointer',
                        }}
                      >
                        Detail
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(doc.id, doc.judul)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #fecaca',
                          borderRadius: '6px',
                          padding: '4px 8px',
                          fontSize: '11.5px',
                          color: '#dc2626',
                          cursor: 'pointer',
                        }}
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Table Bottom Pagination Strip */}
        <div
          style={{
            padding: '14px 22px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12.5px',
            color: '#64748b',
            background: '#ffffff',
          }}
        >
          <div>
            Showing {totalEntries === 0 ? 0 : startIndex + 1} to {Math.min(startIndex + entriesPerPage, totalEntries)} of {totalEntries} entries
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={validPage === 1}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: validPage === 1 ? '#f8fafc' : '#ffffff',
                color: validPage === 1 ? '#cbd5e1' : '#334155',
                cursor: validPage === 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              Previous
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
              const isCurrent = pageNum === validPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '6px',
                    border: isCurrent ? '1px solid #4a3b7d' : '1px solid #cbd5e1',
                    background: isCurrent ? '#4a3b7d' : '#ffffff',
                    color: isCurrent ? '#ffffff' : '#334155',
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
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={validPage === totalPages || totalPages === 0}
              style={{
                padding: '5px 10px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: validPage === totalPages || totalPages === 0 ? '#f8fafc' : '#ffffff',
                color: validPage === totalPages || totalPages === 0 ? '#cbd5e1' : '#334155',
                cursor: validPage === totalPages || totalPages === 0 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. MODAL: + TAMBAH BARU (FORM PENDAFTARAN DOKUMEN) ── */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            background: 'rgba(7, 28, 44, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
              border: '1px solid #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fafcff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '8px',
                    background: '#4a3b7d',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Plus size={18} strokeWidth={2.5} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#071c2c' }}>
                    Formulir Registrasi Dokumen Baru
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Lengkapi data dokumen untuk diajukan ke Document Controller
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitNewDoc} style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Error Banner */}
              {errorMessage && (
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    fontSize: '13px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Field 1: Departemen */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Departemen <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={dept}
                  onChange={e => setDept(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: dept ? '#0f172a' : '#94a3b8',
                    background: '#ffffff',
                    outline: 'none',
                  }}
                  required
                >
                  <option value="">-- Pilih Departemen --</option>
                  {DEPT_OPTIONS.map(d => (
                    <option key={d} value={d} style={{ color: '#0f172a' }}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 2: Jenis Dokumen */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Jenis Dokumen <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  value={jenis}
                  onChange={e => setJenis(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: jenis ? '#0f172a' : '#94a3b8',
                    background: '#ffffff',
                    outline: 'none',
                  }}
                  required
                >
                  <option value="">-- Pilih Jenis Dokumen --</option>
                  {JENIS_OPTIONS.map(j => (
                    <option key={j} value={j} style={{ color: '#0f172a' }}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>

              {/* Field 3: Judul Dokumen */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Judul Dokumen <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={judulDokumen}
                  onChange={e => setJudulDokumen(e.target.value)}
                  placeholder="Contoh: Prosedur Pengujian Geoteknik PCPT Laut Dalam"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    background: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              {/* Field 4: List Distribusi (Checkboxes) */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Target Distribusi Dokumen
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
                  {Object.keys(distribusi).map(item => (
                    <label
                      key={item}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: distribusi[item] ? '#f5f3ff' : '#f8fafc',
                        border: distribusi[item] ? '1px solid #ddd6fe' : '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12.5px',
                        color: distribusi[item] ? '#4a3b7d' : '#475569',
                        fontWeight: distribusi[item] ? 700 : 500,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={distribusi[item]}
                        onChange={() => handleCheckboxChange(item)}
                        style={{ accentColor: '#4a3b7d', cursor: 'pointer' }}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Field 5: Upload File */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Upload File Dokumen (Max 2MB)
                </label>
                <div
                  style={{
                    border: '2px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center',
                    background: '#fafcff',
                    cursor: 'pointer',
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                    style={{ display: 'none' }}
                  />
                  <UploadCloud size={24} style={{ color: '#4a3b7d', margin: '0 auto 6px' }} />
                  {selectedFile ? (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{selectedFile.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#10b981', marginTop: '2px' }}>
                        {(selectedFile.size / 1024).toFixed(0)} KB · Berkas terpilih
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>
                        Klik untuk memilih berkas (.pdf, .docx, .xlsx)
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                        Tidak boleh mengandung karakter khusus (!",'',/\;&&gt;#)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Field 6: Catatan */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Catatan / Uraian Perubahan
                </label>
                <textarea
                  value={catatan}
                  onChange={e => setCatatan(e.target.value)}
                  placeholder="Tambahkan catatan khusus pengajuan berkas..."
                  rows={2}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    background: '#ffffff',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleResetForm}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '9px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#4a3b7d',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(74, 59, 125, 0.25)',
                  }}
                >
                  <Send size={14} />
                  <span>Kirim Registrasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── 5. MODAL: LIHAT DETAIL DOKUMEN & METADATA ── */}
      {detailDoc && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            background: 'rgba(7, 28, 44, 0.45)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setDetailDoc(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              width: '100%',
              maxWidth: '580px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
              border: '1px solid #cbd5e1',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#fafcff',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={16} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#071c2c' }}>
                    Detail Registrasi Dokumen
                  </h3>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                    Verifikasi kepatuhan sistem kendali berkas DCMS
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailDoc(null)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: '#ffffff',
                  color: '#64748b',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Nomor Registrasi</span>
                <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#071c2c', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                  {detailDoc.id}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Status Dokumen</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: 700,
                    background: getStatusBadge(detailDoc.status).bg,
                    color: getStatusBadge(detailDoc.status).text,
                    border: `1px solid ${getStatusBadge(detailDoc.status).border}`,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '11.5px',
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: getStatusBadge(detailDoc.status).dot }} />
                  {detailDoc.status}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Departemen</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{detailDoc.dept}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <span style={{ color: '#64748b' }}>Jenis Dokumen</span>
                <span style={{ color: '#0f172a', fontWeight: 500 }}>{detailDoc.jenis}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Judul Dokumen</span>
                <div style={{ fontWeight: 700, color: '#071c2c', fontSize: '14.5px', lineHeight: 1.4, background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  {detailDoc.judul}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '6px' }}>Target Distribusi</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {detailDoc.listDokumen.map((t, idx) => (
                    <span key={idx} style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                      ✓ {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', marginBottom: '4px' }}>Catatan Pengajuan</span>
                <div style={{ color: '#475569', fontSize: '12.5px', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  {detailDoc.catatan}
                </div>
              </div>
              {detailDoc.fileName ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#eff6ff', padding: '12px 14px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCheck size={18} style={{ color: '#0284c7' }} />
                    <div>
                      <div style={{ color: '#0369a1', fontWeight: 700, fontSize: '13px' }}>{detailDoc.fileName}</div>
                      <div style={{ color: '#60a5fa', fontSize: '11px' }}>{detailDoc.fileSize} · Terlampir & Terverifikasi</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast(`Mengunduh berkas ${detailDoc.fileName}`)}
                    style={{
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Download size={13} />
                    <span>Unduh</span>
                  </button>
                </div>
              ) : (
                <div style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px', textAlign: 'center', padding: '8px' }}>
                  Tidak ada file lampiran fisik yang diunggah.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
