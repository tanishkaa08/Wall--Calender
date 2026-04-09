import React from 'react';
import { useState } from "react";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { PRIORITIES } from "../../data/calendarData";

export default function NoteCreator({ startDate, endDate, dayCount, onSave, onCancel, theme }) {
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("ui");

  const handleSave = () => {
    if (!text.trim()) return;
    onSave(text.trim(), priority);
    setText("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="w-full rounded-lg p-4 relative"
      style={{
        background: "var(--paper)",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)",
        border: `2px solid ${theme.accent}30`,
      }}
      data-testid="note-creator"
    >
      <button
        onClick={onCancel}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition-colors"
        data-testid="note-creator-cancel"
      >
        <X size={14} style={{ color: "var(--text-muted)" }} />
      </button>

      {/* Date Range Header */}
      <div className="mb-3">
        <div className="text-xs uppercase tracking-wider font-medium" style={{ color: theme.accent, fontFamily: "'Outfit', sans-serif" }}>
          New Task
        </div>
        <div className="text-sm mt-0.5" style={{ color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>
          {startDate} - {endDate} <span className="opacity-60">({dayCount} days)</span>
        </div>
      </div>

      {/* Text Input */}
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        placeholder="What needs to be done?"
        className="w-full px-3 py-2 rounded-md border outline-none text-sm mb-3 transition-colors"
        style={{
          borderColor: "rgba(0,0,0,0.1)",
          fontFamily: "'Caveat', cursive",
          fontSize: "16px",
          background: "transparent",
          color: "var(--text-primary)",
        }}
        autoFocus
        data-testid="note-creator-input"
      />

      {/* Priority Picker */}
      <div className="mb-3">
        <div className="text-[10px] uppercase tracking-wider mb-1.5 font-medium" style={{ color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
          Priority
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {PRIORITIES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPriority(p.id)}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                background: priority === p.id ? p.bg : "transparent",
                border: `1.5px solid ${priority === p.id ? p.color : "rgba(0,0,0,0.08)"}`,
                color: priority === p.id ? p.color : "var(--text-secondary)",
                fontFamily: "'Outfit', sans-serif",
              }}
              data-testid={`priority-${p.id}`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: p.color }} />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!text.trim()}
        className="w-full py-2 rounded-md text-white text-sm font-medium transition-all hover:scale-[1.02] disabled:opacity-40"
        style={{ background: theme.accent, fontFamily: "'Outfit', sans-serif" }}
        data-testid="note-creator-save"
      >
        Save Task
      </button>
    </motion.div>
  );
}
