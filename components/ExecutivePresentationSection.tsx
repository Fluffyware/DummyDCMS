'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  THI_PRESENTATION_ELEMENTS,
  THI_PRESENTATION_FUNDAMENTALS,
  THI_MASTER_FRAMEWORK,
  ElementPresentation,
  FundamentalPresentation,
} from '@/lib/thi-presentation-data';

export type PresentationSelection = {
  type: 'element' | 'fundamental' | 'overview';
  id: string;
  num?: number;
};

interface Props {
  selection: PresentationSelection;
  onNavigate: (sel: PresentationSelection) => void;
}

export default function ExecutivePresentationSection({
  selection,
  onNavigate,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('mandate');

  // Reset tab to mandate whenever selection changes
  useEffect(() => {
    setActiveTab('mandate');
  }, [selection?.id, selection?.type]);

  const isElement = selection.type === 'element';
  const isFundamental = selection.type === 'fundamental';
  const isOverview = selection.type === 'overview';

  const elemData: ElementPresentation | undefined = isElement
    ? THI_PRESENTATION_ELEMENTS[selection.num || 1]
    : undefined;

  const fundData: FundamentalPresentation | undefined = isFundamental
    ? THI_PRESENTATION_FUNDAMENTALS[selection.id]
    : undefined;

  // Navigation handlers
  const handlePrevElement = () => {
    if (elemData) {
      const prevNum = elemData.num > 1 ? elemData.num - 1 : 10;
      onNavigate({ type: 'element', id: `elem-${prevNum}`, num: prevNum });
    }
  };

  const handleNextElement = () => {
    if (elemData) {
      const nextNum = elemData.num < 10 ? elemData.num + 1 : 1;
      onNavigate({ type: 'element', id: `elem-${nextNum}`, num: nextNum });
    }
  };

  return (
    <section
      id="presentation-showcase"
      key={`${selection.type}-${selection.id}`}
      className="card presentation-section-animate"
      style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* ── Top Header & Navigation Bar ── */}
      <div
        style={{
          padding: 'clamp(14px, 2vw, 22px) clamp(16px, 2.5vw, 32px)',
          borderBottom: '1px solid #e8eef5',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: 'var(--navy)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: '-0.02em',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(7,28,44,0.18)',
            }}
          >
            {isElement ? `E${elemData?.num}` : isFundamental ? 'FP' : 'IMS'}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--purple)',
                }}
              >
                {isElement
                  ? elemData?.badge
                  : isFundamental
                  ? `FUNDAMENTAL PILLAR · QUADRANT 0${fundData?.quadrant}`
                  : 'INTEGRATED MANAGEMENT SYSTEM'}
              </span>
              <span style={{ fontSize: 11, color: '#8fa0b0' }}>•</span>
              <span style={{ fontSize: 11, color: '#6b7a8d', fontWeight: 600 }}>
                PT Taka Hydrocore Indonesia
              </span>
              <span className="badge badge-current" style={{ fontSize: 9.5, marginLeft: 4 }}>
                Active Governance
              </span>
            </div>
            <h2
              style={{
                margin: '3px 0 0',
                fontSize: 'clamp(18px, 2.4vw, 24px)',
                fontWeight: 800,
                color: 'var(--navy)',
                fontFamily: 'var(--font-display)',
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
              }}
            >
              {isElement ? elemData?.label : isFundamental ? fundData?.name : THI_MASTER_FRAMEWORK.title}
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, marginLeft: 'auto' }}>
          {isElement && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#f0f5fa',
                borderRadius: '8px',
                padding: '3px',
                border: '1px solid #dce6ee',
              }}
            >
              <button
                onClick={handlePrevElement}
                title="Previous Element (← Arrow)"
                className="btn btn-ghost btn-xs"
                style={{ fontSize: 12, padding: '4px 10px', color: 'var(--navy)', fontWeight: 600 }}
              >
                ← Prev
              </button>
              <span style={{ fontSize: 11.5, color: '#6b7a8d', padding: '0 6px', fontWeight: 700 }}>
                {elemData?.num} / 10
              </span>
              <button
                onClick={handleNextElement}
                title="Next Element (→ Arrow)"
                className="btn btn-ghost btn-xs"
                style={{ fontSize: 12, padding: '4px 10px', color: 'var(--navy)', fontWeight: 600 }}
              >
                Next →
              </button>
            </div>
          )}

          <button
            onClick={() => window.print()}
            title="Print / Save Section"
            className="btn btn-secondary btn-sm"
            style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>🖨️</span>
            <span>Print Section</span>
          </button>
        </div>
      </div>

      {/* ── Subtitle / Tagline Strip ── */}
      <div
        style={{
          background: '#f8fafc',
          padding: '10px clamp(16px, 2.5vw, 32px)',
          borderBottom: '1px solid #e8eef5',
          fontSize: 13,
          color: '#4a5568',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span style={{ fontWeight: 500 }}>
          {isElement
            ? elemData?.tagline
            : isFundamental
            ? fundData?.subtitle
            : THI_MASTER_FRAMEWORK.subtitle}
        </span>
        <span style={{ fontSize: 11, color: '#8fa0b0', fontFamily: 'var(--font-mono)' }}>
          CONFIDENTIAL · INTERNAL QHSSE GOVERNANCE
        </span>
      </div>

      {/* ── Presentation Tabs (Horizontal Touch Scroll) ── */}
      <div className="modal-tabs-scroll" style={{ padding: '0 clamp(16px, 2.5vw, 32px)' }}>
        {isElement && (
          <>
            {[
              { id: 'mandate', label: '📋 Executive Mandate & RACI' },
              { id: 'operations', label: '⚓ Marine & Geotechnical Execution' },
              { id: 'risks', label: '🛡️ Risk & Safeguard Matrix' },
              { id: 'compliance', label: '📜 ISO & Regulatory Compliance' },
              { id: 'kpis', label: '📊 KPIs & Target Benchmarks' },
              { id: 'docs', label: '📁 Controlled Documents' },
            ].map(t => (
              <button
                key={t.id}
                className="modal-tab-btn"
                onClick={() => setActiveTab(t.id)}
                style={{
                  fontWeight: activeTab === t.id ? 700 : 500,
                  color: activeTab === t.id ? 'var(--navy)' : 'var(--ink-muted)',
                  borderBottom: activeTab === t.id ? '2.5px solid var(--navy)' : '2.5px solid transparent',
                  padding: '14px 16px',
                  fontSize: 13.5,
                }}
              >
                {t.label}
              </button>
            ))}
          </>
        )}

        {isFundamental && (
          <>
            {[
              { id: 'mandate', label: '🏛️ Pillar Charter & PDCA' },
              { id: 'operations', label: '⚓ Offshore Fleet Governance' },
              { id: 'elements', label: '🔗 Covered Operational Elements' },
              { id: 'compliance', label: '📜 Standards & Compliance' },
            ].map(t => (
              <button
                key={t.id}
                className="modal-tab-btn"
                onClick={() => setActiveTab(t.id)}
                style={{
                  fontWeight: activeTab === t.id ? 700 : 500,
                  color: activeTab === t.id ? 'var(--navy)' : 'var(--ink-muted)',
                  borderBottom: activeTab === t.id ? '2.5px solid var(--navy)' : '2.5px solid transparent',
                  padding: '14px 16px',
                  fontSize: 13.5,
                }}
              >
                {t.label}
              </button>
            ))}
          </>
        )}

        {isOverview && (
          <>
            {[
              { id: 'mandate', label: '🌟 Framework Architecture' },
              { id: 'fourPillars', label: '🏛️ The 4 Pillars' },
              { id: 'accreditations', label: '📜 Certifications & Accreditations' },
              { id: 'milestones', label: '⚓ Fleet Safety Milestones' },
            ].map(t => (
              <button
                key={t.id}
                className="modal-tab-btn"
                onClick={() => setActiveTab(t.id)}
                style={{
                  fontWeight: activeTab === t.id ? 700 : 500,
                  color: activeTab === t.id ? 'var(--navy)' : 'var(--ink-muted)',
                  borderBottom: activeTab === t.id ? '2.5px solid var(--navy)' : '2.5px solid transparent',
                  padding: '14px 16px',
                  fontSize: 13.5,
                }}
              >
                {t.label}
              </button>
            ))}
          </>
        )}
      </div>

      {/* ── Tab Body Content ── */}
      <div
        key={activeTab}
        className="animate-in"
        style={{
          padding: 'clamp(20px, 3vw, 32px)',
          background: '#ffffff',
        }}
      >
        {/* ============================================================
            CASE 1: ELEMENT TABS
            ============================================================ */}
        {isElement && elemData && (
          <>
            {/* TAB 1: EXECUTIVE MANDATE & RACI */}
            {activeTab === 'mandate' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #dce6ee',
                    borderRadius: '12px',
                    padding: '24px',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--navy)',
                      marginBottom: '8px',
                    }}
                  >
                    Executive Corporate Mandate
                  </div>
                  <p
                    style={{
                      fontSize: 15,
                      lineHeight: 1.7,
                      color: '#2c3e50',
                      margin: 0,
                    }}
                  >
                    {elemData.executiveMandate}
                  </p>
                </div>

                {/* RACI Matrix */}
                <div>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: 'var(--navy)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '12px',
                    }}
                  >
                    Organizational RACI Governance Matrix
                  </h4>
                  <div className="modal-table-scroll">
                    <table style={{ width: '100%', minWidth: '540px', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr style={{ background: '#f0f5fa', borderBottom: '1px solid #dce6ee' }}>
                          <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#071c2c', width: '220px' }}>
                            Organizational Role
                          </th>
                          <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 700, color: '#071c2c', width: '110px' }}>
                            RACI Level
                          </th>
                          <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#071c2c' }}>
                            Operational Responsibility & Accountability
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {elemData.raciMatrix.map((r, i) => (
                          <tr
                            key={i}
                            style={{
                              borderBottom: i < elemData.raciMatrix.length - 1 ? '1px solid #e8eef5' : 'none',
                              background: i % 2 === 0 ? '#ffffff' : '#fafcfd',
                            }}
                          >
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#071c2c' }}>
                              {r.role}
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '3px 8px',
                                  borderRadius: '4px',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  background:
                                    r.raci === 'Accountable'
                                      ? '#071c2c'
                                      : r.raci === 'Responsible'
                                      ? '#1a4a6e'
                                      : '#e8eef5',
                                  color:
                                    r.raci === 'Accountable' || r.raci === 'Responsible'
                                      ? '#ffffff'
                                      : '#2c3e50',
                                }}
                              >
                                {r.raci}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', color: '#4a5568', lineHeight: 1.5 }}>
                              {r.duty}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: MARINE & GEOTECHNICAL EXECUTION */}
            {activeTab === 'operations' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ border: '1px solid #dce6ee', borderRadius: '12px', padding: '24px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: 22 }}>⚓</span>
                    <h4
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: 'var(--navy)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        margin: 0,
                      }}
                    >
                      Offshore Marine & Geotechnical Execution Protocols
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
                    {elemData.offshoreExecution}
                  </p>
                </div>

                <div style={{ border: '1px solid #dce6ee', borderRadius: '12px', padding: '24px', background: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: 22 }}>🔬</span>
                    <h4
                      style={{
                        fontSize: 15,
                        fontWeight: 800,
                        color: 'var(--navy)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        margin: 0,
                      }}
                    >
                      Geotechnical Laboratory & Mobilization Base Standards
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
                    {elemData.laboratoryAndBase}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 3: RISK & SAFEGUARD MATRIX */}
            {activeTab === 'risks' && (
              <div>
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: 'var(--navy)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '12px',
                  }}
                >
                  Hazard Scenarios & Verified Safeguards
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {elemData.riskControls?.map((rc, i) => (
                    <div
                      key={i}
                      style={{
                        border: '1px solid #dce6ee',
                        borderRadius: '10px',
                        padding: '16px 20px',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '16px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '260px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: 10,
                              fontWeight: 700,
                              background: rc.barrierLevel === 'Preventive' ? '#eff6ff' : '#fffbeb',
                              color: rc.barrierLevel === 'Preventive' ? '#1d4ed8' : '#b45309',
                              border: `1px solid ${rc.barrierLevel === 'Preventive' ? '#bfdbfe' : '#fde68a'}`,
                            }}
                          >
                            {rc.barrierLevel} Barrier
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>
                            Scenario {i + 1}
                          </span>
                        </div>
                        <div style={{ fontSize: 14, color: '#1f2937', fontWeight: 600, marginBottom: '6px' }}>
                          {rc.hazardScenario}
                        </div>
                        <div style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.5 }}>
                          <strong>Engineered Safeguard:</strong> {rc.safeguardMethod}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: '#6b7a8d', fontWeight: 700, textTransform: 'uppercase' }}>
                          Residual Risk
                        </div>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: 4,
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: 11,
                            fontWeight: 700,
                            background: rc.residualRisk === 'Low' ? '#f0fdf4' : '#fffbeb',
                            color: rc.residualRisk === 'Low' ? '#15803d' : '#b45309',
                            border: `1px solid ${rc.residualRisk === 'Low' ? '#bbf7d0' : '#fde68a'}`,
                          }}
                        >
                          ● {rc.residualRisk}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: ISO & REGULATORY COMPLIANCE */}
            {activeTab === 'compliance' && (
              <div>
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: 'var(--navy)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '12px',
                  }}
                >
                  International Maritime & Quality Standard Mapping
                </h4>
                <div className="modal-table-scroll">
                  <table style={{ width: '100%', minWidth: '540px', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f0f5fa', borderBottom: '1px solid #dce6ee' }}>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#071c2c', width: '200px' }}>
                          Standard Framework
                        </th>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#071c2c', width: '160px' }}>
                          Specific Clause
                        </th>
                        <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 700, color: '#071c2c' }}>
                          Statutory & Quality Requirement
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {elemData.regulatoryClauses?.map((c, i) => (
                        <tr
                          key={i}
                          style={{
                            borderBottom: i < (elemData.regulatoryClauses?.length ?? 0) - 1 ? '1px solid #e8eef5' : 'none',
                            background: i % 2 === 0 ? '#ffffff' : '#fafcfd',
                          }}
                        >
                          <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--navy)' }}>
                            {c.framework}
                          </td>
                          <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--purple)' }}>
                            {c.clause}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#4a5568', lineHeight: 1.5 }}>
                            {c.requirement}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 5: KPIS & BENCHMARKS */}
            {activeTab === 'kpis' && (
              <div>
                <h4
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: 'var(--navy)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '12px',
                  }}
                >
                  Performance Metrics & Executive Benchmarks
                </h4>
                <div className="grid-kpi-3">
                  {elemData.kpiMetrics?.map((kpi, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #dce6ee',
                        borderRadius: '12px',
                        padding: '20px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#6b7a8d', textTransform: 'uppercase' }}>
                          {kpi.name}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: kpi.status === 'EXCEEDED' ? '#f0fdf4' : '#eff6ff',
                            color: kpi.status === 'EXCEEDED' ? '#15803d' : '#1d4ed8',
                            border: `1px solid ${kpi.status === 'EXCEEDED' ? '#bbf7d0' : '#bfdbfe'}`,
                          }}
                        >
                          {kpi.status}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: 'var(--navy)',
                          margin: '6px 0 2px',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {kpi.target}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#8fa0b0', marginBottom: '8px' }}>
                        Actual YTD: <strong>{kpi.actualYTD}</strong>
                      </div>
                      <div style={{ fontSize: 12.5, color: '#2c3e50', lineHeight: 1.4 }}>
                        Benchmark: {kpi.benchmark}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: CONTROLLED DOCUMENTS */}
            {activeTab === 'docs' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: 'var(--navy)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      margin: 0,
                    }}
                  >
                    Controlled Documents in DMS
                  </h4>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => router.push('/dashboard/masterlist')}
                  >
                    View in Masterlist →
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {elemData.controlledDocs?.map(doc => (
                    <div
                      key={doc.number}
                      onClick={() => router.push('/dashboard/masterlist')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: '#ffffff',
                        border: '1px solid #dce6ee',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--navy)';
                        e.currentTarget.style.background = 'var(--bg-card-hover)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = '#dce6ee';
                        e.currentTarget.style.background = '#ffffff';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="doc-number">{doc.number}</span>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy)' }}>
                          {doc.title}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span className="badge badge-current" style={{ fontSize: 10 }}>
                          {doc.revision}
                        </span>
                        <span style={{ fontSize: 11, color: '#8fa0b0' }}>{doc.type}</span>
                        <span style={{ color: '#071c2c', fontWeight: 700, fontSize: 12 }}>↗</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================
            CASE 2: FUNDAMENTAL PILLAR TABS
            ============================================================ */}
        {isFundamental && fundData && (
          <>
            {activeTab === 'mandate' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #dce6ee', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--purple)', marginBottom: '8px' }}>
                    Strategic Charter Statement
                  </div>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: '#2c3e50', margin: 0 }}>
                    {fundData.charterStatement}
                  </p>
                </div>

                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8', marginBottom: '6px' }}>
                    PDCA Cycle Classification: {fundData.pdcaPhase}
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#1e3a8a', margin: 0 }}>
                    {fundData.coreGovernance}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'operations' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #dce6ee', borderRadius: '12px', padding: '20px' }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Marine Geophysical & Geotechnical Application
                  </h4>
                  <p style={{ margin: 0, fontSize: 13.5, color: '#2c3e50', lineHeight: 1.65 }}>
                    {fundData.marineApplication}
                  </p>
                </div>

                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Strategic Deliverables & Milestones
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {fundData.strategicDeliverables?.map((del, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '12px 16px',
                          background: '#ffffff',
                          border: '1px solid #dce6ee',
                          borderRadius: '8px',
                          fontSize: 13,
                          color: '#1f2937',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <span style={{ color: 'var(--purple)', fontWeight: 800 }}>✓</span>
                        <span>{del}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'elements' && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Operational Elements Governed by {fundData.name}
                </h4>
                <div className="grid-modal-2">
                  {fundData.coveredElementNums?.map(num => {
                    const el = THI_PRESENTATION_ELEMENTS[num];
                    if (!el) return null;
                    return (
                      <div
                        key={num}
                        onClick={() => onNavigate({ type: 'element', id: el.id, num: el.num })}
                        style={{
                          border: '1px solid #dce6ee',
                          borderRadius: '12px',
                          padding: '18px',
                          background: '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--navy)')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#dce6ee')}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple)' }}>
                            ELEMENT {el.num}
                          </span>
                          <span style={{ fontSize: 12, color: 'var(--navy)', fontWeight: 700 }}>→ Explore</span>
                        </div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy)', marginBottom: '6px' }}>
                          {el.label}
                        </div>
                        <div style={{ fontSize: 12.5, color: '#6b7a8d', lineHeight: 1.5 }}>
                          {el.tagline}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'compliance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="grid-kpi-3">
                  {fundData.fleetMetrics?.map((m, i) => (
                    <div
                      key={i}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #dce6ee',
                        borderRadius: '12px',
                        padding: '18px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#6b7a8d', fontWeight: 600, textTransform: 'uppercase' }}>
                        {m.label}
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--navy)', margin: '4px 0 2px' }}>
                        {m.value}
                      </div>
                      <div style={{ fontSize: 11, color: '#8fa0b0' }}>{m.note}</div>
                    </div>
                  ))}
                </div>

                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Governing Standards & Frameworks
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {fundData.governingStandards?.map((reg, i) => (
                      <span
                        key={i}
                        style={{
                          padding: '6px 14px',
                          background: '#f0f5fa',
                          border: '1px solid #c8d8e5',
                          borderRadius: '999px',
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'var(--navy)',
                        }}
                      >
                        {reg}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================
            CASE 3: OVERVIEW MASTER FRAMEWORK TABS
            ============================================================ */}
        {isOverview && (
          <>
            {activeTab === 'mandate' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #dce6ee', borderRadius: '12px', padding: '24px' }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 800, color: 'var(--navy)' }}>
                    Integrated Management System Mandate
                  </h3>
                  <p style={{ fontSize: 15, lineHeight: 1.75, color: '#2c3e50', margin: 0 }}>
                    {THI_MASTER_FRAMEWORK.corporateMandate}
                  </p>
                </div>

                <div className="grid-modal-4">
                  {THI_MASTER_FRAMEWORK.fleetStatistics.map((stat, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '18px',
                        background: '#ffffff',
                        border: '1px solid #dce6ee',
                        borderRadius: '10px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7a8d', textTransform: 'uppercase' }}>
                        {stat.label}
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--navy)', margin: '4px 0 2px' }}>
                        {stat.value}
                      </div>
                      <div style={{ fontSize: 11, color: '#8fa0b0' }}>{stat.sub}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'fourPillars' && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '14px' }}>
                  The 4 Fundamental Pillars Architecture
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {THI_MASTER_FRAMEWORK.fourPillarsOverview.map((p, i) => (
                    <div
                      key={i}
                      style={{
                        border: '1px solid #dce6ee',
                        borderRadius: '12px',
                        padding: '18px 22px',
                        background: '#ffffff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy)' }}>
                            {p.pillar}
                          </span>
                          <span className="badge badge-draft" style={{ fontSize: 10 }}>
                            {p.quadrant}
                          </span>
                          <span className="badge badge-current" style={{ fontSize: 10 }}>
                            {p.elements}
                          </span>
                        </div>
                        <div style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>
                          {p.focus}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#8fa0b0', marginTop: 2 }}>
                          Governing Body: {p.governingBody}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'accreditations' && (
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', marginBottom: '14px' }}>
                  Formal Corporate Accreditations & Statutory Regimes
                </h4>
                <div className="grid-modal-2">
                  {THI_MASTER_FRAMEWORK.certifiedAccreditations.map((acc, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '14px 18px',
                        background: '#f8fafc',
                        border: '1px solid #dce6ee',
                        borderRadius: '10px',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--navy)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span style={{ color: '#16a34a', fontSize: 16 }}>🛡️</span>
                      <span>{acc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'milestones' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '24px', background: 'var(--navy)', color: '#ffffff', borderRadius: '12px' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9bb4cc' }}>
                    Corporate Milestone
                  </div>
                  <h3 style={{ margin: '6px 0 10px', fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
                    Over 2.4 Million Safe Offshore Geotechnical Man-Hours
                  </h3>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6, color: '#dce6ee' }}>
                    Delivered across offshore Java, Makassar Strait, Natuna Sea, and deepwater Papua with Zero Lost Time Injuries (0 LTI).
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Section Footer ── */}
      <div
        style={{
          padding: '14px clamp(16px, 2.5vw, 32px)',
          borderTop: '1px solid #e8eef5',
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: 12, color: '#6b7a8d' }}>
          {isElement ? (
            <span>
              Tip: Click any segment on the radial wheel above, or use <strong>← / →</strong> buttons to explore Elements 1 to 10.
            </span>
          ) : (
            <span>PT Taka Hydrocore Indonesia · Unified QHSSE Management System</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => router.push('/dashboard/masterlist')}
          >
            Browse Controlled Documents Registry →
          </button>
        </div>
      </div>
    </section>
  );
}
