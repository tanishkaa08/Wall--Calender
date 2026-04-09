import React from 'react';
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { format, parse } from "date-fns";
import { getPriority } from "../../data/calendarData";

const formatDateStr = (ds) => {
  try { return format(parse(ds, "yyyy-MM-dd", new Date()), "MMM d"); } catch { return ds; }
};

const PushPin = ({ color = "#E53935" }) => (
  <div className="pushpin-wrapper" style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
    {/* Pin shadow on paper */}
    <div style={{ position: "absolute", top: "16px", left: "50%", transform: "translateX(-50%)", width: "10px", height: "4px", borderRadius: "50%", background: "rgba(0,0,0,0.15)", filter: "blur(2px)" }} />
    <svg width="22" height="26" viewBox="0 0 22 26">
      {/* Pin shaft */}
      <rect x="9.5" y="14" width="3" height="10" rx="1.5" fill="#888" stroke="#666" strokeWidth="0.5" />
      {/* Pin head */}
      <circle cx="11" cy="10" r="9" fill={`url(#pinGrad-${color.replace('#','')})`} stroke="rgba(0,0,0,0.2)" strokeWidth="0.8" />
      {/* Highlight */}
      <ellipse cx="8" cy="7.5" rx="3.5" ry="2.5" fill="rgba(255,255,255,0.35)" />
      {/* Small center dot */}
      <circle cx="11" cy="10" r="2" fill="rgba(0,0,0,0.12)" />
      <defs>
        <radialGradient id={`pinGrad-${color.replace('#','')}`} cx="0.4" cy="0.35">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="60%" stopColor={color} />
          <stop offset="100%" stopColor="rgba(0,0,0,0.3)" />
        </radialGradient>
      </defs>
    </svg>
  </div>
);

const STICKY_COLORS = {
  ui: { bg: "#FFF3B0", edge: "#FFE066" },
  uu: { bg: "#FFE0B2", edge: "#FFB74D" },
  ni: { bg: "#BBDEFB", edge: "#64B5F6" },
  nn: { bg: "#C8E6C9", edge: "#81C784" },
};

interface StickyNoteProps extends React.Attributes {
  note: any;
  onDelete: () => void;
  rotation?: number;
}

export default function StickyNote({ note, onDelete, rotation = 0 }: StickyNoteProps)  {
  const p = getPriority(note.priority);
  const stickyColor = STICKY_COLORS[note.priority] || STICKY_COLORS.ui;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, rotate: rotation }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      exit={{ opacity: 0, x: 50, scale: 0.8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="sticky-note-realistic group"
      style={{
        position: "relative",
        background: stickyColor.bg,
        padding: "18px 14px 12px",
        marginTop: "14px",
        transform: `rotate(${rotation}deg)`,
        boxShadow: `2px 4px 12px rgba(0,0,0,0.12), 1px 2px 4px rgba(0,0,0,0.06)`,
        borderRadius: "1px",
        minHeight: "70px",
      }}
      data-testid={`sticky-note-${note.id}`}
    >
      {/* Pushpin */}
      <PushPin color={p.color} />

      {/* Folded corner effect */}
      <div style={{
        position: "absolute",
        bottom: 0,
        right: 0,
        width: "18px",
        height: "18px",
        background: `linear-gradient(225deg, var(--wall-base) 0%, var(--wall-base) 48%, ${stickyColor.edge} 50%, ${stickyColor.bg} 100%)`,
      }} />

      {/* Priority badge + Delete */}
      <div className="flex items-center justify-between mb-1.5">
        <span
          className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
          style={{ background: `${p.color}18`, color: p.color, fontFamily: "'Outfit', sans-serif" }}
        >
          {p.label}
        </span>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100/50"
          data-testid={`delete-sticky-${note.id}`}
          aria-label="Delete note"
        >
          <Trash2 size={12} className="text-red-400" />
        </button>
      </div>

      {/* Date Range */}
      <div className="text-[10px] mb-1" style={{ color: "rgba(0,0,0,0.45)", fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>
        {formatDateStr(note.startDate)} — {formatDateStr(note.endDate)}
      </div>

      {/* Lined background text */}
      <p className="leading-relaxed" style={{
        fontFamily: "'Caveat', cursive",
        fontSize: "17px",
        color: "rgba(0,0,0,0.75)",
        backgroundImage: "repeating-linear-gradient(transparent, transparent 22px, rgba(0,0,0,0.04) 22px, rgba(0,0,0,0.04) 23px)",
        paddingTop: "2px",
      }}>
        {note.text}
      </p>
    </motion.div>
  );
}
