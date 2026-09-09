'use client';

import { useState } from 'react';
import { AUDIT_LOGS } from '@/lib/mock-data';

const TYPE_META: Record<string, { icon: string; bg: string; color: string; border: string }> = {
  create:      { icon: '📄', bg: 'var(--blue-bg)',    color: '#2563eb',        border: 'var(--blue-border)'  },
  approve:     { icon: '✅', bg: 'var(--green-bg)',   color: 'var(--green)',   border: 'var(--green-border)' },
  reject:      { icon: '✕',  bg: 'var(--red-bg)',     color: 'var(--red)',     border: 'var(--red-border)'   },
  publish:     { icon: '🚀', bg: 'rgba(7,28,44,0.06)', color: 'var(--navy)', border: 'rgba(7,28,44,0.14)'  },
  distribute:  { icon: '📤', bg: 'rgba(101,58,149,0.07)', color: '#7c3aed', border: 'rgba(101,58,149,0.2)' },
  acknowledge: { icon: '🔔', bg: 'var(--green-bg)',   color: 'var(--green)',   border: 'var(--green-border)' },
  revise:      { icon: '🔄', bg: 'var(--amber-bg)',   color: 'var(--amber)',   border: 'var(--amber-border)' },
  archive:     { icon: '📦', bg: 'var(--bg-elevated)', color: 'var(--ink-muted)', border: 'var(--border)' },
};

const ACTION_LABELS: Record<string, string> = {
  CREATE_DOCUMENT:      'Document Created',
  UPLOAD_FILE:          'File Uploaded',
  SUBMIT_DOCUMENT:      'Submitted for Review',
  APPROVE_DOCUMENT:     'Document Approved',
  REJECT_DOCUMENT:      'Document Rejected',
  PUBLISH_DOCUMENT:     'Document Published',
  DISTRIBUTE_DOCUMENT:  'Document Distributed',
  OPEN_DOCUMENT:        'Document Opened',
  ACKNOWLEDGE_DOCUMENT: 'Document Acknowledged',
  CREATE_REVISION:      'Revision Created',
  SUPERSEDE_DOCUMENT:   'Document Superseded',
  ARCHIVE_DOCUMENT:     'Document Archived',
};

const TYPE_OPTIONS = ['All', 'create', 'approve', 'reject', 'publish', 'distribute', 'acknowledge', 'revise', 'archive'];

export default function AuditTrailPage() {
  const [search, setSearch]         = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterUser, setFilterUser] = useState('All');

  const users = ['All', ...Array.from(new Set(AUDIT_LOGS.map(l => l.user)))];

  const filtered = AUDIT_LOGS.filter(l => {
    if (search) {
      const q = search.toLowerCase();
      if (!l.action.toLowerCase().includes(q) && !l.user.toLowerCase().includes(q) &&
          !l.entity.toLowerCase().includes(q) && !l.detail.toLowerCase().includes(q)) return false;
    }
    if (filterType !== 'All' && l.type !== filterType) return false;
    if (filterUser !== 'All' && l.user !== filterUser) return false;
    return true;
  });

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <div className="page-eyebrow">Compliance & Traceability</div>
          <h1 className="page-title">Audit Trail</h1>
          <p className="page-subtitle">Complete, immutable activity log for all document events and user actions.</p>
        </div>
        <div className="page-actions">
          <button id="export-audit" className="btn btn-secondary" onClick={() => alert('Exporting audit log as CSV…')}>
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid stat-grid-4" style={{ marginBottom: 'var(--sp-7)' }}>
        {[
          { label: 'Total Events',  value: AUDIT_LOGS.length,                                  color: 'var(--navy)' },
          { label: 'Approvals',     value: AUDIT_LOGS.filter(l => l.type === 'approve').length, color: 'var(--green)' },
          { label: 'Rejections',    value: AUDIT_LOGS.filter(l => l.type === 'reject').length,  color: 'var(--red)' },
          { label: 'Publications',  value: AUDIT_LOGS.filter(l => l.type === 'publish').length, color: '#2563eb' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-box">
          <span className="search-box-icon">🔎</span>
          <input
            id="audit-search"
            placeholder="Search actions, users, documents…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select id="audit-filter-type" className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t === 'All' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <select id="audit-filter-user" className="filter-select" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
          {users.map(u => <option key={u}>{u === 'All' ? 'All Users' : u}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: 12.5, color: 'var(--ink-muted)' }}>
          {filtered.length} events
        </span>
      </div>

      {/* Timeline */}
      <div className="card">
        <div className="card-body" style={{ padding: 'var(--sp-6)' }}>
          <div className="timeline">
            {filtered.map((log, i) => {
              const meta = TYPE_META[log.type] || TYPE_META.create;
              return (
                <div key={log.id} className="timeline-item">
                  <div className="timeline-track">
                    <div className="timeline-dot" style={{
                      background: meta.bg,
                      borderColor: meta.border,
                      border: `1.5px solid ${meta.border}`,
                      color: meta.color,
                    }}>
                      {meta.icon}
                    </div>
                    {i < filtered.length - 1 && <div className="timeline-line" />}
                  </div>

                  <div className="timeline-body">
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 'var(--sp-4)' }}>
                      <div style={{ flex: 1 }}>
                        {/* Action pill */}
                        <span style={{
                          display: 'inline-block',
                          fontSize: 10.5, fontWeight: 700, padding: '2px 9px',
                          borderRadius: 'var(--r-pill)',
                          background: meta.bg,
                          color: meta.color,
                          border: `1px solid ${meta.border}`,
                          fontFamily: 'var(--font-mono)',
                          letterSpacing: '0.04em',
                          marginBottom: 'var(--sp-2)',
                        }}>
                          {log.action}
                        </span>
                        <div className="timeline-event">
                          {ACTION_LABELS[log.action] || log.action}
                        </div>
                        <div className="timeline-meta">
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--navy)', fontSize: 12 }}>
                            {log.entity}
                          </span>
                          {' '}— {log.detail}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{log.user}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{log.role}</div>
                        <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--ink-faint)', marginTop: 2 }}>
                          {log.timestamp}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <div className="empty-title">No events found</div>
                <div className="empty-sub">Adjust your filters or search terms</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginTop: 'var(--sp-4)' }}>
        🔒 Audit logs are append-only and cannot be modified. This record is available for QHSSE compliance audits and regulatory review.
      </div>
    </div>
  );
}
