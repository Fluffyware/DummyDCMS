'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { APPROVAL_QUEUE, ApprovalItem } from '@/lib/mock-data';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Download,
  Trash2,
  Check,
  FileCheck,
  Eye,
  Lock,
  Sparkles,
} from 'lucide-react';

interface UploadedDoc {
  name: string;
  size: string;
  uploadedAt: string;
  signedBy: string;
}

export default function ApprovalPage() {
  const { user, login } = useAuth();
  const [selected, setSelected]         = useState<string | null>(null);
  const [comment, setComment]           = useState('');
  const [approved, setApproved]         = useState<string[]>([]);
  const [rejected, setRejected]         = useState<string[]>([]);
  const [showReject, setShowReject]     = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [queue, setQueue]               = useState<ApprovalItem[]>(APPROVAL_QUEUE);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc]     = useState<ApprovalItem | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedDoc>>({});
  const [isDragging, setIsDragging]     = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAdmin = user?.role === 'admin';
  const selectedDoc = queue.find(d => d.id === selected);

  // File Upload Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !selected) return;
    const file = e.target.files[0];
    saveUploadedFile(selected, file.name, `${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isAdmin || !selected) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      saveUploadedFile(selected, file.name, `${(file.size / (1024 * 1024)).toFixed(2)} MB`);
    }
  };

  const saveUploadedFile = (docId: string, name: string, size: string) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;
    setUploadedFiles(prev => ({
      ...prev,
      [docId]: {
        name,
        size,
        uploadedAt: `Hari ini, ${timeStr}`,
        signedBy: user?.name || 'Hendra Pratama (Admin Master)',
      },
    }));
  };

  const handleSimulateUpload = (doc: ApprovalItem) => {
    saveUploadedFile(
      doc.id,
      `${doc.docNumber}_${doc.revision}_SIGNED_AdminMaster.pdf`,
      '2.45 MB'
    );
  };

  const handleRemoveFile = (docId: string) => {
    setUploadedFiles(prev => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
  };

  // Approval Execution
  const handleApprove = () => {
    if (!selected || !isAdmin) return;
    const currentUploaded = uploadedFiles[selected];
    if (!currentUploaded) {
      alert('Unggah dokumen bertanda tangan Admin Master terlebih dahulu.');
      return;
    }

    const doc = queue.find(d => d.id === selected);
    setApproved(a => [...a, selected]);
    setQueue(q => q.filter(d => d.id !== selected));
    setSelected(null);
    setComment('');
    setActionNotice(
      `✓ Dokumen ${doc?.docNumber} (${doc?.title}) telah disetujui secara manual oleh Admin Master dengan lampiran berkas bertanda tangan '${currentUploaded.name}'. Status dokumen resmi berubah menjadi CURRENT.`
    );
    setTimeout(() => setActionNotice(null), 8000);
  };

  // Rejection Execution
  const handleReject = () => {
    if (!selected || !rejectReason.trim() || !isAdmin) return;
    const doc = queue.find(d => d.id === selected);
    setRejected(r => [...r, selected]);
    setQueue(q => q.filter(d => d.id !== selected));
    setSelected(null);
    setShowReject(false);
    setRejectReason('');
    setComment('');
    setActionNotice(`✕ Dokumen ${doc?.docNumber} telah ditolak dan dikembalikan ke Staff dengan catatan: "${rejectReason.trim()}".`);
    setTimeout(() => setActionNotice(null), 7000);
  };

  const handleDownloadDraft = (doc: ApprovalItem) => {
    const textContent = `PT TAKA HYDROCORE INDONESIA\nDOCUMENT DRAFT FOR SIGNATURE\n\nNomor Dokumen : ${doc.docNumber}\nJudul          : ${doc.title}\nRevisi         : ${doc.revision}\nDepartemen     : ${doc.department}\nDiajukan Oleh  : ${doc.submittedBy} (${doc.submittedAt})\n\n[DRAF DOKUMEN SISTEM MANAJEMEN QHSSE - MEMERLUKAN TANDA TANGAN ADMIN MASTER]\n\nHarap bubuhkan tanda tangan fisik/digital lalu unggah kembali berkas ini ke sistem DCMS untuk approval manual.`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.docNumber}_${doc.revision}_Draft_For_Signing.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-in">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
        style={{ display: 'none' }}
        onChange={handleFileSelect}
      />

      <div className="page-header">
        <div>
          <div className="page-eyebrow">Manual Approval Workflow · Admin Master Authority</div>
          <h1 className="page-title">Approval Queue</h1>
          <p className="page-subtitle">
            Verifikasi manual dan pengesahan berkas dokumen terkendali. Admin Master meninjau draf dokumen, membubuhkan tanda tangan fisik/digital, dan mengunggah berkas bertanda tangan sebelum dokumen disetujui.
          </p>
        </div>
      </div>



      {/* Success/Action Notice */}
      {actionNotice && (
        <div style={{
          background: '#071c2c',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: '10px',
          marginBottom: 'var(--sp-6)',
          fontSize: '13.5px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          animation: 'fadeIn 0.2s ease-out',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color="#4ade80" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="stat-grid stat-grid-4" style={{ marginBottom: 'var(--sp-7)' }}>
        {[
          { label: 'Menunggu Review Manual & TTD', value: queue.length,     color: 'var(--amber)' },
          { label: 'Disetujui Ber-TTD (Sesi Ini)', value: approved.length,  color: 'var(--green)' },
          { label: 'Ditolak (Perlu Revisi)',       value: rejected.length,  color: 'var(--red)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid-split-2">
        {/* Left Side: Queue list */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', color: 'var(--ink-faint)',
            marginBottom: 'var(--sp-3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span>Antrean Dokumen ({queue.length})</span>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--ink-muted)', textTransform: 'none' }}>
              Klik dokumen untuk mereview
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {queue.map(doc => {
              const hasFile = !!uploadedFiles[doc.id];
              return (
                <div
                  key={doc.id}
                  id={`approve-item-${doc.id}`}
                  className={`queue-item ${selected === doc.id ? 'active' : ''}`}
                  onClick={() => setSelected(doc.id === selected ? null : doc.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--sp-2)' }}>
                    <span className="doc-number">{doc.docNumber}</span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {hasFile && (
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--r-pill)',
                          background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0',
                          display: 'inline-flex', alignItems: 'center', gap: '3px',
                        }}>
                          <Check size={11} strokeWidth={3} /> TTD Diunggah
                        </span>
                      )}
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--r-pill)',
                        background: doc.daysWaiting > 5 ? 'var(--red-bg)' : 'var(--amber-bg)',
                        color: doc.daysWaiting > 5 ? 'var(--red)' : 'var(--amber)',
                        border: `1px solid ${doc.daysWaiting > 5 ? 'var(--red-border)' : 'var(--amber-border)'}`,
                      }}>
                        {doc.daysWaiting}d waiting
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy)', marginBottom: 4, lineHeight: 1.3 }}>
                    {doc.title}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                    {doc.type} · {doc.department} · {doc.revision}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--ink-faint)', marginTop: 4 }}>
                    Diajukan oleh: <strong>{doc.submittedBy}</strong> ({doc.submittedAt})
                  </div>
                </div>
              );
            })}
            {queue.length === 0 && (
              <div className="empty-state" style={{ padding: 'var(--sp-10) var(--sp-6)' }}>
                <div className="empty-icon">✅</div>
                <div className="empty-title">Semua Antrean Selesai</div>
                <div className="empty-sub">Tidak ada dokumen yang menunggu review atau approval manual saat ini.</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Manual Review & Upload Approval Panel */}
        {selectedDoc ? (
          <div className="card animate-in" style={{ overflow: 'hidden' }}>
            {/* Header */}
            <div className="card-header" style={{ padding: 'var(--sp-5) var(--sp-6)' }}>
              <div>
                <div className="doc-number" style={{ marginBottom: 4 }}>{selectedDoc.docNumber} · {selectedDoc.revision}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>
                  {selectedDoc.title}
                </div>
              </div>
              <span className="badge badge-pending" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }} />
                Menunggu TTD &amp; Approval Manual
              </span>
            </div>

            {/* Metadata grid */}
            <div
              className="grid-meta-3"
              style={{
                padding: 'var(--sp-4) var(--sp-6)',
                borderBottom: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
              }}
            >
              {[
                ['Diajukan Oleh', selectedDoc.submittedBy],
                ['Departemen', selectedDoc.department],
                ['Jenis Dokumen', selectedDoc.type],
                ['Tanggal Pengajuan', selectedDoc.submittedAt],
                ['Masa Tunggu', `${selectedDoc.daysWaiting} hari`],
                ['Nomor Revisi', selectedDoc.revision],
              ].map(([k, v]) => (
                <div key={k}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--ink-faint)', marginBottom: 3 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{v}</div>
                </div>
              ))}
            </div>

            <div style={{ padding: 'var(--sp-5) var(--sp-6)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-5)' }}>
              {/* Step 1: Review Original Draft */}
              <div>
                <div style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--ink-muted)',
                  marginBottom: 'var(--sp-3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#071c2c',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                  }}>1</span>
                  <span>Tinjau &amp; Unduh Draf Dokumen</span>
                </div>

                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  padding: '16px',
                  background: 'var(--bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '14px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: '8px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <FileText size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--navy)' }}>
                        {selectedDoc.docNumber}_{selectedDoc.revision}_Draft.pdf
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 2 }}>
                        Berkas draf asli diajukan oleh {selectedDoc.submittedBy} · 2.4 MB
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      id={`view-doc-${selectedDoc.id}`}
                      className="btn btn-secondary btn-sm"
                      onClick={() => setPreviewDoc(selectedDoc)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Eye size={14} />
                      <span>Lihat Pratinjau Draf</span>
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDownloadDraft(selectedDoc)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)' }}
                      title="Unduh draf untuk ditandatangani manual atau secara digital"
                    >
                      <Download size={14} />
                      <span>Unduh Draf (Untuk TTD)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Step 2: Kolom Upload Dokumen Bertanda Tangan (Signed Document) */}
              <div>
                <div style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--ink-muted)',
                  marginBottom: 'var(--sp-2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: uploadedFiles[selectedDoc.id] ? '#16a34a' : '#071c2c',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 700,
                    }}>2</span>
                    <span>Kolom Unggah Dokumen Bertanda Tangan (Admin Signed Document)</span>
                  </div>
                  {uploadedFiles[selectedDoc.id] && (
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#15803d',
                      background: '#dcfce7',
                      padding: '2px 8px',
                      borderRadius: '12px',
                    }}>
                      ✓ Berkas TTD Siap
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 'var(--sp-3)', paddingLeft: 4 }}>
                  Dokumen ini membutuhkan tanda tangan (TTD) Admin Master secara manual. Unggah berkas yang telah ditandatangani (.pdf, .docx, atau scan gambar) di bawah ini sebagai bukti verifikasi pengesahan.
                </div>

                {!isAdmin ? (
                  <div style={{
                    padding: '16px',
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: 'var(--r-lg)',
                    textAlign: 'center',
                  }}>
                    <Lock size={24} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#475569' }}>
                      Pengunggahan Terbatas — Hanya Admin Master
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                      Anda saat ini login sebagai Staff. Silakan beralih ke akun Admin Master untuk mengunggah dokumen bertanda tangan dan melakukan approval manual.
                    </div>
                  </div>
                ) : uploadedFiles[selectedDoc.id] ? (
                  /* Verified Uploaded Signed Document Card */
                  <div style={{
                    border: '1.5px solid #16a34a',
                    borderRadius: 'var(--r-lg)',
                    background: '#f0fdf4',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '14px',
                    boxShadow: '0 2px 10px rgba(22, 163, 74, 0.08)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: 46,
                        height: 46,
                        borderRadius: '10px',
                        background: '#dcfce7',
                        color: '#15803d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <ShieldCheck size={26} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#14532d' }}>
                            {uploadedFiles[selectedDoc.id].name}
                          </span>
                          <span style={{
                            fontSize: 10.5,
                            fontWeight: 700,
                            background: '#16a34a',
                            color: '#ffffff',
                            padding: '2px 7px',
                            borderRadius: '10px',
                          }}>
                            ✓ Dokumen Sah Ber-TTD
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: '#166534', marginTop: 3 }}>
                          Ukuran: <strong>{uploadedFiles[selectedDoc.id].size}</strong> · {uploadedFiles[selectedDoc.id].uploadedAt}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#15803d', marginTop: 2 }}>
                          Penandatangan: <strong>{uploadedFiles[selectedDoc.id].signedBy}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: 12 }}
                      >
                        Ganti Berkas
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(selectedDoc.id)}
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--red)', fontSize: 12 }}
                        title="Hapus berkas"
                      >
                        <Trash2 size={14} />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Dropzone / Upload Area */
                  <div>
                    <div
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      style={{
                        border: isDragging ? '2px dashed #2563eb' : '2px dashed #94a3b8',
                        borderRadius: 'var(--r-lg)',
                        padding: '28px 20px',
                        textAlign: 'center',
                        background: isDragging ? '#eff6ff' : '#fafafa',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <UploadCloud size={36} style={{ color: isDragging ? '#2563eb' : '#64748b', margin: '0 auto 10px' }} />
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
                        Klik di sini untuk memilih berkas dokumen yang telah ditandatangani
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginBottom: 8 }}>
                        atau seret &amp; lepaskan berkas bertanda tangan ke area ini (PDF, DOCX, JPG/PNG Scan maks 25MB)
                      </div>
                      <span className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <UploadCloud size={14} />
                        <span>Pilih Berkas Bertanda Tangan</span>
                      </span>
                    </div>

                    {/* Quick Simulation Option for Testing */}
                    <div style={{
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#f1f5f9',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: 11.5,
                      color: '#475569',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={14} color="#6366f1" />
                        <span>Ingin tes simulasi cepat tanpa upload file lokal?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSimulateUpload(selectedDoc)}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: '#071c2c',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <FileCheck size={13} color="#16a34a" />
                        <span>Lampirkan Contoh Berkas TTD ({selectedDoc.docNumber}_Signed_Admin.pdf)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Optional Reviewer / Approval Comments */}
              <div>
                <div style={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: 'var(--ink-muted)',
                  marginBottom: 'var(--sp-2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#071c2c',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                  }}>3</span>
                  <span>Catatan Pengesahan / Catatan Rilis <span style={{ textTransform: 'none', fontWeight: 400 }}>(Opsional)</span></span>
                </div>
                <textarea
                  id={`comment-${selectedDoc.id}`}
                  className="form-textarea"
                  placeholder="Tambahkan catatan khusus, nomor memo persetujuan, atau catatan distribusi..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  style={{ minHeight: 70 }}
                />
              </div>
            </div>

            {/* Bottom Action bar */}
            <div style={{
              padding: 'var(--sp-4) var(--sp-6)',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-elevated)',
              flexWrap: 'wrap',
              gap: '12px',
            }}>
              <div>
                {!uploadedFiles[selectedDoc.id] && (
                  <div className="alert alert-warning" style={{ padding: '8px 14px', fontSize: 12.5, margin: 0 }}>
                    ⚠️ Berkas bertanda tangan belum diunggah. Unggah dokumen ber-TTD Admin untuk mengesahkan.
                  </div>
                )}
                {uploadedFiles[selectedDoc.id] && isAdmin && (
                  <div className="alert alert-success" style={{ padding: '8px 14px', fontSize: 12.5, margin: 0 }}>
                    ✓ Berkas bertanda tangan siap — Klik &apos;Sahkan &amp; Setujui Dokumen&apos; untuk merilis status CURRENT.
                  </div>
                )}
                {uploadedFiles[selectedDoc.id] && !isAdmin && (
                  <div className="alert alert-warning" style={{ padding: '8px 14px', fontSize: 12.5, margin: 0 }}>
                    🔒 Hanya Admin Master yang memiliki otoritas untuk menandatangani dan menyetujui.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 'var(--sp-3)', marginLeft: 'auto', alignItems: 'center' }}>
                <button
                  id={`reject-${selectedDoc.id}`}
                  className="btn btn-danger"
                  onClick={() => setShowReject(true)}
                  disabled={!isAdmin}
                  title={!isAdmin ? 'Hanya Admin Master yang dapat menolak dokumen' : 'Kembalikan dokumen ke Staff'}
                >
                  Tolak / Revisi {!isAdmin && '(Admin Only)'}
                </button>
                <button
                  id={`approve-${selectedDoc.id}`}
                  className="btn btn-success"
                  onClick={handleApprove}
                  disabled={!uploadedFiles[selectedDoc.id] || !isAdmin}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    opacity: (!uploadedFiles[selectedDoc.id] || !isAdmin) ? 0.6 : 1,
                    boxShadow: uploadedFiles[selectedDoc.id] && isAdmin ? '0 4px 12px rgba(22, 163, 74, 0.3)' : 'none',
                  }}
                  title={
                    !isAdmin
                      ? 'Hanya Admin Master yang dapat menyetujui dokumen'
                      : !uploadedFiles[selectedDoc.id]
                      ? 'Silakan unggah dokumen bertanda tangan terlebih dahulu'
                      : 'Sahkan dokumen secara manual dan rilis sebagai CURRENT'
                  }
                >
                  <ShieldCheck size={16} />
                  <span>Sahkan &amp; Setujui Dokumen (Manual Approval)</span>
                  {!isAdmin && <span style={{ fontSize: 11, opacity: 0.8 }}>(Admin Only)</span>}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">✍️</div>
            <div className="empty-title">Pilih Dokumen untuk Direview &amp; Disahkan</div>
            <div className="empty-sub">
              Pilih salah satu dokumen dari antrean di sebelah kiri untuk meninjau draf, membubuhkan tanda tangan, dan mengunggah berkas pengesahan.
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showReject && selectedDoc && (
        <div className="modal-overlay" onClick={() => setShowReject(false)}>
          <div className="modal scale-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} color="var(--red)" />
                <span>Kembalikan Dokumen ke Staff (Rejection)</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowReject(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 13.5, color: 'var(--ink-light)', lineHeight: 1.6, marginBottom: 'var(--sp-4)', marginTop: 0 }}>
                Dokumen <strong>{selectedDoc.docNumber}</strong> ({selectedDoc.title}) akan dikembalikan kepada Staff (<strong>{selectedDoc.submittedBy}</strong>). Berikan rincian perbaikan yang wajib dilakukan sebelum dapat diajukan kembali.
              </p>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Alasan Penolakan / Catatan Perbaikan <span className="req">*</span></label>
                <textarea
                  id="reject-reason"
                  className="form-textarea"
                  placeholder="Jelaskan secara spesifik pasal atau bagian dokumen yang perlu diperbaiki oleh Staff..."
                  value={rejectReason}
                  onChange={e => setRejectReason(e.target.value)}
                  style={{ minHeight: 110 }}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setShowReject(false)}>Batal</button>
              <button id="confirm-reject" className="btn btn-danger" onClick={handleReject} disabled={!rejectReason.trim()}>
                Kirim Catatan Penolakan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Document Preview Modal */}
      {previewDoc && (
        <div className="modal-overlay" onClick={() => setPreviewDoc(null)}>
          <div
            className="modal scale-in"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: 840, width: '92vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
          >
            <div className="modal-header">
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-faint)', textTransform: 'uppercase' }}>
                  Pratinjau Draf Terkendali · {previewDoc.type}
                </div>
                <div className="modal-title" style={{ fontSize: 16, marginTop: 2 }}>
                  {previewDoc.docNumber} — {previewDoc.title}
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setPreviewDoc(null)}>✕</button>
            </div>

            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
              {/* Official Document Sheet Preview */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '32px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                position: 'relative',
              }}>
                {/* Watermark */}
                <div style={{
                  position: 'absolute',
                  top: '45%',
                  left: '50%',
                  transform: 'translate(-50%, -50%) rotate(-25deg)',
                  fontSize: 28,
                  fontWeight: 900,
                  color: 'rgba(239, 68, 68, 0.08)',
                  pointerEvents: 'none',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  width: '90%',
                  border: '4px dashed rgba(239, 68, 68, 0.12)',
                  padding: '24px',
                  borderRadius: '12px',
                }}>
                  DRAF RESMI BELUM SAH<br />
                  MEMERLUKAN TANDA TANGAN MANUAL ADMIN MASTER
                </div>

                {/* Company Header */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '2px solid #071c2c',
                  paddingBottom: '16px',
                  marginBottom: '20px',
                }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#071c2c', letterSpacing: '0.05em' }}>
                      PT TAKA HYDROCORE INDONESIA
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                      Integrated QHSSE Management System (ISO 9001 · ISO 14001 · ISO 45001)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 11, color: '#475569' }}>
                    <div><strong>Kode Dokumen:</strong> {previewDoc.docNumber}</div>
                    <div><strong>Revisi:</strong> {previewDoc.revision} | <strong>Status:</strong> Menunggu TTD</div>
                  </div>
                </div>

                {/* Document Metadata Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px', fontSize: 12.5 }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', background: '#f8fafc', fontWeight: 600, width: '25%', color: '#475569' }}>Judul Dokumen</td>
                      <td style={{ padding: '8px 10px', color: '#071c2c', fontWeight: 700 }}>{previewDoc.title}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', background: '#f8fafc', fontWeight: 600, color: '#475569' }}>Departemen Pemilik</td>
                      <td style={{ padding: '8px 10px', color: '#071c2c' }}>{previewDoc.department}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', background: '#f8fafc', fontWeight: 600, color: '#475569' }}>Disusun / Diajukan Oleh</td>
                      <td style={{ padding: '8px 10px', color: '#071c2c' }}>{previewDoc.submittedBy} ({previewDoc.submittedAt})</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 10px', background: '#f8fafc', fontWeight: 600, color: '#475569' }}>Klasifikasi Dokumen</td>
                      <td style={{ padding: '8px 10px', color: '#071c2c' }}>TERBATAS / INTERNAL COMPANY</td>
                    </tr>
                  </tbody>
                </table>

                {/* Document Body Sample */}
                <div style={{ color: '#334155', fontSize: 13, lineHeight: 1.7, marginBottom: '32px' }}>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#071c2c', marginBottom: 6 }}>1. TUJUAN &amp; RUANG LINGKUP</h4>
                  <p style={{ marginTop: 0, marginBottom: 12 }}>
                    Prosedur operasional standar ini mendefinisikan langkah kerja, mitigasi risiko bahaya, dan kriteria keselamatan pelaksanaan pekerjaan di lapangan PT Taka Hydrocore Indonesia sesuai kaidah keselamatan industri kelautan dan geoteknik.
                  </p>

                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#071c2c', marginBottom: 6 }}>2. TANGGUNG JAWAB &amp; OTORITAS</h4>
                  <p style={{ marginTop: 0, marginBottom: 12 }}>
                    Seluruh personil pelaksana, koordinator teknis, dan pengawas keselamatan wajib mematuhi ketentuan yang tertuang dalam dokumen terkendali ini setelah disahkan oleh Document Controller dan Admin Master.
                  </p>

                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: '#071c2c', marginBottom: 6 }}>3. KETENTUAN KHUSUS &amp; IDENTIFIKASI BAHAYA</h4>
                  <p style={{ marginTop: 0, marginBottom: 12 }}>
                    Pemeriksaan peralatan pra-operasi harian, pengisian Job Safety Analysis (JSA), pemakaian APD standar offshore, dan pelaporan near-miss wajib dijalankan secara disiplin tanpa kompromi.
                  </p>
                </div>

                {/* Signature Box Section */}
                <div style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  background: '#f8fafc',
                  padding: '16px',
                  marginTop: '24px',
                }}>
                  <div style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', color: '#475569', marginBottom: 12 }}>
                    KOLOM PENGESAHAN DOKUMEN RESMI
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                    <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px', background: '#ffffff' }}>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Disusun oleh (Staff):</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#071c2c', marginTop: 4 }}>{previewDoc.submittedBy}</div>
                      <div style={{ height: 45, display: 'flex', alignItems: 'center', color: '#059669', fontSize: 12, fontWeight: 600 }}>
                        ✓ Telah Diajukan Secara Digital
                      </div>
                      <div style={{ fontSize: 11, color: '#94a3b8', borderTop: '1px dashed #e2e8f0', paddingTop: 4 }}>
                        Tgl: {previewDoc.submittedAt}
                      </div>
                    </div>

                    <div style={{ border: '1.5px dashed #f59e0b', borderRadius: '6px', padding: '12px', background: '#fffbeb' }}>
                      <div style={{ fontSize: 11, color: '#92400e' }}>Disetujui &amp; Disahkan oleh (Admin Master):</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#92400e', marginTop: 4 }}>
                        {user?.role === 'admin' ? user?.name : 'Hendra Pratama'}
                      </div>
                      <div style={{ height: 45, display: 'flex', alignItems: 'center', color: '#d97706', fontSize: 12, fontWeight: 700 }}>
                        {uploadedFiles[previewDoc.id] ? '✓ Berkas TTD Siap Diunggah' : '✍ Menunggu TTD Fisik / Digital'}
                      </div>
                      <div style={{ fontSize: 11, color: '#b45309', borderTop: '1px dashed #fde68a', paddingTop: 4 }}>
                        Perlu tanda tangan manual sebelum upload
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>
                Dokumen: {previewDoc.docNumber} · {previewDoc.revision}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleDownloadDraft(previewDoc)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={15} />
                  <span>Unduh Draf Dokumen</span>
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setPreviewDoc(null)}>
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
