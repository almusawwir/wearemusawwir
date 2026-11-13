"use client";

import React from 'react';

/* Ring chart. segments: [{ label, value, color }] */
export function Donut({ segments, size = 190, stroke = 26, label, sub }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const mid = size / 2;
  const shown = segments.filter(s => s.value > 0);
  const gap = shown.length > 1 ? 3 : 0;
  let offset = 0;

  return (
    <svg className="donut" viewBox={`0 0 ${size} ${size}`} role="img"
         aria-label={shown.map(s => `${s.label}: ${s.value}`).join(', ')}>
      <circle cx={mid} cy={mid} r={r} fill="none" stroke="#1d1d1d" strokeWidth={stroke} />
      {total > 0 && shown.map(s => {
        const len = (s.value / total) * c;
        const el = (
          <circle key={s.label} className="dseg" cx={mid} cy={mid} r={r} fill="none"
                  stroke={s.color} strokeWidth={stroke}
                  strokeDasharray={`${Math.max(0, len - gap)} ${c}`} strokeDashoffset={-offset}
                  transform={`rotate(-90 ${mid} ${mid})`} />
        );
        offset += len;
        return el;
      })}
      <text x={mid} y={mid + 6} textAnchor="middle" className="dbig">{label}</text>
      <text x={mid} y={mid + 28} textAnchor="middle" className="dsub">{sub}</text>
    </svg>
  );
}

/* Horizontal bars. items: [{ label, value, color? }] */
export function Bars({ items }) {
  const max = Math.max(1, ...items.map(i => i.value));
  return (
    <div className="bars">
      {items.map((i, idx) => (
        <div className="bar" key={i.label}>
          <span className="bl">{i.label}</span>
          <span className="bt">
            <i style={{ width: `${(i.value / max) * 100}%`, background: i.color || '#FF0065', animationDelay: `${idx * 70}ms` }} />
          </span>
          <b>{i.value}</b>
        </div>
      ))}
    </div>
  );
}