"use client";

import React, { useEffect } from 'react';
import { displayName, initials } from '../_lib/helpers';

export function Avatar({ p, photo, size = 48 }) {
  const src = photo !== undefined ? photo : p.photo;
  return (
    <span className="av" style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }} aria-hidden="true">
      {src ? <img src={src} alt="" /> : initials(displayName(p))}
    </span>
  );
}

export function Loader({ label }) {
  return (
    <div className="ldr">
      <svg className="tri" viewBox="0 0 46 42" aria-hidden="true"><path d="M23 3 L43 39 L3 39 Z" pathLength="100" /></svg>
      {label && <span>{label}</span>}
    </div>
  );
}

export function useEscape(handler) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') handler(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handler]);
}