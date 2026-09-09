'use client';

import React, { useState, useEffect } from 'react';
import {
  THI_ELEMENTS,
  THI_FUNDAMENTALS,
  THE_FUNDAMENTALS_OVERVIEW,
  THIElement,
  THIFundamental,
} from '@/lib/mock-data';
import {
  THI_PRESENTATION_ELEMENTS,
  THI_PRESENTATION_FUNDAMENTALS,
  ElementPresentation,
  FundamentalPresentation,
} from '@/lib/thi-presentation-data';

export type Concept1Selection = {
  type: 'element' | 'fundamental' | 'overview';
  id: string;
  num?: number;
};

// ─── Fundamental Pillar Cyclic Scope Angles (Plan: E1-5, Do: E6, Check: E7, Action: E8) ───
export const FUNDAMENTAL_ANGLES: Record<string, { startAngle: number; endAngle: number; midAngle: number }> = {
  plan:   { startAngle: 0,   endAngle: 225, midAngle: 112.5 },
  do:     { startAngle: 225, endAngle: 270, midAngle: 247.5 },
  check:  { startAngle: 270, endAngle: 315, midAngle: 292.5 },
  action: { startAngle: 315, endAngle: 360, midAngle: 337.5 },
};

// ─── Polar to Cartesian Helper ──────────────────────────────
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// Arc path for outer 10 segments
function arcSegmentPath(
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  startAngle: number,
  endAngle: number
) {
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  const p1 = polarToCartesian(cx, cy, r2, startAngle);
  const p2 = polarToCartesian(cx, cy, r2, endAngle);
  const p3 = polarToCartesian(cx, cy, r1, endAngle);
  const p4 = polarToCartesian(cx, cy, r1, startAngle);

  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${r2} ${r2} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${r1} ${r1} 0 ${largeArc} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

// Chevron path for inner 4 fundamentals (cyclic clockwise arrow join)
function innerChevronPath(
  cx: number,
  cy: number,
  r1: number,
  r2: number,
  startAngle: number,
  endAngle: number,
  chevronDeg = 8
) {
  const midR = (r1 + r2) / 2;
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  // Start notch
  const sOuter = polarToCartesian(cx, cy, r2, startAngle);
  const sMid   = polarToCartesian(cx, cy, midR, startAngle + chevronDeg);
  const sInner = polarToCartesian(cx, cy, r1, startAngle);

  // End tip
  const eInner = polarToCartesian(cx, cy, r1, endAngle);
  const eMid   = polarToCartesian(cx, cy, midR, endAngle + chevronDeg);
  const eOuter = polarToCartesian(cx, cy, r2, endAngle);

  return [
    `M ${sOuter.x.toFixed(2)} ${sOuter.y.toFixed(2)}`,
    `A ${r2} ${r2} 0 ${largeArc} 1 ${eOuter.x.toFixed(2)} ${eOuter.y.toFixed(2)}`,
    `L ${eMid.x.toFixed(2)} ${eMid.y.toFixed(2)}`,
    `L ${eInner.x.toFixed(2)} ${eInner.y.toFixed(2)}`,
    `A ${r1} ${r1} 0 ${largeArc} 0 ${sInner.x.toFixed(2)} ${sInner.y.toFixed(2)}`,
    `L ${sMid.x.toFixed(2)} ${sMid.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

export default function Concept1KeynoteDeck() {
  const [selection, setSelection] = useState<Concept1Selection>({
    type: 'element',
    id: 'elem-1',
    num: 1,
  });
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Reset page-content background to default
  useEffect(() => {
    const mainEl = document.querySelector('.page-content') as HTMLElement | null;
    if (mainEl) {
      mainEl.style.background = '';
    }
  }, []);

  // Grand SVG Canvas dimensions (820x820 - Ultra Grand & Ultra Crisp)
  const SIZE = 820;
  const cx = 410;
  const cy = 410;

  // Generous Radii for big high-legibility wheel (No top banner, maximum circle coverage!)
  const R_CENTER     = 124;  // Center disc diameter = 248px (Grand room for TAKA logo!)
  const R_INNER_MIN  = 132;  // Inner boundary of 4 Chevrons
  const R_INNER_MAX  = 240;  // Thickness of Chevrons = 108px
  const R_GAP_RING   = 246;  // White gap ring
  const R_OUTER_MIN  = 252;  // Inner boundary of 10 Elements
  const R_OUTER_MAX  = 398;  // Thickness of 10 Elements = 146px (MAXIMUM size & extra readable)

  const handlePrev = () => {
    if (selection.type === 'element') {
      const prevNum = (selection.num ?? 1) > 1 ? (selection.num ?? 1) - 1 : 10;
      setSelection({ type: 'element', id: `elem-${prevNum}`, num: prevNum });
    }
  };

  const handleNext = () => {
    if (selection.type === 'element') {
      const nextNum = (selection.num ?? 1) < 10 ? (selection.num ?? 1) + 1 : 1;
      setSelection({ type: 'element', id: `elem-${nextNum}`, num: nextNum });
    }
  };

  // Active data
  const isElement = selection.type === 'element';
  const isFundamental = selection.type === 'fundamental';
  const isOverview = selection.type === 'overview';

  const elemData: ElementPresentation | undefined = isElement
    ? THI_PRESENTATION_ELEMENTS[selection.num || 1]
    : undefined;

  const thiElem: THIElement | undefined = isElement
    ? THI_ELEMENTS.find((e) => e.num === (selection.num || 1))
    : undefined;

  const fundData: FundamentalPresentation | undefined = isFundamental
    ? THI_PRESENTATION_FUNDAMENTALS[selection.id]
    : undefined;

  const activeId = hoveredId || selection.id;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: 'auto',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(7, 28, 44, 0.04)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >

      {/* ── UNIFIED FULL DASHBOARD SPLIT STAGE ── */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'stretch',
          width: '100%',
          flex: 1,
          minHeight: 0,
        }}
        className="full-dashboard-stage-grid"
      >
        {/* ── LEFT COLUMN: GRAND RADIAL WHEEL CANVAS ── */}
        <div
          className="radial-canvas-column"
          style={{
            padding: '12px 18px',
            borderRight: '1px solid #e8eef5',
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            userSelect: 'none',
            height: '100%',
            minHeight: 0,
          }}
        >
          {/* Top Bar: Status Badge */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginBottom: '3px',
              paddingBottom: '3px',
            }}
          >
            <span
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                color: '#071c2c',
                background: '#e0f2fe',
                padding: '2px 7px',
                borderRadius: '6px',
                border: '1px solid #bae6fd',
              }}
            >
              {isElement
                ? `Elemen 0${selection.num}`
                : isFundamental
                ? 'Fundamental Pillar'
                : 'Overview'}
            </span>
          </div>

          {/* SVG Canvas for Grand Radial Wheel */}
          <div
            style={{
              width: '100%',
              maxWidth: 'min(100%, calc(100vh - 170px), 760px)',
              aspectRatio: '1 / 1',
              position: 'relative',
              margin: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox={`0 0 ${SIZE} ${SIZE}`}
              style={{
                display: 'block',
                userSelect: 'none',
                overflow: 'visible',
              }}
            >
              <defs>
                <filter id="rw-grand-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="9" floodColor="rgba(7,28,44,0.18)" />
                </filter>
                <filter id="rw-grand-glow" x="-25%" y="-25%" width="150%" height="150%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer Background Subtle Circle */}
              <circle cx={cx} cy={cy} r={R_OUTER_MAX + 8} fill="#f8fafc" />

              {/* ── 10 Outer Elements (Large & High Legibility) ── */}
              {THI_ELEMENTS.map((elem, i) => {
                const DEG_PER = 360 / THI_ELEMENTS.length;
                const startAngle = i * DEG_PER + 1.2;
                const endAngle   = (i + 1) * DEG_PER - 1.2;
                const midAngle   = (startAngle + endAngle) / 2;

                const isHovered  = hoveredId === elem.id;
                const isSelected = selection.type === 'element' && selection.id === elem.id;
                const isActive   = isHovered || isSelected;

                const fill = isActive ? '#071c2c' : '#7d9eb9';
                const midPos = polarToCartesian(cx, cy, (R_OUTER_MIN + R_OUTER_MAX) / 2, midAngle);

                return (
                  <g
                    key={elem.id}
                    id={`segment-${elem.id}`}
                    style={{
                      cursor: 'pointer',
                      transition: 'transform 0.25s cubic-bezier(.22,1,.36,1)',
                    }}
                    onMouseEnter={() => setHoveredId(elem.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => {
                      setSelection({ type: 'element', id: elem.id, num: elem.num });

                    }}
                  >
                    {/* Main Segment Arc */}
                    <path
                      d={arcSegmentPath(cx, cy, R_OUTER_MIN, R_OUTER_MAX, startAngle, endAngle)}
                      fill={fill}
                      stroke="#ffffff"
                      strokeWidth={isActive ? '4' : '3'}
                      filter={isActive ? 'url(#rw-grand-glow)' : 'url(#rw-grand-shadow)'}
                      style={{
                        transition: 'fill 0.25s ease, stroke-width 0.25s ease',
                      }}
                    />

                    {/* Active Top Highlight Band */}
                    {isActive && (
                      <path
                        d={arcSegmentPath(cx, cy, R_OUTER_MAX - 6, R_OUTER_MAX, startAngle, endAngle)}
                        fill="rgba(56, 189, 248, 0.45)"
                        style={{ pointerEvents: 'none' }}
                      />
                    )}

                    {/* Multi-line Label (Refined Font Size & Clean Contrast) */}
                    <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
                      {elem.titleLines.map((line, li) => {
                        const lineCount = elem.titleLines.length;
                        const isFirst = li === 0;
                        const yOffset = (li - (lineCount - 1) / 2) * 13;

                        return (
                          <text
                            key={li}
                            x={midPos.x}
                            y={midPos.y + yOffset}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={isFirst ? 13.5 : 11}
                            fontWeight={isFirst ? '900' : '700'}
                            fontFamily="DM Sans, sans-serif"
                            fill={isFirst && isActive ? '#38bdf8' : '#ffffff'}
                            style={{
                              letterSpacing: isFirst ? '0.03em' : '0.01em',
                              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))',
                            }}
                          >
                            {line}
                          </text>
                        );
                      })}
                    </g>
                  </g>
                );
              })}

              {/* Gap Separator Rings */}
              <circle cx={cx} cy={cy} r={R_GAP_RING} fill="none" stroke="#ffffff" strokeWidth="5" />

              {/* ── 4 Inner Fundamentals (Chevron Cyclic Ring) ── */}
              {THI_FUNDAMENTALS.map((fund) => {
                const angles = FUNDAMENTAL_ANGLES[fund.id] || { startAngle: 0, endAngle: 90, midAngle: 45 };
                const qStart = angles.startAngle + 1.2;
                const qEnd   = angles.endAngle - 1.2;
                const midDeg = angles.midAngle;

                const isHovered  = hoveredId === fund.id;
                const isSelected = selection.type === 'fundamental' && selection.id === fund.id;
                const isChildSelected = selection.type === 'element' && elemData && fund.coveredElements.includes(elemData.num);
                const isActive   = isHovered || isSelected;

                const fill = isActive ? '#1a4a6e' : isChildSelected ? '#0e3a5f' : '#072b49';
                const midPos = polarToCartesian(cx, cy, (R_INNER_MIN + R_INNER_MAX) / 2, midDeg);

                const labelLines = [fund.name];

                return (
                  <g
                    key={fund.id}
                    id={`fundamental-${fund.id}`}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredId(fund.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => {
                      setSelection({ type: 'fundamental', id: fund.id });
                    }}
                  >
                    <path
                      d={innerChevronPath(cx, cy, R_INNER_MIN, R_INNER_MAX, qStart, qEnd, 7.5)}
                      fill={fill}
                      stroke="#ffffff"
                      strokeWidth={isActive ? '4' : isChildSelected ? '3.5' : '3'}
                      filter={isActive ? 'url(#rw-grand-glow)' : undefined}
                      style={{ transition: 'fill 0.25s ease, stroke-width 0.25s ease' }}
                    />

                    {/* Chevron Label (Refined Font Size & Clean Spacing) */}
                    <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
                      {labelLines.map((line, li) => {
                        const yOffset = (li - (labelLines.length - 1) / 2) * 15;
                        return (
                          <text
                            key={li}
                            x={midPos.x}
                            y={midPos.y + yOffset}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize={fund.id === 'plan' ? 16 : 14}
                            fontWeight="800"
                            fontFamily="Manrope, sans-serif"
                            fill="#ffffff"
                            letterSpacing="0.03em"
                            style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))' }}
                          >
                            {line}
                          </text>
                        );
                      })}
                    </g>
                  </g>
                );
              })}

              {/* Inner Separator Ring */}
              <circle cx={cx} cy={cy} r={R_INNER_MIN - 1} fill="none" stroke="#ffffff" strokeWidth="4" />

              {/* ── Center Circle: "The Fundamentals" ── */}
              <g
                id="center-fundamentals"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredId('the-fundamentals')}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  setSelection({ type: 'overview', id: 'the-fundamentals' });

                }}
              >
                {/* Center Disc */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={R_CENTER}
                  fill={activeId === 'the-fundamentals' ? '#f0f7fc' : '#ffffff'}
                  stroke={activeId === 'the-fundamentals' ? '#0284c7' : '#c8d8e5'}
                  strokeWidth={activeId === 'the-fundamentals' ? '4' : '2.5'}
                  filter="url(#rw-grand-shadow)"
                  style={{ transition: 'all 0.25s ease' }}
                />

                {/* Subtle Inner Ring Accent */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={R_CENTER - 7}
                  fill="none"
                  stroke={activeId === 'the-fundamentals' ? 'rgba(2,132,199,0.3)' : 'rgba(200,216,229,0.4)'}
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                />

                {/* Center TAKA Hydrocore Official Logo Image */}
                <image
                  href="/thi-logo-official.png"
                  x={cx - 85}
                  y={cy - 28}
                  width="170"
                  height="38"
                  preserveAspectRatio="xMidYMid meet"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                />

                {/* Center Sub-label */}
                <text
                  x={cx}
                  y={cy + 26}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight="800"
                  fontFamily="DM Sans, sans-serif"
                  fill={activeId === 'the-fundamentals' ? '#0284c7' : '#475569'}
                  letterSpacing="0.08em"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  MANAGEMENT SYSTEM
                </text>

                {/* Active Indicator */}
                {selection.type === 'overview' && (
                  <text
                    x={cx}
                    y={cy + 46}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={10}
                    fontWeight="800"
                    fontFamily="DM Sans, sans-serif"
                    fill="#0284c7"
                    letterSpacing="0.06em"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    ● OVERVIEW ACTIVE
                  </text>
                )}
              </g>
            </svg>
          </div>
        </div>

        {/* ── RIGHT COLUMN: AUTHENTIC EXECUTIVE EXPLANATION (INTEGRATED & ELEGANT) ── */}
        <div
          className="radial-detail-column"
          style={{
            padding: '18px clamp(16px, 2vw, 28px)',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            minWidth: 0,
            overflowY: 'auto',
            height: '100%',
            minHeight: 0,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {/* Header of Selection */}
          <div style={{ borderBottom: '1px solid #e8eef5', paddingBottom: '12px' }}>
            {/* Logo + Selected element title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '6px' }}>
              <img
                src="/thi-logo-official.png"
                alt="PT Taka Hydrocore Indonesia"
                style={{ height: 28, width: 'auto', objectFit: 'contain', objectPosition: 'left center' }}
              />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#0284c7',
                  background: '#e0f2fe',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  border: '1px solid #bae6fd',
                  alignSelf: 'flex-start',
                }}
              >
                {isElement
                  ? elemData?.badge
                  : isFundamental
                  ? `FUNDAMENTAL PILLAR · ${fundData?.name?.toUpperCase()}`
                  : 'INTEGRATED MANAGEMENT SYSTEM'}
              </span>
            </div>

            <h2
              style={{
                margin: '0 0 5px',
                fontSize: 'clamp(18px, 1.8vw, 23px)',
                fontWeight: 800,
                color: '#071c2c',
                lineHeight: 1.25,
                fontFamily: 'var(--font-display)',
              }}
            >
              {isElement
                ? elemData?.label
                : isFundamental
                ? `${fundData?.name}: Fondasi Tata Kelola Operasional`
                : 'Management System: Integrated QHSSE Governance Framework'}
            </h2>

            <p
              style={{
                margin: 0,
                fontSize: '13.5px',
                color: '#475569',
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              {isElement
                ? elemData?.tagline
                : isFundamental
                ? fundData?.subtitle
                : 'An integrated Quality, Health, Safety, Security & Environment management system governing 8 Operational Elements across marine geotechnical drilling, geophysical survey, and laboratory testing operations.'}
            </p>

            {isElement && thiElem?.dummyExplanation && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(2, 132, 199, 0.05)',
                  border: '1px solid rgba(2, 132, 199, 0.16)',
                  fontSize: '12.5px',
                  lineHeight: 1.6,
                  color: '#0f172a',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px', color: '#0284c7' }}>
                  OMS Element Scope &amp; Principle
                </div>
                {thiElem.dummyExplanation}
              </div>
            )}
          </div>

          {/* ── RENDER ACCORDING TO SELECTION TYPE ── */}
          {isElement && elemData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '6px' }}>
              {/* Section Header */}
              <div style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: '#0369a1',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7' }} />
                Panduan &amp; Penjelasan Operasional Lapangan
              </div>

              {/* Offshore block */}
              <div>
                <div style={{
                  fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: '#0369a1', marginBottom: '6px',
                }}>
                  Operasi Kapal &amp; Rig Laut
                </div>
                <p style={{
                  margin: 0, fontSize: '13.5px', color: '#1e293b',
                  lineHeight: 1.65, fontWeight: 400,
                }}>
                  {elemData.offshoreExecution}
                </p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

              {/* Lab / Base block */}
              <div>
                <div style={{
                  fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: '#475569', marginBottom: '6px',
                }}>
                  Pangkalan &amp; Laboratorium
                </div>
                <p style={{
                  margin: 0, fontSize: '13.5px', color: '#334155',
                  lineHeight: 1.65, fontWeight: 400,
                }}>
                  {elemData.laboratoryAndBase}
                </p>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: 0 }} />

              {/* Hazard Controls */}
              <div>
                <div style={{
                  fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: '#64748b', marginBottom: '8px',
                }}>
                  Pengendalian Risiko &amp; Safeguard
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {elemData.riskControls.map((rc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e8eef5',
                        gap: '12px',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#071c2c', lineHeight: 1.45 }}>{rc.hazardScenario}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                          Kontrol: <span style={{ color: '#334155', fontWeight: 500 }}>{rc.safeguardMethod}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                        <span style={{
                          fontSize: '10px', fontWeight: 700,
                          padding: '2px 7px', borderRadius: '4px',
                          background: rc.barrierLevel === 'Preventive' ? '#e0f2fe' : '#fef3c7',
                          color: rc.barrierLevel === 'Preventive' ? '#0369a1' : '#b45309',
                          border: '1px solid',
                          borderColor: rc.barrierLevel === 'Preventive' ? '#bae6fd' : '#fde68a',
                          whiteSpace: 'nowrap',
                        }}>
                          {rc.barrierLevel}
                        </span>
                        <span style={{
                          fontSize: '10px', fontWeight: 600, color: '#15803d',
                          background: '#dcfce7', padding: '2px 7px',
                          borderRadius: '4px', border: '1px solid #bbf7d0',
                          whiteSpace: 'nowrap',
                        }}>
                          Sisa: {rc.residualRisk}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regulatory Framework */}
              <div>
                <div style={{
                  fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.08em', color: '#64748b', marginBottom: '8px',
                }}>
                  Standar &amp; Kepatuhan Regulasi
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px' }}>
                  {elemData.regulatoryClauses.map((clause, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '10px 12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#071c2c' }}>{clause.framework}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px' }}>
                          {clause.clause}
                        </span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.45 }}>
                        {clause.requirement}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FUNDAMENTAL PILLAR VIEW */}
          {isFundamental && fundData && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '16px',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0369a1', marginBottom: '6px' }}>
                  PILLAR GOVERNANCE STATEMENT
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', lineHeight: 1.65, fontWeight: 500 }}>
                  {fundData.charterStatement}
                </p>
              </div>

              {/* Covered Elements */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '8px' }}>
                  ELEMEN OPERASIONAL YANG TERCAKUP PADA PILAR INI:
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {fundData.coveredElementNums.map((num) => {
                    const e = THI_PRESENTATION_ELEMENTS[num];
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSelection({ type: 'element', id: `elem-${num}`, num })}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          textAlign: 'left',
                          transition: 'all 0.18s ease',
                        }}
                        onMouseEnter={(ev) => (ev.currentTarget.style.borderColor = '#071c2c')}
                        onMouseLeave={(ev) => (ev.currentTarget.style.borderColor = '#cbd5e1')}
                      >
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#0369a1' }}>0{num}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#071c2c' }}>{e?.label?.split('.')[1]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Standards */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '6px' }}>
                  STANDAR ACUAN TATA KELOLA PILAR
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {fundData.governingStandards.map((std, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      {std}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* OVERVIEW / CENTER FUNDAMENTALS */}
          {isOverview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0369a1', marginBottom: '6px' }}>
                  PT TAKA HYDROCORE INDONESIA · INTEGRATED MANAGEMENT SYSTEM (IMS)
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', lineHeight: 1.65 }}>
                  Arsitektur sistem manajemen QHSSE THI dirancang selaras dengan standar internasional (ISO 9001 untuk Mutu, ISO 14001 untuk Lingkungan, dan ISO 45001 untuk Keselamatan Kerja & SMK3 PP 50/2012).
                  Sistem ini terdiri dari <strong>4 Fundamental Pillars</strong> di bagian inti roda yang memayungi <strong>8 Operational Elements</strong> di lingkar luar.
                </p>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', marginBottom: '8px' }}>
                  4 PILAR FUNDAMENTAL TATA KELOLA PERUSAHAAN (KLIK UNTUK EKSPLORASI):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {THI_FUNDAMENTALS.map((f, i) => (
                    <div
                      key={f.id}
                      onClick={() => setSelection({ type: 'fundamental', id: f.id })}
                      style={{
                        padding: '14px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                      }}
                      onMouseEnter={(ev) => {
                        ev.currentTarget.style.borderColor = '#0284c7';
                        ev.currentTarget.style.boxShadow = '0 4px 12px rgba(2,132,199,0.08)';
                      }}
                      onMouseLeave={(ev) => {
                        ev.currentTarget.style.borderColor = '#e2e8f0';
                        ev.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ fontSize: 10, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>Pilar 0{i + 1}</div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#071c2c', marginTop: '2px' }}>{f.name}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: '4px', lineHeight: 1.45 }}>{f.description}</div>
                      <div style={{ marginTop: '8px', fontSize: 11, fontWeight: 700, color: '#0284c7' }}>
                        Memayungi Elemen {f.coveredElements.join(', ')} →
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
