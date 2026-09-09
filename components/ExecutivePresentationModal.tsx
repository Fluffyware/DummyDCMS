'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Printer, X, Ship, FlaskConical, ShieldCheck, Check } from 'lucide-react';
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
  isOpen: boolean;
  onClose: () => void;
  selection: PresentationSelection | null;
  onNavigate: (sel: PresentationSelection) => void;
}

export default function ExecutivePresentationModal({
  isOpen,
  onClose,
  selection,
  onNavigate,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('mandate');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset tab when selection changes
  useEffect(() => {
    setActiveTab('mandate');
  }, [selection?.id, selection?.type]);

  // Keyboard navigation: Escape closes, Left/Right navigates elements
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && selection?.type === 'element') {
        const nextNum = selection.num && selection.num < 8 ? selection.num + 1 : 1;
        onNavigate({ type: 'element', id: `elem-${nextNum}`, num: nextNum });
      } else if (e.key === 'ArrowLeft' && selection?.type === 'element') {
        const prevNum = selection.num && selection.num > 1 ? selection.num - 1 : 8;
        onNavigate({ type: 'element', id: `elem-${prevNum}`, num: prevNum });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selection, onClose, onNavigate]);

  if (!isOpen || !selection || !mounted || typeof document === 'undefined' || !document.body) {
    return null;
  }

  const isElement = selection.type === 'element';
  const isFundamental = selection.type === 'fundamental';
  const isOverview = selection.type === 'overview';

  const elemData: ElementPresentation | undefined = isElement
    ? THI_PRESENTATION_ELEMENTS[selection.num || 1]
    : undefined;

  const fundData: FundamentalPresentation | undefined = isFundamental
    ? THI_PRESENTATION_FUNDAMENTALS[selection.id]
    : undefined;

  // Navigation handlers for stepping through elements
  const handlePrevElement = () => {
    if (elemData) {
      const prevNum = elemData.num > 1 ? elemData.num - 1 : 8;
      onNavigate({ type: 'element', id: `elem-${prevNum}`, num: prevNum });
    }
  };

  const handleNextElement = () => {
    if (elemData) {
      const nextNum = elemData.num < 8 ? elemData.num + 1 : 1;
      onNavigate({ type: 'element', id: `elem-${nextNum}`, num: nextNum });
    }
  };

  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        background: 'rgba(7, 28, 44, 0.72)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(8px, 2vw, 20px)',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1080px',
          maxHeight: '94vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 72px rgba(7, 28, 44, 0.28)',
          border: '1px solid #dce6ee',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Top Header & Navigation Bar ── */}
        <div
          style={{
            padding: 'clamp(12px, 2vw, 20px) clamp(14px, 2.5vw, 28px)',
            borderBottom: '1px solid #e8eef5',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '10px',
                background: '#071c2c',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: 17,
                letterSpacing: '-0.02em',
                flexShrink: 0,
              }}
            >
              {isElement ? `E${elemData?.num}` : isFundamental ? 'FP' : 'IMS'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: '#30256f',
                  }}
                >
                  {isElement
                    ? elemData?.badge
                    : isFundamental
                    ? `FUNDAMENTAL PILLAR · QUADRANT 0${fundData?.quadrant}`
                    : 'INTEGRATED MANAGEMENT SYSTEM'}
                </span>
                <span style={{ fontSize: 11, color: '#8fa0b0' }}>•</span>
                <span style={{ fontSize: 10.5, color: '#6b7a8d', fontWeight: 600 }}>
                  PT Taka Hydrocore Indonesia
                </span>
              </div>
              <h2
                style={{
                  margin: '2px 0 0',
                  fontSize: 'clamp(16px, 2.5vw, 21px)',
                  fontWeight: 800,
                  color: '#071c2c',
                  fontFamily: 'var(--font-display)',
                  lineHeight: 1.25,
                }}
              >
                {isElement ? elemData?.label : isFundamental ? fundData?.name : THI_MASTER_FRAMEWORK.title}
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: 'auto' }}>
            {isElement && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#f0f5fa',
                  borderRadius: '8px',
                  padding: '2px',
                  border: '1px solid #dce6ee',
                  marginRight: 4,
                }}
              >
                <button
                  onClick={handlePrevElement}
                  title="Previous Element (← Arrow)"
                  className="btn btn-ghost btn-xs"
                  style={{ fontSize: 11.5, padding: '4px 8px', color: '#071c2c' }}
                >
                  ← Prev
                </button>
                <span style={{ fontSize: 11, color: '#8fa0b0', padding: '0 3px' }}>
                  {elemData?.num} / 8
                </span>
                <button
                  onClick={handleNextElement}
                  title="Next Element (→ Arrow)"
                  className="btn btn-ghost btn-xs"
                  style={{ fontSize: 11.5, padding: '4px 8px', color: '#071c2c' }}
                >
                  Next →
                </button>
              </div>
            )}

            <button
              onClick={() => window.print()}
              title="Print / Save PDF Presentation"
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 11.5, padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
            >
              <Printer size={13} />
              <span className="desktop-only" style={{ display: 'inline' }}>Print View</span>
            </button>

            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm"
              style={{
                fontSize: 16,
                padding: '6px 10px',
                color: '#6b7a8d',
                borderRadius: '8px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Close Presentation (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Subtitle / Tagline Strip ── */}
        <div
          style={{
            background: '#f8fafc',
            padding: '8px clamp(14px, 2.5vw, 28px)',
            borderBottom: '1px solid #e8eef5',
            fontSize: 12.5,
            color: '#4a5568',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span>
            {isElement
              ? elemData?.tagline
              : isFundamental
              ? fundData?.subtitle
              : THI_MASTER_FRAMEWORK.subtitle}
          </span>
          <span style={{ fontSize: 10.5, color: '#8fa0b0', fontFamily: 'var(--font-mono)' }}>
            CONFIDENTIAL · INTERNAL QHSSE GOVERNANCE
          </span>
        </div>

        {/* ── Presentation Tabs (Horizontal Touch Scroll) ── */}
        <div className="modal-tabs-scroll">
          {isElement && (
            <>
              {[
                { id: 'mandate', label: 'Executive Mandate' },
                { id: 'operations', label: 'Marine & Geotechnical Execution' },
                { id: 'risks', label: 'Risk & Safeguard Matrix' },
                { id: 'compliance', label: 'ISO & Regulatory Compliance' },
                { id: 'kpis', label: 'KPIs & Target Benchmarks' },
                { id: 'docs', label: 'Controlled Documents' },
              ].map(t => (
                <button
                  key={t.id}
                  className="modal-tab-btn"
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    fontWeight: activeTab === t.id ? 700 : 500,
                    color: activeTab === t.id ? '#071c2c' : '#6b7a8d',
                    borderBottom: activeTab === t.id ? '2.5px solid #071c2c' : '2.5px solid transparent',
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
                { id: 'mandate', label: 'Pillar Charter & PDCA' },
                { id: 'operations', label: 'Offshore Fleet Governance' },
                { id: 'elements', label: 'Covered Operational Elements' },
                { id: 'compliance', label: 'Standards & Compliance' },
              ].map(t => (
                <button
                  key={t.id}
                  className="modal-tab-btn"
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    fontWeight: activeTab === t.id ? 700 : 500,
                    color: activeTab === t.id ? '#071c2c' : '#6b7a8d',
                    borderBottom: activeTab === t.id ? '2.5px solid #071c2c' : '2.5px solid transparent',
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
                { id: 'mandate', label: 'Framework Architecture' },
                { id: 'fourPillars', label: 'The 4 Pillars' },
                { id: 'accreditations', label: 'Certifications & Accreditations' },
                { id: 'milestones', label: 'Fleet Safety Milestones' },
              ].map(t => (
                <button
                  key={t.id}
                  className="modal-tab-btn"
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    fontWeight: activeTab === t.id ? 700 : 500,
                    color: activeTab === t.id ? '#071c2c' : '#6b7a8d',
                    borderBottom: activeTab === t.id ? '2.5px solid #071c2c' : '2.5px solid transparent',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </>
          )}
        </div>

        {/* ── Scrollable Tab Body ── */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'clamp(14px, 2.5vw, 28px)',
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
                        color: '#071c2c',
                        marginBottom: '8px',
                      }}
                    >
                      Executive Corporate Mandate
                    </div>
                    <p
                      style={{
                        fontSize: 14.5,
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
                        color: '#071c2c',
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div
                    style={{
                      border: '1px solid #dce6ee',
                      borderRadius: '12px',
                      padding: '24px',
                      background: '#ffffff',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <Ship size={20} color="#0284c7" />
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#071c2c' }}>
                        Offshore Drillships & Survey Vessel Execution
                      </h4>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: '#2c3e50', margin: 0 }}>
                      {elemData.offshoreExecution}
                    </p>
                  </div>

                  <div
                    style={{
                      border: '1px solid #dce6ee',
                      borderRadius: '12px',
                      padding: '24px',
                      background: '#f8fafc',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <FlaskConical size={20} color="#0284c7" />
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#071c2c' }}>
                        Onshore Geotechnical Laboratories & Mobilization Bases
                      </h4>
                    </div>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: '#2c3e50', margin: 0 }}>
                      {elemData.laboratoryAndBase}
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: RISK CONTROLS & SAFEGUARDS */}
              {activeTab === 'risks' && (
                <div>
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      color: '#071c2c',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '12px',
                    }}
                  >
                    Hazard Scenarios & Verified Safeguards
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {elemData.riskControls.map((rc, i) => (
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
                        <div style={{ flex: 1 }}>
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
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#071c2c' }}>
                              Scenario {i + 1}
                            </span>
                          </div>
                          <div style={{ fontSize: 13.5, color: '#1f2937', fontWeight: 600, marginBottom: '6px' }}>
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
                      color: '#071c2c',
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
                        {elemData.regulatoryClauses.map((c, i) => (
                          <tr
                            key={i}
                            style={{
                              borderBottom: i < elemData.regulatoryClauses.length - 1 ? '1px solid #e8eef5' : 'none',
                              background: i % 2 === 0 ? '#ffffff' : '#fafcfd',
                            }}
                          >
                            <td style={{ padding: '12px 16px', fontWeight: 700, color: '#071c2c' }}>
                              {c.framework}
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: 600, color: '#30256f' }}>
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
                      color: '#071c2c',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      marginBottom: '12px',
                    }}
                  >
                    Performance Metrics & Executive Benchmarks
                  </h4>
                  <div className="grid-kpi-3">
                    {elemData.kpiMetrics.map((kpi, i) => (
                      <div
                        key={i}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #dce6ee',
                          borderRadius: '12px',
                          padding: '20px',
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6b7a8d', marginBottom: '6px' }}>
                          {kpi.name}
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#071c2c', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
                          {kpi.actualYTD}
                        </div>
                        <div style={{ fontSize: 12, color: '#4a5568', marginBottom: '12px' }}>
                          Target: <strong>{kpi.target}</strong>
                        </div>
                        <div
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: '#ffffff',
                            border: '1px solid #dce6ee',
                            fontSize: 11,
                            color: '#071c2c',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{kpi.benchmark}</span>
                          <span style={{ color: '#16a34a' }}>✓</span>
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
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 800,
                        color: '#071c2c',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Controlled Documents in DMS Registry ({elemData.controlledDocs.length})
                    </h4>
                    <button
                      className="btn btn-primary btn-xs"
                      onClick={() => {
                        onClose();
                        router.push('/dashboard/masterlist');
                      }}
                    >
                      Open in Document Masterlist →
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {elemData.controlledDocs.map(doc => (
                      <div
                        key={doc.number}
                        onClick={() => {
                          onClose();
                          router.push('/dashboard/masterlist');
                        }}
                        style={{
                          border: '1px solid #dce6ee',
                          borderRadius: '10px',
                          padding: '14px 18px',
                          background: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = '#071c2c')}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = '#dce6ee')}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: '#071c2c' }}>
                              {doc.number}
                            </span>
                            <span className="badge badge-current" style={{ fontSize: 10 }}>
                              {doc.revision}
                            </span>
                            <span style={{ fontSize: 11, color: '#6b7a8d' }}>•</span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#30256f' }}>
                              {doc.type} ({doc.dept})
                            </span>
                          </div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: '#2c3e50', marginTop: 3 }}>
                            {doc.title}
                          </div>
                          <div style={{ fontSize: 12, color: '#6b7a8d', marginTop: 2 }}>
                            {doc.description}
                          </div>
                        </div>

                        <button className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>
                          View Document →
                        </button>
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
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#071c2c', marginBottom: 6 }}>
                      Strategic Charter Statement
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.7, color: '#2c3e50', margin: 0 }}>
                      {fundData.charterStatement}
                    </p>
                  </div>

                  <div style={{ border: '1px solid #dce6ee', borderRadius: '12px', padding: '20px', background: '#ffffff' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#30256f', marginBottom: 4 }}>
                      PDCA Cycle Classification: {fundData.pdcaPhase}
                    </div>
                    <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#4a5568', margin: 0 }}>
                      {fundData.coreGovernance}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'operations' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ border: '1px solid #dce6ee', borderRadius: '12px', padding: '24px' }}>
                    <h4 style={{ margin: '0 0 10px', fontSize: 16, fontWeight: 800, color: '#071c2c' }}>
                      Offshore Survey Fleet & Marine Operations
                    </h4>
                    <p style={{ fontSize: 14, lineHeight: 1.7, color: '#2c3e50', margin: 0 }}>
                      {fundData.marineApplication}
                    </p>
                  </div>

                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 800, color: '#071c2c', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Key Strategic Deliverables
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {fundData.strategicDeliverables.map((sd, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '10px 14px',
                            background: '#f8fafc',
                            border: '1px solid #dce6ee',
                            borderRadius: '8px',
                            fontSize: 13,
                            color: '#2c3e50',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <span style={{ color: '#16a34a', fontWeight: 800 }}>✓</span>
                          <span>{sd}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'elements' && (
                <div>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#071c2c', textTransform: 'uppercase', marginBottom: '12px' }}>
                    Operational Elements Governed by {fundData.name}
                  </h4>
                  <div className="grid-modal-2">
                    {fundData.coveredElementNums.map(num => {
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
                          onMouseEnter={e => (e.currentTarget.style.borderColor = '#071c2c')}
                          onMouseLeave={e => (e.currentTarget.style.borderColor = '#dce6ee')}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#30256f' }}>
                              ELEMENT {el.num}
                            </span>
                            <span style={{ fontSize: 12, color: '#071c2c', fontWeight: 700 }}>→ Explore</span>
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 800, color: '#071c2c', marginBottom: '6px' }}>
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
                    {fundData.fleetMetrics.map((m, i) => (
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
                        <div style={{ fontSize: 22, fontWeight: 800, color: '#071c2c', margin: '6px 0 4px' }}>
                          {m.value}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#4a5568' }}>{m.note}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '16px 20px', background: '#ffffff', border: '1px solid #dce6ee', borderRadius: '10px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#6b7a8d', marginBottom: '6px' }}>
                      Applicable Quality & Maritime Standards
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#071c2c' }}>
                      {fundData.governingStandards.join(' · ')}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ============================================================
              CASE 3: THE FUNDAMENTALS (OVERVIEW) TABS
              ============================================================ */}
          {isOverview && (
            <>
              {activeTab === 'mandate' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #dce6ee', borderRadius: '12px', padding: '24px' }}>
                    <h3 style={{ margin: '0 0 10px', fontSize: 18, fontWeight: 800, color: '#071c2c' }}>
                      Integrated Management System Mandate
                    </h3>
                    <p style={{ fontSize: 14.5, lineHeight: 1.75, color: '#2c3e50', margin: 0 }}>
                      {THI_MASTER_FRAMEWORK.corporateMandate}
                    </p>
                  </div>

                  <div className="grid-modal-4">
                    {THI_MASTER_FRAMEWORK.fleetStatistics.map((stat, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '16px',
                          background: '#ffffff',
                          border: '1px solid #dce6ee',
                          borderRadius: '10px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7a8d', textTransform: 'uppercase' }}>
                          {stat.label}
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: '#071c2c', margin: '4px 0 2px' }}>
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
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#071c2c', textTransform: 'uppercase', marginBottom: '14px' }}>
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
                            <span style={{ fontSize: 16, fontWeight: 800, color: '#071c2c' }}>
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
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#071c2c', textTransform: 'uppercase', marginBottom: '14px' }}>
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
                          color: '#071c2c',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <ShieldCheck size={18} color="#16a34a" />
                        <span>{acc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'milestones' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '24px', background: '#071c2c', color: '#ffffff', borderRadius: '12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9bb4cc' }}>
                      Maritime Safety Milestone
                    </div>
                    <h3 style={{ margin: '6px 0 10px', fontSize: 26, fontWeight: 800 }}>
                      Over 1.4 Million Offshore Man-Hours Without Lost-Time Injury (LTI)
                    </h3>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: '#dce6ee' }}>
                      Achieved across deep-water soil investigations in Makassar Strait, Natuna Sea seismic runs, and shallow geothermal port bathymetry surveys.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div
          style={{
            padding: '12px clamp(14px, 2.5vw, 28px)',
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
                Tip: Use <strong>← / → Arrow Keys</strong> on your keyboard to step through Elements 1 to 8.
              </span>
            ) : (
              <span>PT Taka Hydrocore Indonesia · Document Control & Management System</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={onClose}>
              Close Window
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                onClose();
                router.push('/dashboard/masterlist');
              }}
            >
              Browse Document Masterlist →
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
