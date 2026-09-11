'use client';

import React, { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  Lightbulb,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  ImagePlus,
  Trash2,
  Eye,
  Clock,
  ChevronLeft,
  Building2,
  User,
  FileText,
  MessageSquare,
  Camera,
  Inbox,
  Filter,
  Search,
  ArrowLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

/* ─── Types ────────────────────────────────────────────────────── */
interface Suggestion {
  id: string;
  nama: string;
  dept: string;
  judul: string;
  masalah: string;
  idePerbaikan: string;
  foto: string | null; // base64 data URL
  fotoName: string | null;
  status: 'Baru' | 'Ditinjau' | 'Diterima' | 'Ditolak';
  createdAt: string;
}

/* ─── Department options (aligned with the rest of the system) ── */
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

/* ─── Mock initial suggestions ──────────────────────────────── */
const INITIAL_SUGGESTIONS: Suggestion[] = [];


/* ─── Status badge styles ───────────────────────────────────── */
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'Baru':     { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
  'Ditinjau': { bg: '#fefce8', text: '#a16207', border: '#fef08a' },
  'Diterima': { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
  'Ditolak':  { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function SuggestionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isStaff = user?.role === 'staff';

  const [suggestions, setSuggestions] = useState<Suggestion[]>(INITIAL_SUGGESTIONS);

  // ── Staff form state ──
  const [formNama, setFormNama] = useState(user?.name || '');
  const [formDept, setFormDept] = useState('');
  const [formJudul, setFormJudul] = useState('');
  const [formMasalah, setFormMasalah] = useState('');
  const [formIde, setFormIde] = useState('');
  const [formFoto, setFormFoto] = useState<string | null>(null);
  const [formFotoName, setFormFotoName] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Admin state ──
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  /* ── Handlers ─────────────────────────────────────────────── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormFoto(reader.result as string);
      setFormFotoName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    const errors: Record<string, boolean> = {};
    if (!formNama.trim()) errors.nama = true;
    if (!formDept) errors.dept = true;
    if (!formJudul.trim()) errors.judul = true;
    if (!formMasalah.trim()) errors.masalah = true;
    if (!formIde.trim()) errors.ide = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const newId = `SGS-${String(suggestions.length + 1).padStart(3, '0')}`;

    const newSuggestion: Suggestion = {
      id: newId,
      nama: formNama.trim(),
      dept: formDept,
      judul: formJudul.trim(),
      masalah: formMasalah.trim(),
      idePerbaikan: formIde.trim(),
      foto: formFoto,
      fotoName: formFotoName,
      status: 'Baru',
      createdAt: dateStr,
    };

    setSuggestions(prev => [newSuggestion, ...prev]);
    setFormNama(user?.name || '');
    setFormDept('');
    setFormJudul('');
    setFormMasalah('');
    setFormIde('');
    setFormFoto(null);
    setFormFotoName(null);
    setFormErrors({});
    setSubmitSuccess(true);
    setTimeout(() => setSubmitSuccess(false), 4000);
  };

  const handleStatusChange = (id: string, newStatus: Suggestion['status']) => {
    setSuggestions(prev =>
      prev.map(s => (s.id === id ? { ...s, status: newStatus } : s))
    );
    if (selectedSuggestion?.id === id) {
      setSelectedSuggestion(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  // ── Admin filter logic ──
  const filteredSuggestions = suggestions.filter(s => {
    const matchSearch =
      !searchTerm.trim() ||
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.judul.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'Semua' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusCounts = {
    Semua: suggestions.length,
    Baru: suggestions.filter(s => s.status === 'Baru').length,
    Ditinjau: suggestions.filter(s => s.status === 'Ditinjau').length,
    Diterima: suggestions.filter(s => s.status === 'Diterima').length,
    Ditolak: suggestions.filter(s => s.status === 'Ditolak').length,
  };

  /* ─── Shared label style ──────────────────────────────────── */
  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12.5,
    fontWeight: 600,
    color: '#334155',
    marginBottom: 6,
  };

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '10px 14px',
    fontSize: 13.5,
    fontFamily: 'var(--font-body)',
    border: `1.5px solid ${hasError ? '#fca5a5' : '#e2e8f0'}`,
    borderRadius: 10,
    outline: 'none',
    background: hasError ? '#fef2f2' : '#ffffff',
    color: '#15212a',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box' as const,
  });

  const textareaStyle = (hasError: boolean): React.CSSProperties => ({
    ...inputStyle(hasError),
    minHeight: 100,
    resize: 'vertical' as const,
    lineHeight: 1.55,
  });

  /* ═══════════════════════════════════════════════════════════
     STAFF VIEW — Suggestion Submission Form
     ═══════════════════════════════════════════════════════════ */
  if (isStaff) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', minWidth: 0, paddingBottom: 40 }}>
        {/* Back button */}
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: '#0284c7',
            padding: 0, fontFamily: 'var(--font-body)',
          }}
        >
          <ArrowLeft size={15} strokeWidth={2.2} />
          Kembali ke Dashboard
        </button>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #f59e0b',
          padding: '20px 24px',
          boxShadow: '0 2px 8px rgba(7,28,44,0.03)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: '#fffbeb', border: '1px solid #fde68a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#f59e0b',
            }}>
              <Lightbulb size={22} strokeWidth={2} />
            </div>
            <div>
              <h1 style={{
                margin: 0, fontSize: 20, fontWeight: 800, color: '#071c2c',
                fontFamily: 'var(--font-display, inherit)',
              }}>
                Form Saran & Ide Perbaikan
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                Sampaikan saran Anda untuk meningkatkan proses kerja dan operasional perusahaan.
              </p>
            </div>
          </div>
        </div>

        {/* Success Banner */}
        {submitSuccess && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 18px', borderRadius: 10,
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            animation: 'fadeIn 0.3s ease',
          }}>
            <CheckCircle2 size={18} style={{ color: '#16a34a', flexShrink: 0 }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#15803d' }}>
              Saran berhasil dikirim! Admin akan meninjau saran Anda.
            </span>
          </div>
        )}

        {/* Form Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 14px rgba(7,28,44,0.04)',
          overflow: 'hidden',
        }}>
          {/* Form header */}
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <FileText size={15} style={{ color: '#0284c7' }} />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#071c2c' }}>
              Detail Saran
            </span>
          </div>

          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Row 1: Nama + Dept */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {/* Nama */}
              <div>
                <label style={labelStyle}>
                  <User size={13} style={{ color: '#64748b' }} />
                  Nama <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="saran-nama"
                  type="text"
                  placeholder="Masukkan nama lengkap"
                  value={formNama}
                  onChange={e => { setFormNama(e.target.value); setFormErrors(p => ({ ...p, nama: false })); }}
                  style={inputStyle(!!formErrors.nama)}
                  onFocus={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(2,132,199,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = formErrors.nama ? '#fca5a5' : '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                {formErrors.nama && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block' }}>Nama wajib diisi</span>}
              </div>

              {/* Dept */}
              <div>
                <label style={labelStyle}>
                  <Building2 size={13} style={{ color: '#64748b' }} />
                  Departemen <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  id="saran-dept"
                  value={formDept}
                  onChange={e => { setFormDept(e.target.value); setFormErrors(p => ({ ...p, dept: false })); }}
                  style={{
                    ...inputStyle(!!formErrors.dept),
                    cursor: 'pointer',
                    appearance: 'auto' as const,
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(2,132,199,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = formErrors.dept ? '#fca5a5' : '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <option value="">— Pilih Departemen —</option>
                  {DEPT_OPTIONS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                {formErrors.dept && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block' }}>Departemen wajib dipilih</span>}
              </div>
            </div>

            {/* Judul Saran */}
            <div>
              <label style={labelStyle}>
                <Lightbulb size={13} style={{ color: '#64748b' }} />
                Judul Saran <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                id="saran-judul"
                type="text"
                placeholder="Tulis judul saran secara singkat dan jelas"
                value={formJudul}
                onChange={e => { setFormJudul(e.target.value); setFormErrors(p => ({ ...p, judul: false })); }}
                style={inputStyle(!!formErrors.judul)}
                onFocus={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(2,132,199,0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = formErrors.judul ? '#fca5a5' : '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              {formErrors.judul && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block' }}>Judul saran wajib diisi</span>}
            </div>

            {/* Masalah / Kondisi Saat Ini */}
            <div>
              <label style={labelStyle}>
                <AlertCircle size={13} style={{ color: '#64748b' }} />
                Masalah / Kondisi Saat Ini <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                id="saran-masalah"
                placeholder="Jelaskan masalah atau kondisi yang ingin diperbaiki..."
                value={formMasalah}
                onChange={e => { setFormMasalah(e.target.value); setFormErrors(p => ({ ...p, masalah: false })); }}
                style={textareaStyle(!!formErrors.masalah)}
                onFocus={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(2,132,199,0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = formErrors.masalah ? '#fca5a5' : '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              {formErrors.masalah && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block' }}>Masalah wajib diisi</span>}
            </div>

            {/* Ide Perbaikan */}
            <div>
              <label style={labelStyle}>
                <MessageSquare size={13} style={{ color: '#64748b' }} />
                Ide Perbaikan <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                id="saran-ide"
                placeholder="Jelaskan ide atau solusi perbaikan yang Anda usulkan..."
                value={formIde}
                onChange={e => { setFormIde(e.target.value); setFormErrors(p => ({ ...p, ide: false })); }}
                style={textareaStyle(!!formErrors.ide)}
                onFocus={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(2,132,199,0.1)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = formErrors.ide ? '#fca5a5' : '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              {formErrors.ide && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block' }}>Ide perbaikan wajib diisi</span>}
            </div>

            {/* Upload Foto */}
            <div>
              <label style={labelStyle}>
                <Camera size={13} style={{ color: '#64748b' }} />
                Upload Foto <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8' }}>(opsional)</span>
              </label>
              <input
                ref={fileRef}
                id="saran-foto"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {!formFoto ? (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: '100%',
                    padding: '28px 20px',
                    border: '2px dashed #cbd5e1',
                    borderRadius: 12,
                    background: '#fafbfc',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0284c7'; e.currentTarget.style.background = '#f0f9ff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#fafbfc'; }}
                >
                  <ImagePlus size={28} style={{ color: '#94a3b8' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b' }}>
                    Klik untuk upload foto pendukung
                  </span>
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>
                    Format: JPG, PNG, WEBP — Maks. 5MB
                  </span>
                </button>
              ) : (
                <div style={{
                  position: 'relative',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: '1px solid #e2e8f0',
                }}>
                  <img
                    src={formFoto}
                    alt="Preview"
                    style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                    padding: '20px 14px 12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: 12, color: '#ffffff', fontWeight: 500 }}>
                      {formFotoName}
                    </span>
                    <button
                      onClick={() => { setFormFoto(null); setFormFotoName(null); if (fileRef.current) fileRef.current.value = ''; }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: 6,
                        padding: '4px 10px',
                        cursor: 'pointer',
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      <Trash2 size={12} /> Hapus
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div style={{
            padding: '16px 24px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'flex-end',
          }}>
            <button
              id="btn-submit-saran"
              onClick={handleSubmit}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 28px',
                fontSize: 13.5, fontWeight: 700,
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                borderRadius: 10,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
                boxShadow: '0 2px 8px rgba(2,132,199,0.25)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0369a1';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(2,132,199,0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#0284c7';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(2,132,199,0.25)';
              }}
            >
              <Send size={15} strokeWidth={2.2} />
              Kirim Saran
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     ADMIN VIEW — Suggestion Inbox
     ═══════════════════════════════════════════════════════════ */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%', minWidth: 0, paddingBottom: 40 }}>
      {/* Back button */}
      <button
        onClick={() => router.push('/dashboard')}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, color: '#0284c7',
          padding: 0, fontFamily: 'var(--font-body)',
        }}
      >
        <ArrowLeft size={15} strokeWidth={2.2} />
        Kembali ke Dashboard
      </button>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        borderLeft: '4px solid #f59e0b',
        padding: '20px 24px',
        boxShadow: '0 2px 8px rgba(7,28,44,0.03)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: '#fffbeb', border: '1px solid #fde68a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#f59e0b',
          }}>
            <Inbox size={22} strokeWidth={2} />
          </div>
          <div>
            <h1 style={{
              margin: 0, fontSize: 20, fontWeight: 800, color: '#071c2c',
              fontFamily: 'var(--font-display, inherit)',
            }}>
              Saran & Ide Perbaikan
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Tinjau dan kelola saran yang masuk dari seluruh staff.
            </p>
          </div>
        </div>
        {/* Counter */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#eff6ff', border: '1px solid #bfdbfe',
          borderRadius: 8, padding: '6px 14px',
        }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#1d4ed8' }}>{statusCounts.Baru}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#3b82f6' }}>Saran Baru</span>
        </div>
      </div>

      {/* Toolbar: Search + Filter Tabs */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10,
          padding: '8px 14px', flex: '1 1 240px', maxWidth: 360,
        }}>
          <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input
            id="search-saran"
            type="text"
            placeholder="Cari nama, departemen, atau judul..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 12.5, color: '#15212a', width: '100%',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>

        {/* Status filter tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {(['Semua', 'Baru', 'Ditinjau', 'Diterima', 'Ditolak'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '6px 12px',
                fontSize: 12,
                fontWeight: filterStatus === status ? 700 : 500,
                borderRadius: 8,
                border: `1px solid ${filterStatus === status ? '#0284c7' : '#e2e8f0'}`,
                background: filterStatus === status ? '#e0f2fe' : '#ffffff',
                color: filterStatus === status ? '#0369a1' : '#64748b',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {status}
              <span style={{
                fontSize: 10, fontWeight: 700,
                background: filterStatus === status ? '#0284c7' : '#f1f5f9',
                color: filterStatus === status ? '#ffffff' : '#64748b',
                padding: '1px 5px', borderRadius: 99,
                minWidth: 18, textAlign: 'center' as const,
              }}>
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Suggestions Table */}
      <div style={{
        background: '#ffffff',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 14px rgba(7,28,44,0.04)',
        overflow: 'hidden',
      }}>
        {/* Table scroll wrapper */}
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} className="table-responsive-container">
          <div style={{ minWidth: '850px' }}>
            {/* Table header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '70px 1fr 160px 2fr 100px 90px 80px',
              padding: '12px 20px',
              borderBottom: '1px solid #f1f5f9',
              background: '#fafbfc',
              fontSize: 11, fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
          <span>ID</span>
          <span>Nama</span>
          <span>Departemen</span>
          <span>Judul Saran</span>
          <span>Status</span>
          <span>Tanggal</span>
          <span style={{ textAlign: 'center' as const }}>Aksi</span>
        </div>

        {/* Table body */}
        {filteredSuggestions.length === 0 ? (
          <div style={{
            padding: '48px 20px',
            textAlign: 'center' as const,
            color: '#94a3b8',
            fontSize: 13,
          }}>
            Tidak ada saran yang ditemukan.
          </div>
        ) : (
          filteredSuggestions.map((s, idx) => {
            const sStyle = STATUS_STYLES[s.status] || STATUS_STYLES['Baru'];
            return (
              <div
                key={s.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 1fr 160px 2fr 100px 90px 80px',
                  padding: '14px 20px',
                  borderBottom: idx < filteredSuggestions.length - 1 ? '1px solid #f8fafc' : 'none',
                  alignItems: 'center',
                  fontSize: 13,
                  color: '#334155',
                  transition: 'background 0.12s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                onClick={() => setSelectedSuggestion(s)}
              >
                <span style={{ fontWeight: 700, fontSize: 12, color: '#0284c7', fontFamily: 'var(--font-mono, monospace)' }}>{s.id}</span>
                <span style={{ fontWeight: 600, color: '#15212a' }}>{s.nama}</span>
                <span style={{ fontSize: 12, color: '#64748b' }}>{s.dept}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{s.judul}</span>
                <span>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    padding: '3px 10px', borderRadius: 99,
                    background: sStyle.bg, color: sStyle.text,
                    border: `1px solid ${sStyle.border}`,
                  }}>
                    {s.status}
                  </span>
                </span>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>{s.createdAt}</span>
                <span style={{ textAlign: 'center' as const }}>
                  <button
                    onClick={e => { e.stopPropagation(); setSelectedSuggestion(s); }}
                    title="Lihat Detail"
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      border: '1px solid #e2e8f0', background: '#ffffff',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#64748b',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.borderColor = '#bae6fd'; e.currentTarget.style.color = '#0284c7'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#64748b'; }}
                  >
                    <Eye size={14} />
                  </button>
                </span>
              </div>
            );
          })
        )}
          </div>
        </div>
      </div>

      {/* ── Detail Modal ── */}
      {selectedSuggestion && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setSelectedSuggestion(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 8999,
              background: 'rgba(7,28,44,0.45)',
              backdropFilter: 'blur(4px)',
              animation: 'fadeIn 0.2s ease',
            }}
          />
          {/* Modal */}
          <div style={{
            position: 'fixed',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 9000,
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            boxShadow: '0 24px 64px rgba(7,28,44,0.18)',
            width: 640,
            maxHeight: '85vh',
            overflowY: 'auto' as const,
            animation: 'fadeIn 0.25s ease',
          }}>
            {/* Modal header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid #f1f5f9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: '#fffbeb', border: '1px solid #fde68a',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#f59e0b',
                }}>
                  <Lightbulb size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#071c2c' }}>Detail Saran</div>
                  <div style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'var(--font-mono, monospace)' }}>{selectedSuggestion.id}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedSuggestion(null)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: '1px solid #e2e8f0', background: '#f8fafc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#64748b',
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Modal body */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Meta row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Nama</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#15212a' }}>{selectedSuggestion.nama}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Departemen</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#15212a' }}>{selectedSuggestion.dept}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Tanggal</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#15212a' }}>{selectedSuggestion.createdAt}</div>
                </div>
              </div>

              {/* Judul */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Judul Saran</div>
                <div style={{
                  fontSize: 15, fontWeight: 700, color: '#071c2c', lineHeight: 1.4,
                  padding: '12px 16px', background: '#f8fafc', borderRadius: 10,
                  border: '1px solid #f1f5f9',
                }}>
                  {selectedSuggestion.judul}
                </div>
              </div>

              {/* Masalah */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Masalah / Kondisi Saat Ini</div>
                <div style={{
                  fontSize: 13.5, color: '#334155', lineHeight: 1.6,
                  padding: '12px 16px', background: '#fef2f2', borderRadius: 10,
                  border: '1px solid #fecaca',
                }}>
                  {selectedSuggestion.masalah}
                </div>
              </div>

              {/* Ide Perbaikan */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Ide Perbaikan</div>
                <div style={{
                  fontSize: 13.5, color: '#334155', lineHeight: 1.6,
                  padding: '12px 16px', background: '#f0fdf4', borderRadius: 10,
                  border: '1px solid #bbf7d0',
                }}>
                  {selectedSuggestion.idePerbaikan}
                </div>
              </div>

              {/* Foto */}
              {selectedSuggestion.foto && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: '0.05em' }}>Foto Pendukung</div>
                  <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                    <img
                      src={selectedSuggestion.foto}
                      alt="Foto saran"
                      style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                </div>
              )}

              {/* Status + Action Buttons */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '16px 0 0',
                borderTop: '1px solid #f1f5f9',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>Status:</span>
                  {(() => {
                    const sStyle = STATUS_STYLES[selectedSuggestion.status] || STATUS_STYLES['Baru'];
                    return (
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        padding: '4px 12px', borderRadius: 99,
                        background: sStyle.bg, color: sStyle.text,
                        border: `1px solid ${sStyle.border}`,
                      }}>
                        {selectedSuggestion.status}
                      </span>
                    );
                  })()}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {selectedSuggestion.status === 'Baru' && (
                    <button
                      onClick={() => handleStatusChange(selectedSuggestion.id, 'Ditinjau')}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', fontSize: 12.5, fontWeight: 700,
                        background: '#fefce8', color: '#a16207',
                        border: '1px solid #fef08a', borderRadius: 8,
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#fef9c3'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#fefce8'; }}
                    >
                      <Clock size={13} /> Tandai Ditinjau
                    </button>
                  )}
                  {(selectedSuggestion.status === 'Baru' || selectedSuggestion.status === 'Ditinjau') && (
                    <>
                      <button
                        onClick={() => handleStatusChange(selectedSuggestion.id, 'Diterima')}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '8px 16px', fontSize: 12.5, fontWeight: 700,
                          background: '#0284c7', color: '#ffffff',
                          border: 'none', borderRadius: 8,
                          cursor: 'pointer', fontFamily: 'var(--font-body)',
                          transition: 'all 0.15s',
                          boxShadow: '0 2px 6px rgba(2,132,199,0.2)',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#0369a1'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#0284c7'; }}
                      >
                        <CheckCircle2 size={13} /> Terima
                      </button>
                      <button
                        onClick={() => handleStatusChange(selectedSuggestion.id, 'Ditolak')}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          padding: '8px 16px', fontSize: 12.5, fontWeight: 700,
                          background: '#ffffff', color: '#dc2626',
                          border: '1px solid #fecaca', borderRadius: 8,
                          cursor: 'pointer', fontFamily: 'var(--font-body)',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; }}
                      >
                        <X size={13} /> Tolak
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
