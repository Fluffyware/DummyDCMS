'use client';

import { useState } from 'react';
import {
  THIElement,
  THIFundamental,
  THI_ELEMENTS,
  THI_FUNDAMENTALS,
  THE_FUNDAMENTALS_OVERVIEW,
} from '@/lib/mock-data';

export type RadialSelectionType = 'element' | 'fundamental' | 'overview';

export interface RadialSelection {
  type: RadialSelectionType;
  id: string;
  data: THIElement | THIFundamental | typeof THE_FUNDAMENTALS_OVERVIEW;
}

interface Props {
  selectedId?: string | null;
  onSelect?: (selection: RadialSelection | null) => void;
}

// ─── Fundamental Pillar Cyclic Scope Angles (Plan: E1-5, Do: E6, Check: E7, Action: E8) ───
const FUNDAMENTAL_ANGLES: Record<string, { startAngle: number; endAngle: number; midAngle: number }> = {
  plan:   { startAngle: 0,   endAngle: 225, midAngle: 112.5 },
  do:     { startAngle: 225, endAngle: 270, midAngle: 247.5 },
  check:  { startAngle: 270, endAngle: 315, midAngle: 292.5 },
  action: { startAngle: 315, endAngle: 360, midAngle: 337.5 },
};

// ─── Polar to Cartesian Helper ──────────────────────────────
// angleDeg: 0° is 12 o'clock (top), increasing clockwise
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
  chevronDeg = 7
) {
  const midR = (r1 + r2) / 2;
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  // Start notch (receives arrow tip from previous segment)
  const sOuter = polarToCartesian(cx, cy, r2, startAngle);
  const sMid   = polarToCartesian(cx, cy, midR, startAngle + chevronDeg);
  const sInner = polarToCartesian(cx, cy, r1, startAngle);

  // End tip (arrow projecting forward into next segment)
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

export default function RadialWheel({ selectedId, onSelect }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Dimensions
  const SIZE = 620;
  const cx = 310;
  const cy = 310;

  // Radii matching reference image proportions
  const R_CENTER     = 82;
  const R_INNER_MIN  = 88;
  const R_INNER_MAX  = 174;
  const R_GAP_RING   = 179;
  const R_OUTER_MIN  = 185;
  const R_OUTER_MAX  = 274;

  // Banner radii
  const R_BANNER_MIN = 282;
  const R_BANNER_MAX = 306;

  // Active item
  const activeId = hoveredId || selectedId || null;

  const handleSelectElement = (elem: THIElement) => {
    if (selectedId === elem.id) {
      onSelect?.(null);
    } else {
      onSelect?.({ type: 'element', id: elem.id, data: elem });
    }
  };

  const handleSelectFundamental = (fund: THIFundamental) => {
    if (selectedId === fund.id) {
      onSelect?.(null);
    } else {
      onSelect?.({ type: 'fundamental', id: fund.id, data: fund });
    }
  };

  const handleSelectOverview = () => {
    if (selectedId === 'the-fundamentals') {
      onSelect?.(null);
    } else {
      onSelect?.({
        type: 'overview',
        id: 'the-fundamentals',
        data: THE_FUNDAMENTALS_OVERVIEW,
      });
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: SIZE, margin: '0 auto' }}>
      <svg
        width="100%"
        height="auto"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{
          display: 'block',
          userSelect: 'none',
          overflow: 'visible',
        }}
      >
        <defs>
          <filter id="rw-shadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="rgba(7,28,44,0.14)" />
          </filter>
          <filter id="rw-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer Background Subtle Circle */}
        <circle cx={cx} cy={cy} r={R_OUTER_MAX + 14} fill="#f8fafc" />

        {/* ── Top Curved "Elements" Banner ── */}
        <g style={{ cursor: 'default' }}>
          <path
            d={arcSegmentPath(cx, cy, R_BANNER_MIN, R_BANNER_MAX, 342, 386)}
            fill="#6da4cf"
            stroke="#ffffff"
            strokeWidth="2"
          />
          {/* Subtle pointer tip at end of banner */}
          <polygon
            points={`
              ${polarToCartesian(cx, cy, R_BANNER_MAX, 386).x},${polarToCartesian(cx, cy, R_BANNER_MAX, 386).y}
              ${polarToCartesian(cx, cy, (R_BANNER_MIN + R_BANNER_MAX) / 2, 391).x},${polarToCartesian(cx, cy, (R_BANNER_MIN + R_BANNER_MAX) / 2, 391).y}
              ${polarToCartesian(cx, cy, R_BANNER_MIN, 386).x},${polarToCartesian(cx, cy, R_BANNER_MIN, 386).y}
            `}
            fill="#6da4cf"
          />
          {/* Curved Text Path or Text at Midpoint */}
          {(() => {
            const bMid = polarToCartesian(cx, cy, (R_BANNER_MIN + R_BANNER_MAX) / 2, 4);
            return (
              <text
                x={bMid.x}
                y={bMid.y + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                fontWeight="700"
                fontFamily="DM Sans, sans-serif"
                fill="#ffffff"
                letterSpacing="0.05em"
              >
                Elements
              </text>
            );
          })()}
        </g>

        {/* ── 8 Outer Elements ── */}
        {THI_ELEMENTS.map((elem, i) => {
          const DEG_PER = 360 / THI_ELEMENTS.length;
          const startAngle = i * DEG_PER + 1.2;
          const endAngle   = (i + 1) * DEG_PER - 1.2;
          const midAngle   = (startAngle + endAngle) / 2;

          const isHovered  = hoveredId === elem.id;
          const isSelected = selectedId === elem.id;
          const isActive   = isHovered || isSelected;

          // Theme colors: default steel blue, active dark navy
          const fill = isActive ? '#071c2c' : '#7d9eb9';
          const midPos = polarToCartesian(cx, cy, (R_OUTER_MIN + R_OUTER_MAX) / 2, midAngle);

          return (
            <g
              key={elem.id}
              id={`segment-${elem.id}`}
              style={{
                cursor: 'pointer',
                transition: 'transform 0.2s cubic-bezier(.22,1,.36,1)',
              }}
              onMouseEnter={() => setHoveredId(elem.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleSelectElement(elem)}
            >
              {/* Main Segment Arc */}
              <path
                d={arcSegmentPath(cx, cy, R_OUTER_MIN, R_OUTER_MAX, startAngle, endAngle)}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={isActive ? '3.5' : '2.5'}
                filter={isActive ? 'url(#rw-glow)' : undefined}
                style={{
                  transition: 'fill 0.2s ease, stroke-width 0.2s ease',
                }}
              />

              {/* Active top highlight band */}
              {isActive && (
                <path
                  d={arcSegmentPath(cx, cy, R_OUTER_MAX - 5, R_OUTER_MAX, startAngle, endAngle)}
                  fill="rgba(255, 255, 255, 0.3)"
                  style={{ pointerEvents: 'none' }}
                />
              )}

              {/* Multi-line Label formatted exactly like reference image */}
              <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {elem.titleLines.map((line, li) => {
                  const lineCount = elem.titleLines.length;
                  const yOffset = (li - (lineCount - 1) / 2) * 11.5;
                  const isFirst = li === 0;

                  return (
                    <text
                      key={li}
                      x={midPos.x}
                      y={midPos.y + yOffset}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={isFirst ? 11 : 9.5}
                      fontWeight={isFirst || isActive ? '700' : '600'}
                      fontFamily="DM Sans, sans-serif"
                      fill="#ffffff"
                      style={{
                        letterSpacing: isFirst ? '0.04em' : '0.01em',
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
        <circle cx={cx} cy={cy} r={R_GAP_RING} fill="none" stroke="#ffffff" strokeWidth="4" />

        {/* ── 4 Inner Fundamentals (Chevron Cyclic Ring) ── */}
        {THI_FUNDAMENTALS.map((fund) => {
          const angles = FUNDAMENTAL_ANGLES[fund.id] || { startAngle: 0, endAngle: 90, midAngle: 45 };
          const qStart = angles.startAngle + 1.2;
          const qEnd   = angles.endAngle - 1.2;
          const midDeg = angles.midAngle;

          const isHovered  = hoveredId === fund.id;
          const isSelected = selectedId === fund.id;
          const isChildSelected = selectedId && THI_ELEMENTS.find(e => e.id === selectedId)?.fundamentalId === fund.id;
          const isActive   = isHovered || isSelected;

          // Deep Navy colors matching reference image
          const fill = isActive ? '#1a4a6e' : isChildSelected ? '#0e3a5f' : '#072b49';
          const midPos = polarToCartesian(cx, cy, (R_INNER_MIN + R_INNER_MAX) / 2, midDeg);

          // Lines for label
          const labelLines = [fund.name];

          return (
            <g
              key={fund.id}
              id={`fundamental-${fund.id}`}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredId(fund.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => handleSelectFundamental(fund)}
            >
              <path
                d={innerChevronPath(cx, cy, R_INNER_MIN, R_INNER_MAX, qStart, qEnd, 7.5)}
                fill={fill}
                stroke="#ffffff"
                strokeWidth={isActive ? '3.5' : isChildSelected ? '3' : '2.5'}
                filter={isActive ? 'url(#rw-glow)' : undefined}
                style={{ transition: 'fill 0.2s ease, stroke-width 0.2s ease' }}
              />

              {/* Label */}
              <g style={{ pointerEvents: 'none', userSelect: 'none' }}>
                {labelLines.map((line, li) => {
                  const yOffset = (li - (labelLines.length - 1) / 2) * 14;
                  return (
                    <text
                      key={li}
                      x={midPos.x}
                      y={midPos.y + yOffset}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={11.5}
                      fontWeight="700"
                      fontFamily="Manrope, sans-serif"
                      fill="#ffffff"
                      letterSpacing="0.02em"
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
        <circle cx={cx} cy={cy} r={R_INNER_MIN - 1} fill="none" stroke="#ffffff" strokeWidth="3" />

        {/* ── Center Circle: "The Fundamentals" ── */}
        <g
          id="center-fundamentals"
          style={{ cursor: 'pointer' }}
          onMouseEnter={() => setHoveredId('the-fundamentals')}
          onMouseLeave={() => setHoveredId(null)}
          onClick={handleSelectOverview}
        >
          {/* Center Disc */}
          <circle
            cx={cx}
            cy={cy}
            r={R_CENTER}
            fill={activeId === 'the-fundamentals' ? '#f0f5fa' : '#ffffff'}
            stroke={activeId === 'the-fundamentals' ? '#071c2c' : '#c8d8e5'}
            strokeWidth={activeId === 'the-fundamentals' ? '2.5' : '1.5'}
            filter="url(#rw-shadow)"
            style={{ transition: 'all 0.2s ease' }}
          />

          {/* Center Logo Image */}
          <image
            href="/thi-logo-official.png"
            x={cx - 52}
            y={cy - 16}
            width="104"
            height="22.5"
            preserveAspectRatio="xMidYMid meet"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          />

          {/* Subtitle */}
          <text
            x={cx}
            y={cy + 16}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize={8.5}
            fontWeight="700"
            fontFamily="DM Sans, sans-serif"
            fill="#0284c7"
            letterSpacing="0.06em"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            MANAGEMENT SYSTEM
          </text>

          {/* Mini active badge */}
          {selectedId === 'the-fundamentals' && (
            <text
              x={cx}
              y={cy + 28}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={8.5}
              fontWeight="600"
              fontFamily="DM Sans, sans-serif"
              fill="#30256f"
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              ● Selected
            </text>
          )}
        </g>
      </svg>
    </div>
  );
}
