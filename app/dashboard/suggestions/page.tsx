'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  Building2,
  User,
  FileText,
  MessageSquare,
  Camera,
  Inbox,
  Search,
  ArrowLeft,
  History,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Suggestion,
  loadSuggestions,
  addSuggestion,
  updateSuggestionStatus,
  deleteSuggestion,
  syncWithSupabase,
} from '@/lib/suggestions-data';

/* ─── Department options ─────────────────────────────────────── */
const DEPT_OPTIONS = [
  'Geotechnical',
  'Operations',
  'Engineering',
  'HR & General Affairs',
  'Finance & Accounting',
  'Information Technology',
  'Environment',
  'Commercial & Logistics',
  'QHSE & QMS',
];

/* ─── Status badge styles ───────────────────────────────────── */
const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; desc: string }> = {
  'Baru':     { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', desc: 'Menunggu Tinjauan QMS' },
  'Ditinjau': { bg: '#fefce8', text: '#a16207', border: '#fef08a', desc: 'Sedang Dievaluasi' },
  'Diterima': { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', desc: 'Disetujui untuk Diterapkan' },
  'Ditolak':  { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', desc: 'Belum Dapat Diterapkan' },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function SuggestionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isStaff = user?.role === 'staff';

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  // ── Staff form state ──
  const [formNama, setFormNama] = useState('');
  const [formDept, setFormDept] = useState('');
  const [formJudul, setFormJudul] = useState('');
  const [formMasalah, setFormMasalah] = useState('');
  const [formIde, setFormIde] = useState('');
  const [formFoto, setFormFoto] = useState<string | null>(null);
  const [formFotoName, setFormFotoName] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Admin & Modal state ──
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [selectedSuggestion, setSelectedSuggestion] = useState<Suggestion | null>(null);

  // ── Initial Load & Synchronization ──
  useEffect(() => {
    // 1. Immediate load from localStorage
    const local = loadSuggestions();
    setSuggestions(local);

    // 2. Background sync with Supabase
    syncWithSupabase().then(synced => {
      if (synced && synced.length > 0) {
        setSuggestions(synced);
      }
    });

    // 3. Listen for changes from other tabs/actions
    const handleUpdate = () => {
      setSuggestions(loadSuggestions());
    };
    window.addEventListener('thi_suggestions_updated', handleUpdate);
    return () => window.removeEventListener('thi_suggestions_updated', handleUpdate);
  }, []);

  // ── Auto-fill user dept when user is logged in ──
  useEffect(() => {
    if (user) {
      if (!formDept && user.department) setFormDept(user.department);
    }
  }, [user]);

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

  const handleSubmit = async () => {
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

    setIsSubmitting(true);

    try {
      const created = await addSuggestion({
        nama: formNama.trim(),
        dept: formDept,
        judul: formJudul.trim(),
        masalah: formMasalah.trim(),
        idePerbaikan: formIde.trim(),
        foto: formFoto,
        fotoName: formFotoName,
        status: 'Baru',
        userId: user?.id || 'staff',
      });

      // Update local state immediately
      setSuggestions(prev => [created, ...prev.filter(p => p.id !== created.id)]);

      // Reset form
      setFormNama('');
      setFormJudul('');
      setFormMasalah('');
      setFormIde('');
      setFormFoto(null);
      setFormFotoName(null);
      setFormErrors({});
      setSubmitSuccess(true);

      // Switch to history tab after short feedback
      setTimeout(() => {
        setSubmitSuccess(false);
        setActiveTab('history');
      }, 1200);
    } catch (err) {
      console.error('Error adding suggestion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Suggestion['status']) => {
    const updated = await updateSuggestionStatus(id, newStatus);
    setSuggestions(updated);
    if (selectedSuggestion?.id === id) {
      setSelectedSuggestion(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus usulan saran ini?')) return;
    const updated = await deleteSuggestion(id);
    setSuggestions(updated);
    if (selectedSuggestion?.id === id) {
      setSelectedSuggestion(null);
    }
  };

  // ── Filtered suggestions ──
  // For staff: filter by this user or department in History tab
  const staffSuggestions = suggestions.filter(s => {
    if (!user) return true;
    return (
      s.userId === user.id ||
      s.nama.toLowerCase() === user.name.toLowerCase() ||
      s.dept.toLowerCase() === user.department?.toLowerCase()
    );
  });

  // For admin: global filter
  const filteredSuggestions = suggestions.filter(s => {
    const matchSearch =
      !searchTerm.trim() ||
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase());
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

  /* ─── Shared styles ─────────────────────────────────────────── */
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
    minHeight: 105,
    resize: 'vertical' as const,
    lineHeight: 1.55,
  });

  /* ═══════════════════════════════════════════════════════════
     STAFF VIEW (Submission Form + Riwayat Usulan Saya)
     ═══════════════════════════════════════════════════════════ */
  if (isStaff) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%', minWidth: 0, paddingBottom: 40 }}>
        {/* Back button */}
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: '#0284c7',
            padding: 0, fontFamily: 'var(--font-body)', width: 'fit-content',
          }}
        >
          <ArrowLeft size={15} strokeWidth={2.2} />
          Kembali ke Dashboard
        </button>

        {/* Header with user profile and quick stats */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          borderLeft: '4px solid #f59e0b',
          padding: '22px 26px',
          boxShadow: '0 2px 10px rgba(7,28,44,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: '#fffbeb', border: '1px solid #fde68a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#f59e0b', flexShrink: 0,
            }}>
              <Lightbulb size={24} strokeWidth={2.2} />
            </div>
            <div>
              <h1 style={{
                margin: 0, fontSize: 20, fontWeight: 800, color: '#071c2c',
                fontFamily: 'var(--font-display, inherit)',
              }}>
                Saran & Ide Perbaikan (QMS)
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                Ruang aspirasi perbaikan berkelanjutan (Continuous Improvement) untuk staff PT Taka Hydrocore Indonesia.
              </p>
            </div>
          </div>

          {/* Quick Counter Badges for Staff */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10,
              padding: '8px 14px', textAlign: 'center', minWidth: 80,
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#071c2c' }}>{staffSuggestions.length}</div>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Total Usulan</div>
            </div>
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10,
              padding: '8px 14px', textAlign: 'center', minWidth: 80,
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#15803d' }}>
                {staffSuggestions.filter(s => s.status === 'Diterima').length}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: '#15803d', textTransform: 'uppercase' }}>Diterima</div>
            </div>
            <div style={{
              background: '#fefce8', border: '1px solid #fef08a', borderRadius: 10,
              padding: '8px 14px', textAlign: 'center', minWidth: 80,
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#a16207' }}>
                {staffSuggestions.filter(s => s.status === 'Ditinjau' || s.status === 'Baru').length}
              </div>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: '#a16207', textTransform: 'uppercase' }}>Proses</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Kirim Saran Baru vs Riwayat Usulan Saya) */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          borderBottom: '1px solid #e2e8f0', paddingBottom: 10,
        }}>
          <button
            onClick={() => setActiveTab('form')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 10,
              fontSize: 13, fontWeight: 700,
              fontFamily: 'var(--font-body)',
              border: activeTab === 'form' ? '1px solid #0284c7' : '1px solid transparent',
              background: activeTab === 'form' ? '#e0f2fe' : 'transparent',
              color: activeTab === 'form' ? '#0369a1' : '#64748b',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <Send size={15} />
            Formulir Usulan Baru
          </button>

          <button
            onClick={() => setActiveTab('history')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 18px', borderRadius: 10,
              fontSize: 13, fontWeight: 700,
              fontFamily: 'var(--font-body)',
              border: activeTab === 'history' ? '1px solid #0284c7' : '1px solid transparent',
              background: activeTab === 'history' ? '#e0f2fe' : 'transparent',
              color: activeTab === 'history' ? '#0369a1' : '#64748b',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <History size={15} />
            Riwayat Usulan Saya
            <span style={{
              fontSize: 11, fontWeight: 800,
              padding: '2px 7px', borderRadius: 99,
              background: activeTab === 'history' ? '#0284c7' : '#e2e8f0',
              color: activeTab === 'history' ? '#ffffff' : '#475569',
            }}>
              {staffSuggestions.length}
            </span>
          </button>
        </div>

        {/* Success Banner */}
        {submitSuccess && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '16px 20px', borderRadius: 12,
            background: '#f0fdf4', border: '1px solid #86efac',
            boxShadow: '0 4px 12px rgba(22,163,74,0.08)',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: '#dcfce7',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0,
            }}>
              <CheckCircle2 size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#15803d' }}>
                Saran Berhasil Disimpan & Dikirim ke Tim QMS!
              </div>
              <div style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>
                Usulan Anda telah tercatat dan dapat dipantau pada tab "Riwayat Usulan Saya".
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 1: FORM PENGISIAN ── */}
        {activeTab === 'form' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(7,28,44,0.04)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #f1f5f9',
              background: '#fafbfc',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} style={{ color: '#f59e0b' }} />
                <span style={{ fontSize: 13.5, fontWeight: 700, color: '#071c2c' }}>
                  Formulir Saran & Ide Perbaikan
                </span>
              </div>
              <span style={{ fontSize: 11.5, color: '#64748b' }}>
                Login sebagai: <strong>{user?.name}</strong> ({user?.department})
              </span>
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Row 1: Nama & Departemen */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div>
                  <label style={labelStyle}>
                    <User size={13} style={{ color: '#64748b' }} />
                    Nama Pengusul <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <input
                    id="saran-nama"
                    type="text"
                    placeholder="Masukkan nama lengkap Anda"
                    value={formNama}
                    onChange={e => { setFormNama(e.target.value); setFormErrors(p => ({ ...p, nama: false })); }}
                    style={inputStyle(!!formErrors.nama)}
                  />
                  {formErrors.nama && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block' }}>Nama wajib diisi</span>}
                </div>

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
                  >
                    <option value="">— Pilih Departemen —</option>
                    {DEPT_OPTIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {formErrors.dept && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block' }}>Departemen wajib dipilih</span>}
                </div>
              </div>

              {/* Judul Usulan */}
              <div>
                <label style={labelStyle}>
                  <Lightbulb size={13} style={{ color: '#64748b' }} />
                  Judul Usulan / Inovasi <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <input
                  id="saran-judul"
                  type="text"
                  placeholder="Contoh: Digitalisasi Form Roster Crew Lapangan Offshore"
                  value={formJudul}
                  onChange={e => { setFormJudul(e.target.value); setFormErrors(p => ({ ...p, judul: false })); }}
                  style={inputStyle(!!formErrors.judul)}
                />
                {formErrors.judul && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block' }}>Judul usulan wajib diisi</span>}
              </div>

              {/* Masalah / Kondisi Saat Ini */}
              <div>
                <label style={labelStyle}>
                  <AlertCircle size={13} style={{ color: '#dc2626' }} />
                  Kondisi Saat Ini / Kendala yang Dihadapi <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  id="saran-masalah"
                  placeholder="Jelaskan apa masalahnya, dampaknya terhadap waktu, biaya, kepatuhan HSE, atau kualitas pekerjaan saat ini..."
                  value={formMasalah}
                  onChange={e => { setFormMasalah(e.target.value); setFormErrors(p => ({ ...p, masalah: false })); }}
                  style={textareaStyle(!!formErrors.masalah)}
                />
                {formErrors.masalah && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block' }}>Kondisi saat ini wajib diisi</span>}
              </div>

              {/* Ide / Solusi Perbaikan */}
              <div>
                <label style={labelStyle}>
                  <MessageSquare size={13} style={{ color: '#16a34a' }} />
                  Ide Solusi & Rencana Perbaikan yang Diusulkan <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  id="saran-ide"
                  placeholder="Jelaskan usulan solusi Anda, bagaimana langkah implementasinya, dan manfaat yang diharapkan bagi perusahaan..."
                  value={formIde}
                  onChange={e => { setFormIde(e.target.value); setFormErrors(p => ({ ...p, ide: false })); }}
                  style={textareaStyle(!!formErrors.ide)}
                />
                {formErrors.ide && <span style={{ fontSize: 11, color: '#dc2626', marginTop: 4, display: 'block' }}>Ide perbaikan wajib diisi</span>}
              </div>

              {/* Upload Foto / Bukti Pendukung */}
              <div>
                <label style={labelStyle}>
                  <Camera size={13} style={{ color: '#64748b' }} />
                  Foto / Dokumen Pendukung <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8' }}>(opsional)</span>
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
                      padding: '24px 20px',
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
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>
                      Klik untuk upload foto kondisi lapangan / dokumen pendukung
                    </span>
                    <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                      Format yang didukung: JPG, PNG, WEBP
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
                      alt="Preview Foto"
                      style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                      padding: '16px 14px 12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <span style={{ fontSize: 12, color: '#ffffff', fontWeight: 600 }}>
                        {formFotoName}
                      </span>
                      <button
                        onClick={() => { setFormFoto(null); setFormFotoName(null); if (fileRef.current) fileRef.current.value = ''; }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          background: 'rgba(239,68,68,0.85)',
                          border: 'none', borderRadius: 6,
                          padding: '4px 10px', cursor: 'pointer',
                          color: '#ffffff', fontSize: 11, fontWeight: 600,
                        }}
                      >
                        <Trash2 size={12} /> Hapus
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Bar */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #f1f5f9',
              background: '#fafbfc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                * Data saran akan langsung tersimpan dan diteruskan ke Lead QMS.
              </span>
              <button
                id="btn-submit-saran"
                disabled={isSubmitting}
                onClick={handleSubmit}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '11px 32px', fontSize: 13.5, fontWeight: 700,
                  background: isSubmitting ? '#94a3b8' : '#0284c7',
                  color: '#ffffff', border: 'none', borderRadius: 10,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 10px rgba(2,132,199,0.28)',
                }}
              >
                <Send size={15} strokeWidth={2.2} />
                {isSubmitting ? 'Menyimpan...' : 'Kirim Usulan Saran'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB 2: RIWAYAT USULAN SAYA ── */}
        {activeTab === 'history' && (
          <div style={{
            background: '#ffffff',
            borderRadius: 14,
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 14px rgba(7,28,44,0.04)',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid #f1f5f9',
              background: '#fafbfc',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#071c2c' }}>
                  Daftar Usulan Saran Saya
                </h2>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b' }}>
                  Pantau status peninjauan dan tindak lanjut ide perbaikan yang telah Anda kirimkan.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('form')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 8,
                  background: '#0284c7', color: '#ffffff',
                  fontSize: 12.5, fontWeight: 700, border: 'none',
                  cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                <Send size={13} /> Tambah Saran Baru
              </button>
            </div>

            {staffSuggestions.length === 0 ? (
              <div style={{
                padding: '60px 20px', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', background: '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8',
                }}>
                  <Inbox size={24} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>
                    Belum Ada Saran yang Dikirim
                  </div>
                  <div style={{ fontSize: 12.5, color: '#94a3b8', marginTop: 4 }}>
                    Anda belum mengajukan ide atau saran perbaikan. Klik tombol di bawah untuk membuat usulan pertama Anda.
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('form')}
                  style={{
                    marginTop: 6,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '9px 18px', borderRadius: 8,
                    background: '#0284c7', color: '#ffffff',
                    fontSize: 12.5, fontWeight: 700, border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Send size={13} /> Buat Usulan Sekarang
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {staffSuggestions.map((s, idx) => {
                  const sStyle = STATUS_STYLES[s.status] || STATUS_STYLES['Baru'];
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedSuggestion(s)}
                      style={{
                        padding: '18px 24px',
                        borderBottom: idx < staffSuggestions.length - 1 ? '1px solid #f1f5f9' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        cursor: 'pointer',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 11.5, fontWeight: 800, color: '#0284c7',
                            fontFamily: 'var(--font-mono, monospace)',
                            background: '#e0f2fe', padding: '2px 8px', borderRadius: 6,
                          }}>
                            {s.id}
                          </span>
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            padding: '2px 10px', borderRadius: 99,
                            background: sStyle.bg, color: sStyle.text,
                            border: `1px solid ${sStyle.border}`,
                          }}>
                            {s.status} — {sStyle.desc}
                          </span>
                          <span style={{ fontSize: 11.5, color: '#94a3b8' }}>
                            {s.createdAt}
                          </span>
                        </div>
                        <div style={{
                          fontSize: 14.5, fontWeight: 700, color: '#071c2c',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {s.judul}
                        </div>
                        <div style={{
                          fontSize: 12.5, color: '#64748b',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {s.idePerbaikan}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedSuggestion(s); }}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '7px 12px', borderRadius: 8,
                            border: '1px solid #e2e8f0', background: '#ffffff',
                            color: '#0284c7', fontSize: 12, fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Eye size={13} /> Lihat Detail
                        </button>
                        <ChevronRight size={16} style={{ color: '#cbd5e1' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Detail Modal for Staff ── */}
        {selectedSuggestion && (
          <SuggestionDetailModal
            suggestion={selectedSuggestion}
            onClose={() => setSelectedSuggestion(null)}
            isAdmin={false}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        )}
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════════
     ADMIN VIEW (Saran & Ide Perbaikan Inbox)
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
          padding: 0, fontFamily: 'var(--font-body)', width: 'fit-content',
        }}
      >
        <ArrowLeft size={15} strokeWidth={2.2} />
        Kembali ke Dashboard
      </button>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        borderRadius: 14,
        border: '1px solid #e2e8f0',
        borderLeft: '4px solid #f59e0b',
        padding: '22px 26px',
        boxShadow: '0 2px 10px rgba(7,28,44,0.03)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#fffbeb', border: '1px solid #fde68a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#f59e0b', flexShrink: 0,
          }}>
            <Inbox size={24} strokeWidth={2.2} />
          </div>
          <div>
            <h1 style={{
              margin: 0, fontSize: 20, fontWeight: 800, color: '#071c2c',
              fontFamily: 'var(--font-display, inherit)',
            }}>
              Kotak Masuk Saran & Ide Perbaikan
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
              Evaluasi, verifikasi, dan tindak lanjuti usulan perbaikan dari seluruh departemen PT Taka Hydrocore Indonesia.
            </p>
          </div>
        </div>

        {/* Counter Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 10, padding: '8px 16px',
          }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#1d4ed8' }}>{statusCounts.Baru}</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#1e40af' }}>Saran Baru</span>
              <span style={{ fontSize: 10.5, color: '#60a5fa' }}>Perlu Ditinjau</span>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search + Filter Tabs */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10,
          padding: '8px 14px', flex: '1 1 260px', maxWidth: 380,
        }}>
          <Search size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
          <input
            id="search-saran"
            type="text"
            placeholder="Cari nama, departemen, ID, atau judul..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              border: 'none', outline: 'none', background: 'transparent',
              fontSize: 13, color: '#15212a', width: '100%',
              fontFamily: 'var(--font-body)',
            }}
          />
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {(['Semua', 'Baru', 'Ditinjau', 'Diterima', 'Ditolak'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={{
                padding: '7px 14px',
                fontSize: 12.5,
                fontWeight: filterStatus === status ? 700 : 500,
                borderRadius: 8,
                border: `1px solid ${filterStatus === status ? '#0284c7' : '#e2e8f0'}`,
                background: filterStatus === status ? '#e0f2fe' : '#ffffff',
                color: filterStatus === status ? '#0369a1' : '#64748b',
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {status}
              <span style={{
                fontSize: 11, fontWeight: 700,
                background: filterStatus === status ? '#0284c7' : '#f1f5f9',
                color: filterStatus === status ? '#ffffff' : '#64748b',
                padding: '1px 6px', borderRadius: 99,
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
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }} className="table-responsive-container">
          <div style={{ minWidth: '850px' }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '80px 1.2fr 160px 2.2fr 110px 90px 70px',
              padding: '14px 20px',
              borderBottom: '1px solid #f1f5f9',
              background: '#fafbfc',
              fontSize: 11, fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase' as const,
              letterSpacing: '0.05em',
            }}>
              <span>ID</span>
              <span>Nama Pengusul</span>
              <span>Departemen</span>
              <span>Judul Usulan</span>
              <span>Status</span>
              <span>Tanggal</span>
              <span style={{ textAlign: 'center' as const }}>Aksi</span>
            </div>

            {/* Table Body */}
            {filteredSuggestions.length === 0 ? (
              <div style={{
                padding: '56px 20px',
                textAlign: 'center' as const,
                color: '#94a3b8',
                fontSize: 13.5,
              }}>
                Tidak ada saran atau usulan perbaikan yang ditemukan.
              </div>
            ) : (
              filteredSuggestions.map((s, idx) => {
                const sStyle = STATUS_STYLES[s.status] || STATUS_STYLES['Baru'];
                return (
                  <div
                    key={s.id}
                    onClick={() => setSelectedSuggestion(s)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '80px 1.2fr 160px 2.2fr 110px 90px 70px',
                      padding: '15px 20px',
                      borderBottom: idx < filteredSuggestions.length - 1 ? '1px solid #f8fafc' : 'none',
                      alignItems: 'center',
                      fontSize: 13,
                      color: '#334155',
                      transition: 'background 0.12s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fafbfc')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontWeight: 800, fontSize: 12, color: '#0284c7', fontFamily: 'var(--font-mono, monospace)' }}>
                      {s.id}
                    </span>
                    <span style={{ fontWeight: 600, color: '#15212a' }}>{s.nama}</span>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{s.dept}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const, paddingRight: 10 }}>
                      {s.judul}
                    </span>
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
                        title="Lihat Detail & Tindak Lanjut"
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

      {/* ── Detail Modal for Admin ── */}
      {selectedSuggestion && (
        <SuggestionDetailModal
          suggestion={selectedSuggestion}
          onClose={() => setSelectedSuggestion(null)}
          isAdmin={true}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DETAIL MODAL COMPONENT (Admin & Staff)
   ═══════════════════════════════════════════════════════════════ */
interface DetailModalProps {
  suggestion: Suggestion;
  onClose: () => void;
  isAdmin: boolean;
  onStatusChange: (id: string, status: Suggestion['status']) => void;
  onDelete: (id: string) => void;
}

function SuggestionDetailModal({ suggestion, onClose, isAdmin, onStatusChange, onDelete }: DetailModalProps) {
  const sStyle = STATUS_STYLES[suggestion.status] || STATUS_STYLES['Baru'];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 8999,
          background: 'rgba(7,28,44,0.45)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease',
        }}
      />
      {/* Modal Card */}
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
        maxWidth: '92vw',
        maxHeight: '88vh',
        overflowY: 'auto' as const,
        animation: 'fadeIn 0.25s ease',
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid #f1f5f9',
          background: '#fafbfc',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: '#fffbeb', border: '1px solid #fde68a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#f59e0b',
            }}>
              <Lightbulb size={20} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#071c2c' }}>Detail Usulan Saran</div>
              <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>
                {suggestion.id}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#ffffff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#64748b',
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Metadata info */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 14,
            padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Nama Pengusul</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#15212a', marginTop: 3 }}>{suggestion.nama}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Departemen</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#15212a', marginTop: 3 }}>{suggestion.dept}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Tanggal Pengajuan</div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#15212a', marginTop: 3 }}>{suggestion.createdAt}</div>
            </div>
          </div>

          {/* Judul Saran */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>
              Judul Usulan
            </div>
            <div style={{
              fontSize: 15, fontWeight: 700, color: '#071c2c', lineHeight: 1.4,
              padding: '12px 16px', background: '#f8fafc', borderRadius: 10,
              border: '1px solid #f1f5f9',
            }}>
              {suggestion.judul}
            </div>
          </div>

          {/* Masalah / Kondisi Saat Ini */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#dc2626', marginBottom: 6, textTransform: 'uppercase' }}>
              Kondisi Saat Ini / Masalah
            </div>
            <div style={{
              fontSize: 13.5, color: '#334155', lineHeight: 1.6,
              padding: '14px 16px', background: '#fef2f2', borderRadius: 10,
              border: '1px solid #fecaca', whiteSpace: 'pre-wrap',
            }}>
              {suggestion.masalah}
            </div>
          </div>

          {/* Ide Perbaikan */}
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: '#16a34a', marginBottom: 6, textTransform: 'uppercase' }}>
              Ide Solusi / Perbaikan yang Diusulkan
            </div>
            <div style={{
              fontSize: 13.5, color: '#334155', lineHeight: 1.6,
              padding: '14px 16px', background: '#f0fdf4', borderRadius: 10,
              border: '1px solid #bbf7d0', whiteSpace: 'pre-wrap',
            }}>
              {suggestion.idePerbaikan}
            </div>
          </div>

          {/* Foto */}
          {suggestion.foto && (
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase' }}>
                Foto Pendukung
              </div>
              <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img
                  src={suggestion.foto}
                  alt="Foto bukti saran"
                  style={{ width: '100%', maxHeight: 300, objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          )}

          {/* Status & Review Controls */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 0 0', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: '#64748b' }}>Status Usulan:</span>
              <span style={{
                fontSize: 12, fontWeight: 800,
                padding: '4px 14px', borderRadius: 99,
                background: sStyle.bg, color: sStyle.text,
                border: `1px solid ${sStyle.border}`,
              }}>
                {suggestion.status}
              </span>
            </div>

            {/* Admin Action Buttons */}
            {isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {suggestion.status === 'Baru' && (
                  <button
                    onClick={() => onStatusChange(suggestion.id, 'Ditinjau')}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', fontSize: 12.5, fontWeight: 700,
                      background: '#fefce8', color: '#a16207',
                      border: '1px solid #fef08a', borderRadius: 8,
                      cursor: 'pointer', fontFamily: 'var(--font-body)',
                    }}
                  >
                    <Clock size={13} /> Tandai Ditinjau
                  </button>
                )}
                {(suggestion.status === 'Baru' || suggestion.status === 'Ditinjau') && (
                  <>
                    <button
                      onClick={() => onStatusChange(suggestion.id, 'Diterima')}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', fontSize: 12.5, fontWeight: 700,
                        background: '#0284c7', color: '#ffffff',
                        border: 'none', borderRadius: 8,
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}
                    >
                      <CheckCircle2 size={13} /> Terima Usulan
                    </button>
                    <button
                      onClick={() => onStatusChange(suggestion.id, 'Ditolak')}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        padding: '8px 16px', fontSize: 12.5, fontWeight: 700,
                        background: '#ffffff', color: '#dc2626',
                        border: '1px solid #fecaca', borderRadius: 8,
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}
                    >
                      <X size={13} /> Tolak Usulan
                    </button>
                  </>
                )}
                {suggestion.status === 'Diterima' && (
                  <button
                    onClick={() => onStatusChange(suggestion.id, 'Ditinjau')}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', fontSize: 12, fontWeight: 600,
                      background: '#f8fafc', color: '#64748b',
                      border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer',
                    }}
                  >
                    Ubah Status
                  </button>
                )}
                {suggestion.status === 'Ditolak' && (
                  <button
                    onClick={() => onStatusChange(suggestion.id, 'Ditinjau')}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', fontSize: 12, fontWeight: 600,
                      background: '#f8fafc', color: '#64748b',
                      border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer',
                    }}
                  >
                    Tinjau Ulang
                  </button>
                )}
                <button
                  onClick={() => onDelete(suggestion.id)}
                  title="Hapus Usulan"
                  style={{
                    width: 34, height: 34, borderRadius: 8,
                    border: '1px solid #fecaca', background: '#fef2f2',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#dc2626',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
