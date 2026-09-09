'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  THI_ELEMENTS,
  THI_FUNDAMENTALS,
  THE_FUNDAMENTALS_OVERVIEW,
} from '@/lib/mock-data';
import {
  THI_PRESENTATION_ELEMENTS,
  THI_PRESENTATION_FUNDAMENTALS,
  ElementPresentation,
  FundamentalPresentation,
} from '@/lib/thi-presentation-data';

export type Concept2Selection = {
  type: 'element' | 'fundamental' | 'overview';
  id: string;
  num?: number;
};

// ─── Fundamental Pillar Cyclic Scope Angles (Plan: E1-5, Do: E6, Check: E7, Action: E8) ───
const FUNDAMENTAL_ANGLES: Record<string, { startAngle: number; endAngle: number; midAngle: number }> = {
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

export default function Concept2SonarHub() {
  const [selection, setSelection] = useState<Concept2Selection>({
    type: 'element',
    id: 'elem-1',
    num: 1,
  });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('hazid');

  // Reset tab based on selection type
  useEffect(() => {
    if (selection.type === 'element') {
      setActiveTab('hazid');
    } else if (selection.type === 'fundamental') {
      setActiveTab('governance');
    } else {
      setActiveTab('framework');
    }
  }, [selection.id, selection.type]);

  const isElement = selection.type === 'element';
  const isFundamental = selection.type === 'fundamental';
  const isOverview = selection.type === 'overview';

  const elemData: ElementPresentation | undefined = isElement
    ? (THI_PRESENTATION_ELEMENTS[selection.num || 1] || THI_PRESENTATION_ELEMENTS[1])
    : undefined;

  const fundData: FundamentalPresentation | undefined = isFundamental
    ? THI_PRESENTATION_FUNDAMENTALS[selection.id]
    : undefined;

  // Grand SVG Canvas dimensions (820x820 - Crisp & Balanced)
  const SIZE = 820;
  const cx = 410;
  const cy = 410;

  // Wheel Radii
  const R_CENTER     = 124;  // Center disc diameter = 248px
  const R_INNER_MIN  = 132;  // Inner boundary of 4 Chevrons
  const R_INNER_MAX  = 240;  // Thickness of Chevrons = 108px
  const R_GAP_RING   = 246;  // White gap ring
  const R_OUTER_MIN  = 252;  // Inner boundary of 10 Elements
  const R_OUTER_MAX  = 398;  // Outer edge (Thickness = 146px)

  // Smooth scroll handler to detailed section below
  const handleSelectAndScroll = (sel: Concept2Selection) => {
    setSelection(sel);
    setTimeout(() => {
      const el = document.getElementById('sonar-detailed-console');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 40);
  };

  const handlePrevElement = () => {
    if (isElement) {
      const curNum = selection.num ?? 1;
      const prev = curNum > 1 ? curNum - 1 : 8;
      handleSelectAndScroll({ type: 'element', id: `elem-${prev}`, num: prev });
    }
  };

  const handleNextElement = () => {
    if (isElement) {
      const curNum = selection.num ?? 1;
      const next = curNum < 8 ? curNum + 1 : 1;
      handleSelectAndScroll({ type: 'element', id: `elem-${next}`, num: next });
    }
  };

  const activeId = hoveredId || selection.id;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        width: '100%',
        minWidth: 0,
      }}
    >
      {/* ── TOP SECTION: OFFSHORE CONSOLE BANNER + GRAND INTERACTIVE WHEEL ── */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(7, 28, 44, 0.05)',
          padding: '24px clamp(16px, 3vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Offshore Telemetry Top Bar */}
        <div
          style={{
            width: '100%',
            background: '#071c2c',
            borderRadius: '12px',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '20px',
            boxShadow: '0 4px 14px rgba(7, 28, 44, 0.15)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              ⚓
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#38bdf8' }}>
                  TYPE 2 · OFFSHORE HYDROGRAPHIC CONSOLE
                </span>
                <span style={{ fontSize: '9.5px', padding: '2px 7px', borderRadius: '10px', background: 'rgba(255,255,255,0.12)', color: '#e2e8f0', fontWeight: 600 }}>
                  {isElement ? `Elemen 0${selection.num} Aktif` : isFundamental ? 'Pillar Governance' : 'Master Overview'}
                </span>
              </div>
              <h1 style={{ margin: '2px 0 0', fontSize: '17px', fontWeight: 800, color: '#ffffff' }}>
                Management System & 10 Operational Elements
              </h1>
            </div>
          </div>
        </div>

        {/* ── THE GRAND INTERACTIVE WHEEL (CENTERED) ── */}
        <div
          style={{
            width: '100%',
            maxWidth: 'min(100%, 640px)',
            aspectRatio: '1 / 1',
            position: 'relative',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{
              width: '100%',
              height: '100%',
              overflow: 'visible',
              filter: 'drop-shadow(0 10px 28px rgba(7, 28, 44, 0.08))',
            }}
          >
            <defs>
              <filter id="c2-rw-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
              </filter>
              <filter id="c2-rw-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#0284c7" floodOpacity="0.45" />
              </filter>
            </defs>

            {/* Background disc */}
            <circle cx={cx} cy={cy} r={R_OUTER_MAX + 4} fill="#ffffff" stroke="#e2e8f0" strokeWidth="2" />

            {/* ── 8 Outer Elements (Arc Wedges) ── */}
            {THI_ELEMENTS.map((elem) => {
              const DEG_PER = 360 / THI_ELEMENTS.length;
              const startDeg = (elem.num - 1) * DEG_PER + 0.6;
              const endDeg   = elem.num * DEG_PER - 0.6;
              const midDeg   = (elem.num - 0.5) * DEG_PER;

              const isSelected = selection.type === 'element' && selection.num === elem.num;
              const isHovered  = hoveredId === `elem-${elem.num}`;
              const isActive   = isSelected || isHovered;

              const fill = isSelected ? '#0369a1' : isHovered ? '#0284c7' : elem.color;
              const stroke = isActive ? '#38bdf8' : '#ffffff';
              const strokeW = isActive ? '3.5' : '2.5';

              // Label Position
              const textR = (R_OUTER_MIN + R_OUTER_MAX) / 2;
              const textPos = polarToCartesian(cx, cy, textR, midDeg);

              const lines = elem.titleLines;

              return (
                <g
                  key={elem.num}
                  id={`elem-arc-${elem.num}`}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredId(`elem-${elem.num}`)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleSelectAndScroll({ type: 'element', id: `elem-${elem.num}`, num: elem.num })}
                >
                  <path
                    d={arcSegmentPath(cx, cy, R_OUTER_MIN, R_OUTER_MAX, startDeg, endDeg)}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeW}
                    filter={isActive ? 'url(#c2-rw-glow)' : 'url(#c2-rw-shadow)'}
                    style={{
                      transition: 'fill 0.25s ease, stroke 0.25s ease, stroke-width 0.25s ease',
                    }}
                  />

                  {/* Multi-line Label */}
                  <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {lines.map((line, li) => {
                      const yOffset = (li - (lines.length - 1) / 2) * 14.5;
                      const isFirst = li === 0;

                      return (
                        <text
                          key={li}
                          x={textPos.x}
                          y={textPos.y + yOffset}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize={isFirst ? 13 : 11}
                          fontWeight={isFirst ? '900' : '700'}
                          fontFamily="DM Sans, sans-serif"
                          fill="#ffffff"
                          letterSpacing={isFirst ? '0.03em' : '0.01em'}
                          style={{
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.45))',
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

            {/* Gap Separator Ring */}
            <circle cx={cx} cy={cy} r={R_GAP_RING} fill="none" stroke="#ffffff" strokeWidth="5" />

            {/* ── 4 Inner Fundamentals (Chevron Cyclic Ring) ── */}
            {THI_FUNDAMENTALS.map((fund) => {
              const angles = FUNDAMENTAL_ANGLES[fund.id] || { startAngle: 0, endAngle: 90, midAngle: 45 };
              const qStart = angles.startAngle + 1.2;
              const qEnd   = angles.endAngle - 1.2;
              const midDeg = angles.midAngle;

              const isHovered  = hoveredId === fund.id;
              const isSelected = selection.type === 'fundamental' && selection.id === fund.id;
              const isActive   = isHovered || isSelected;

              const fill = isActive ? '#1a4a6e' : '#072b49';
              const midPos = polarToCartesian(cx, cy, (R_INNER_MIN + R_INNER_MAX) / 2, midDeg);

              const labelLines = [fund.name];

              return (
                <g
                  key={fund.id}
                  id={`fundamental-${fund.id}`}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredId(fund.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => handleSelectAndScroll({ type: 'fundamental', id: fund.id })}
                >
                  <path
                    d={innerChevronPath(cx, cy, R_INNER_MIN, R_INNER_MAX, qStart, qEnd, 7.5)}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth={isActive ? '4' : '3'}
                    filter={isActive ? 'url(#c2-rw-glow)' : undefined}
                    style={{ transition: 'fill 0.25s ease, stroke-width 0.25s ease' }}
                  />

                  {/* Chevron Label */}
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
                          fontSize={13}
                          fontWeight="800"
                          fontFamily="Manrope, sans-serif"
                          fill="#ffffff"
                          letterSpacing="0.02em"
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
              onClick={() => handleSelectAndScroll({ type: 'overview', id: 'the-fundamentals' })}
            >
              {/* Center Disc */}
              <circle
                cx={cx}
                cy={cy}
                r={R_CENTER}
                fill={activeId === 'the-fundamentals' ? '#f0f7fc' : '#ffffff'}
                stroke={activeId === 'the-fundamentals' ? '#0284c7' : '#c8d8e5'}
                strokeWidth={activeId === 'the-fundamentals' ? '4' : '2.5'}
                filter="url(#c2-rw-shadow)"
                style={{ transition: 'all 0.25s ease' }}
              />

              <circle
                cx={cx}
                cy={cy}
                r={R_CENTER - 10}
                fill="none"
                stroke={activeId === 'the-fundamentals' ? 'rgba(2,132,199,0.3)' : '#e2e8f0'}
                strokeWidth="1"
                strokeDasharray="4 3"
              />

              {/* Center TAKA Hydrocore Official Logo */}
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

      {/* ── BOTTOM SECTION: CONSOLE PANEL (KEBAWAH) ── */}
      <div
        id="sonar-detailed-console"
        className="card"
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(7, 28, 44, 0.05)',
          padding: '24px clamp(16px, 3vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          scrollMarginTop: '20px',
        }}
      >
        {/* ============================================================
            CASE 1: ELEMENT SELECTION
            ============================================================ */}
        {isElement && elemData && (
          <>
            {/* Section Header with Navigation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '12px',
                    background: '#071c2c',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    boxShadow: '0 4px 12px rgba(7, 28, 44, 0.2)',
                    flexShrink: 0,
                  }}
                >
                  {elemData.num < 10 ? `0${elemData.num}` : elemData.num}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: '#0369a1',
                        background: '#e0f2fe',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        border: '1px solid #bae6fd',
                      }}
                    >
                      {elemData.badge}
                    </span>
                    <span style={{ fontSize: '12px', color: '#cbd5e1' }}>•</span>
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#475569' }}>
                      Pilar: <strong style={{ color: '#071c2c' }}>{elemData.fundamentalName}</strong>
                    </span>
                    <span style={{ fontSize: '12px', color: '#cbd5e1' }}>•</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                      Vessel Master Authority: Active
                    </span>
                  </div>

                  <h2
                    style={{
                      margin: '0 0 4px',
                      fontSize: 'clamp(20px, 2.2vw, 26px)',
                      fontWeight: 800,
                      color: '#071c2c',
                      lineHeight: 1.25,
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {elemData.label}
                  </h2>

                  <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                    {elemData.tagline}
                  </p>
                </div>
              </div>

              {/* Previous / Next Element Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handlePrevElement}
                  className="btn btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 14px', fontWeight: 700 }}
                >
                  ← Elemen {(selection.num ?? 1) > 1 ? (selection.num ?? 1) - 1 : 8}
                </button>
                <button
                  type="button"
                  onClick={handleNextElement}
                  className="btn btn-primary"
                  style={{ fontSize: '12px', padding: '6px 14px', fontWeight: 700 }}
                >
                  Elemen {(selection.num ?? 1) < 8 ? (selection.num ?? 1) + 1 : 1} →
                </button>
              </div>
            </div>

            {/* Tab Selector */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '2px', flexWrap: 'wrap' }}>
              {[
                { id: 'hazid', label: '1. HAZID & Risk Barriers', icon: '🛡️' },
                { id: 'offshore', label: '2. Offshore Drilling & Telemetry', icon: '🚢' },
                { id: 'mandate', label: '3. Mandate & RACI Matrix', icon: '👥' },
                { id: 'dms', label: '4. Controlled Documents (DMS)', icon: '📑' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '3px solid #071c2c' : '3px solid transparent',
                    background: activeTab === tab.id ? '#f8fafc' : 'transparent',
                    color: activeTab === tab.id ? '#071c2c' : '#64748b',
                    fontWeight: activeTab === tab.id ? 800 : 600,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: HAZID & BARRIERS */}
            {activeTab === 'hazid' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0369a1', marginBottom: '4px' }}>
                    OPERATIONAL BARRIER PRINCIPLE · PT TAKA HYDROCORE INDONESIA
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', lineHeight: 1.65 }}>
                    Setiap kegiatan operasional di atas kapal survei PT Taka Hydrocore Indonesia wajib memverifikasi dua lapis proteksi: Barrier Pencegahan (<em>Preventive Barrier</em>) untuk mengeliminasi bahaya di sumber, dan Barrier Mitigasi (<em>Mitigative Barrier</em>) guna meminimalisir dampak insiden pada personel dan peralatan geoteknik/geofisika.
                  </p>
                </div>

                {/* Hazard Breakdown Table */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                    DAFTAR SKENARIO BAHAYA & VERIFIKASI SAFEGUARD METODE
                  </div>

                  {elemData.riskControls.map((rc, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '16px 20px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <span style={{ fontSize: 14.5, fontWeight: 800, color: '#071c2c' }}>
                          {rc.hazardScenario}
                        </span>
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 800,
                            padding: '3px 9px',
                            borderRadius: '6px',
                            background: rc.barrierLevel === 'Preventive' ? '#e0f2fe' : '#fef3c7',
                            color: rc.barrierLevel === 'Preventive' ? '#0369a1' : '#b45309',
                            border: '1px solid',
                            borderColor: rc.barrierLevel === 'Preventive' ? '#bae6fd' : '#fde68a',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {rc.barrierLevel} Barrier
                        </span>
                      </div>
                      <div style={{ fontSize: 13.5, color: '#475569', lineHeight: 1.55 }}>
                        <strong style={{ color: '#071c2c' }}>Metode Kontrol Safeguard:</strong> {rc.safeguardMethod}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: OFFSHORE EXECUTION & TELEMETRY */}
            {activeTab === 'offshore' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '16px 20px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#166534', marginBottom: '4px' }}>
                    STOP-WORK AUTHORITY (SWA) MANDATE
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#14532d', lineHeight: 1.65 }}>
                    Seluruh kru deck, driller CPTu, dan geotechnical engineer memegang hak veto Stop-Work Authority tanpa penalti komersial. Jika kondisi laut melampaui batas keselamatan atau alarm sistem DP menyala kuning, operasi segera di-standby.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: '4px' }}>
                    OFFSHORE DRILLING & SURVEY PROTOCOL
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', lineHeight: 1.7 }}>
                    {elemData.offshoreExecution}
                  </p>
                </div>

                {/* Base Lab Directive */}
                <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#334155', marginBottom: '4px' }}>
                    PANGKALAN MOBILISASI & LAB GEOTEKNIK (JAKARTA & BALIKPAPAN)
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: 1.7 }}>
                    {elemData.laboratoryAndBase}
                  </p>
                </div>

                {/* Live Rig Telemetry Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#071c2c', borderRadius: '10px', padding: '14px 16px', color: '#ffffff' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>CPTu PENETRATION DEPTH</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>-34.8 m BSF</div>
                    <div style={{ fontSize: '11px', color: '#34d399', marginTop: '4px' }}>Steady 20 mm/sec rate</div>
                  </div>

                  <div style={{ background: '#071c2c', borderRadius: '10px', padding: '14px 16px', color: '#ffffff' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>CONE TIP RESISTANCE (qc)</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>14.2 MPa</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Stiff marine clay/sand</div>
                  </div>

                  <div style={{ background: '#071c2c', borderRadius: '10px', padding: '14px 16px', color: '#ffffff' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>SHALLOW GAS SENSOR (H2S)</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>0.00 PPM</div>
                    <div style={{ fontSize: '11px', color: '#34d399', marginTop: '4px' }}>Atmosphere Nominal</div>
                  </div>

                  <div style={{ background: '#071c2c', borderRadius: '10px', padding: '14px 16px', color: '#ffffff' }}>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>VESSEL DP-2 POSITION</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>± 0.22 m</div>
                    <div style={{ fontSize: '11px', color: '#34d399', marginTop: '4px' }}>Circle radius locked</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: MANDATE & RACI */}
            {activeTab === 'mandate' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0369a1', marginBottom: '4px' }}>
                    EXECUTIVE MANDATE & CORPORATE DIRECTIVE
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', lineHeight: 1.65 }}>
                    {elemData.executiveMandate}
                  </p>
                </div>

                {/* Regulatory Frameworks & KPI Targets */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: '10px' }}>
                      KLAUSUL REGULASI & STANDAR INTERNASIONAL
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {elemData.regulatoryClauses.map((clause, idx) => (
                        <div key={idx} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7' }}>{clause.framework}</span>
                            <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b' }}>Klausul {clause.clause}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5 }}>{clause.requirement}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: '10px' }}>
                      KEY PERFORMANCE INDICATORS (KPI)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {elemData.kpiMetrics.map((kpi, idx) => (
                        <div key={idx} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#071c2c' }}>{kpi.name}</span>
                            <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: kpi.status === 'EXCEEDED' ? '#dcfce7' : '#e0f2fe', color: kpi.status === 'EXCEEDED' ? '#166534' : '#0369a1' }}>
                              {kpi.status}
                            </span>
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                            Target: <strong style={{ color: '#071c2c' }}>{kpi.target}</strong> · Aktual: <strong style={{ color: '#0284c7' }}>{kpi.actualYTD}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RACI Responsibility Matrix */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ background: '#f1f5f9', padding: '10px 16px', fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', color: '#334155' }}>
                    MATRIKS AKUNTABILITAS RACI (RESPONSIBLE, ACCOUNTABLE, CONSULTED, INFORMED)
                  </div>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 800, color: '#071c2c' }}>Peran Organisasi</th>
                          <th style={{ padding: '10px 16px', textAlign: 'center', fontWeight: 800, color: '#071c2c' }}>RACI</th>
                          <th style={{ padding: '10px 16px', textAlign: 'left', fontWeight: 800, color: '#071c2c' }}>Deskripsi Tanggung Jawab</th>
                        </tr>
                      </thead>
                      <tbody>
                        {elemData.raciMatrix.map((raci, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '10px 16px', fontWeight: 700, color: '#071c2c' }}>{raci.role}</td>
                            <td style={{ padding: '10px 16px', textAlign: 'center' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: 900,
                                  background:
                                    raci.raci === 'Accountable'
                                      ? '#fee2e2'
                                      : raci.raci === 'Responsible'
                                      ? '#e0f2fe'
                                      : raci.raci === 'Consulted'
                                      ? '#fef3c7'
                                      : '#f1f5f9',
                                  color:
                                    raci.raci === 'Accountable'
                                      ? '#991b1b'
                                      : raci.raci === 'Responsible'
                                      ? '#0369a1'
                                      : raci.raci === 'Consulted'
                                      ? '#b45309'
                                      : '#475569',
                                }}
                              >
                                {raci.raci}
                              </span>
                            </td>
                            <td style={{ padding: '10px 16px', color: '#475569' }}>{raci.duty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: DMS DOCUMENTS */}
            {activeTab === 'dms' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b' }}>
                  DOKUMEN TERKENDALI AKTIF TERKAIT ELEMEN 0{elemData.num}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {elemData.controlledDocs.map((doc, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 20px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: 12, fontWeight: 800, color: '#0369a1', fontFamily: 'monospace' }}>
                            {doc.number}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '4px' }}>
                            Rev: {doc.revision}
                          </span>
                          <span style={{ fontSize: 10, fontWeight: 700, background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px' }}>
                            {doc.type}
                          </span>
                          <span style={{ fontSize: 11, color: '#94a3b8' }}>·</span>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#64748b' }}>{doc.dept}</span>
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#071c2c' }}>
                          {doc.title}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginTop: '2px' }}>
                          {doc.description}
                        </div>
                      </div>
                      <Link
                        href={doc.route}
                        className="btn btn-primary"
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          padding: '8px 16px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Buka di DMS →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================
            CASE 2: FUNDAMENTAL PILLAR SELECTION (INDEPENDENT)
            ============================================================ */}
        {isFundamental && fundData && (
          <>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '12px',
                    background: '#1a4a6e',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 900,
                    boxShadow: '0 4px 12px rgba(26, 74, 110, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  Q0{fundData.quadrant}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: '#0369a1',
                        background: '#e0f2fe',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        border: '1px solid #bae6fd',
                      }}
                    >
                      FUNDAMENTAL PILLAR · QUADRANT 0{fundData.quadrant}
                    </span>
                    <span style={{ fontSize: '12px', color: '#cbd5e1' }}>•</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                      PDCA Phase: {fundData.pdcaPhase}
                    </span>
                  </div>

                  <h2
                    style={{
                      margin: '0 0 4px',
                      fontSize: 'clamp(20px, 2.2vw, 26px)',
                      fontWeight: 800,
                      color: '#071c2c',
                      lineHeight: 1.25,
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    {fundData.name}: Fondasi Tata Kelola Operasional
                  </h2>

                  <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                    {fundData.subtitle}
                  </p>
                </div>
              </div>

              {/* Quick Fundamental Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {THI_FUNDAMENTALS.map((f) => {
                  const isCur = selection.id === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleSelectAndScroll({ type: 'fundamental', id: f.id })}
                      style={{
                        fontSize: '11.5px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: isCur ? '1px solid #071c2c' : '1px solid #e2e8f0',
                        background: isCur ? '#071c2c' : '#ffffff',
                        color: isCur ? '#ffffff' : '#475569',
                        transition: 'all 0.18s ease',
                      }}
                    >
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab Selector */}
            <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #f1f5f9', paddingBottom: '2px', flexWrap: 'wrap' }}>
              {[
                { id: 'governance', label: '1. Pillar Governance & Mandat', icon: '🏛️' },
                { id: 'covered', label: '2. Elemen Operasional yang Dipayungi', icon: '🔗' },
                { id: 'standards', label: '3. Standar Acuan & Regulasi', icon: '📜' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 18px',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '3px solid #071c2c' : '3px solid transparent',
                    background: activeTab === tab.id ? '#f8fafc' : 'transparent',
                    color: activeTab === tab.id ? '#071c2c' : '#64748b',
                    fontWeight: activeTab === tab.id ? 800 : 600,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* TAB 1: GOVERNANCE & CHARTER */}
            {activeTab === 'governance' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div
                  style={{
                    background: 'linear-gradient(180deg, #f0f9ff 0%, #f8fafc 100%)',
                    border: '1px solid #bae6fd',
                    borderRadius: '12px',
                    padding: '18px 20px',
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0369a1', marginBottom: '6px' }}>
                    PILLAR GOVERNANCE CHARTER STATEMENT
                  </div>
                  <p style={{ margin: 0, fontSize: '14.5px', color: '#0f172a', lineHeight: 1.65, fontWeight: 500 }}>
                    {fundData.charterStatement}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: '8px' }}>
                      PRINSIP TATA KELOLA UTAMA
                    </div>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                      {fundData.coreGovernance}
                    </p>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 18px' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: '8px' }}>
                      PENERAPAN DI OPERASI KAPAL & RIG
                    </div>
                    <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
                      {fundData.marineApplication}
                    </p>
                  </div>
                </div>

                {/* Fleet Metrics */}
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: '10px' }}>
                    METRIK PENCAPAIAN OPERASIONAL PILAR
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                    {fundData.fleetMetrics.map((fm, idx) => (
                      <div key={idx} style={{ background: '#071c2c', color: '#ffffff', borderRadius: '10px', padding: '14px 18px' }}>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>{fm.label}</div>
                        <div style={{ fontSize: '22px', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>{fm.value}</div>
                        <div style={{ fontSize: '11.5px', color: '#cbd5e1', marginTop: '4px' }}>{fm.note}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: COVERED ELEMENTS */}
            {activeTab === 'covered' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                  ELEMEN OPERASIONAL YANG TERCAKUP DALAM PILAR {fundData.name.toUpperCase()}:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {fundData.coveredElementNums.map((num) => {
                    const e = THI_PRESENTATION_ELEMENTS[num];
                    if (!e) return null;
                    return (
                      <div
                        key={num}
                        style={{
                          padding: '16px 20px',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '16px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '10px',
                              background: '#071c2c',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '15px',
                              fontWeight: 900,
                              fontFamily: 'monospace',
                              flexShrink: 0,
                            }}
                          >
                            0{num}
                          </div>
                          <div>
                            <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#071c2c' }}>
                              {e.label}
                            </div>
                            <div style={{ fontSize: '12.5px', color: '#475569', marginTop: '2px' }}>
                              {e.tagline}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleSelectAndScroll({ type: 'element', id: `elem-${num}`, num })}
                          className="btn btn-primary"
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '8px 16px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Buka Elemen 0{num} →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: STANDARDS */}
            {activeTab === 'standards' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569' }}>
                  STANDAR INTERNASIONAL & REGULASI ACUAN TATA KELOLA PILAR
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
                  {fundData.governingStandards.map((std, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 18px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>📜</span>
                      <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#071c2c' }}>
                        {std}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ============================================================
            CASE 3: OVERVIEW SELECTION (CENTER WHEEL)
            ============================================================ */}
        {isOverview && (
          <>
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '18px',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '12px',
                    background: '#0284c7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    fontWeight: 900,
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                    flexShrink: 0,
                  }}
                >
                  IMS
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                        color: '#0369a1',
                        background: '#e0f2fe',
                        padding: '3px 9px',
                        borderRadius: '6px',
                        border: '1px solid #bae6fd',
                      }}
                    >
                      INTEGRATED MANAGEMENT SYSTEM (IMS)
                    </span>
                    <span style={{ fontSize: '12px', color: '#cbd5e1' }}>•</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#071c2c' }}>
                      PT Taka Hydrocore Indonesia
                    </span>
                  </div>

                  <h2
                    style={{
                      margin: '0 0 4px',
                      fontSize: 'clamp(20px, 2.2vw, 26px)',
                      fontWeight: 800,
                      color: '#071c2c',
                      lineHeight: 1.25,
                      fontFamily: 'var(--font-display)',
                    }}
                  >
                    Management System: Integrated QHSSE Governance Framework
                  </h2>

                  <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.6 }}>
                    Sistem Manajemen Mutu, K3, dan Lingkungan terintegrasi yang memayungi 8 Elemen Operasional pemboran geoteknik laut, survei geofisika, dan pengujian laboratorium mekanika tanah.
                  </p>
                </div>
              </div>
            </div>

            {/* Overview Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px 20px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#0369a1', marginBottom: '6px' }}>
                  ARSITEKTUR TATA KELOLA KORPORASI
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#1e293b', lineHeight: 1.65 }}>
                  {THE_FUNDAMENTALS_OVERVIEW.dummyExplanation}
                </p>
              </div>

              <div>
                <div style={{ fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: '10px' }}>
                  4 PILAR FUNDAMENTAL (KLIK UNTUK MEMBUKA DETAIL PILAR):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {THI_FUNDAMENTALS.map((f, i) => (
                    <div
                      key={f.id}
                      onClick={() => handleSelectAndScroll({ type: 'fundamental', id: f.id })}
                      style={{
                        padding: '16px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
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
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#071c2c', marginTop: '2px' }}>{f.name}</div>
                      <div style={{ fontSize: 12.5, color: '#64748b', marginTop: '4px', lineHeight: 1.45 }}>{f.description}</div>
                      <div style={{ marginTop: '10px', fontSize: 11.5, fontWeight: 700, color: '#0284c7' }}>
                        Memayungi Elemen {f.coveredElements.join(', ')} →
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
