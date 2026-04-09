import React from 'react';
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, FileText, CalendarDays, StickyNote } from "lucide-react";
import { format, parse } from "date-fns";

export default function NotesPanel({
  year,
  month,
  monthName,
  selectedDate,
  monthMemo,
  onMonthMemoChange,
  monthDateNotes,
  onAddNote,
  onDeleteNote,
  theme,
}) {
  const [noteText, setNoteText] = useState("");
  const [activeTab, setActiveTab] = useState("notes");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const targetDateStr = selectedDate
    ? format(selectedDate, "yyyy-MM-dd")
    : format(new Date(year, month, new Date().getDate()), "yyyy-MM-dd");

  const targetDateLabel = selectedDate
    ? format(selectedDate, "MMM d, yyyy")
    : "Today";

  useEffect(() => {
    if (selectedDate && inputRef.current) {
      inputRef.current.focus();
    }
  }, [selectedDate]);

  const handleSave = () => {
    if (!noteText.trim()) return;
    onAddNote(targetDateStr, noteText.trim());
    setNoteText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  const totalNotes = monthDateNotes.reduce((sum, e) => sum + e.notes.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
      className="notes-panel-container"
      data-testid="notes-panel"
    >
      {/* Pushpin */}
      <div className="pushpin" />

      {/* Header */}
      <div className="mb-3">
        <h3
          className="text-sm uppercase tracking-[0.2em] font-medium"
          style={{ color: theme?.accent || "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}
        >
          Notes
        </h3>
        <p
          className="text-xs mt-0.5"
          style={{ color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}
        >
          {monthName} {year}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-3 p-0.5 rounded-lg" style={{ background: "rgba(0,0,0,0.04)" }}>
        <button
          onClick={() => setActiveTab("notes")}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all"
          style={{
            background: activeTab === "notes" ? "white" : "transparent",
            color: activeTab === "notes" ? (theme?.accent || "var(--text-primary)") : "var(--text-muted)",
            boxShadow: activeTab === "notes" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            fontFamily: "'Outfit', sans-serif",
          }}
          data-testid="tab-notes"
        >
          <FileText size={12} />
          Notes {totalNotes > 0 && `(${totalNotes})`}
        </button>
        <button
          onClick={() => setActiveTab("memo")}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all"
          style={{
            background: activeTab === "memo" ? "white" : "transparent",
            color: activeTab === "memo" ? (theme?.accent || "var(--text-primary)") : "var(--text-muted)",
            boxShadow: activeTab === "memo" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            fontFamily: "'Outfit', sans-serif",
          }}
          data-testid="tab-memo"
        >
          <StickyNote size={12} />
          Memo
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "notes" && (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {/* Add note form */}
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <CalendarDays size={12} style={{ color: theme?.accent || "var(--text-secondary)" }} />
                <span
                  className="text-xs font-medium"
                  style={{ color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}
                >
                  {targetDateLabel}
                </span>
              </div>
              <div className="flex gap-1.5">
                <input
                  ref={inputRef}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a note..."
                  className="flex-1 px-2.5 py-1.5 text-sm rounded-md border outline-none transition-all"
                  style={{
                    borderColor: "rgba(0,0,0,0.1)",
                    fontFamily: "'Caveat', cursive",
                    fontSize: "15px",
                    background: "rgba(255,255,255,0.6)",
                  }}
                  data-testid="add-note-input"
                />
                <button
                  onClick={handleSave}
                  disabled={!noteText.trim()}
                  className="px-2.5 py-1.5 rounded-md text-white text-xs font-medium transition-all hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                  style={{
                    background: theme?.accent || "var(--accent-border)",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                  data-testid="save-note-btn"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Notes list */}
            <div className="notes-scroll" style={{ maxHeight: "260px", overflowY: "auto" }}>
              <AnimatePresence>
                {monthDateNotes.length === 0 && (
                  <p
                    className="text-center py-4 text-xs"
                    style={{ color: "var(--text-muted)", fontFamily: "'Caveat', cursive", fontSize: "15px" }}
                  >
                    No notes yet. Click a date and add one!
                  </p>
                )}
                {monthDateNotes.map(({ dateStr, notes }) => (
                  <div key={dateStr} className="mb-2">
                    <div
                      className="text-xs font-medium mb-1 uppercase tracking-wider"
                      style={{ color: theme?.accent || "var(--text-secondary)", fontFamily: "'Outfit', sans-serif", fontSize: "10px" }}
                    >
                      {(() => {
                        try {
                          return format(parse(dateStr, "yyyy-MM-dd", new Date()), "EEE, MMM d");
                        } catch {
                          return dateStr;
                        }
                      })()}
                    </div>
                    {notes.map((note) => (
                      <motion.div
                        key={note.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-2 group py-1 px-2 rounded-md hover:bg-black/3 transition-colors"
                        data-testid={`note-item-${note.id}`}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                          style={{ background: theme?.accent || "var(--accent-border)" }}
                        />
                        <span
                          className="flex-1 text-sm leading-snug"
                          style={{ fontFamily: "'Caveat', cursive", fontSize: "16px", color: "var(--text-primary)" }}
                        >
                          {note.text}
                        </span>
                        <button
                          onClick={() => onDeleteNote(dateStr, note.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"
                          data-testid={`delete-note-${note.id}`}
                          aria-label="Delete note"
                        >
                          <Trash2 size={12} className="text-red-400" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {activeTab === "memo" && (
          <motion.div
            key="memo"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: "repeating-linear-gradient(transparent, transparent 27px, rgba(0,0,0,0.06) 27px, rgba(0,0,0,0.06) 28px)",
                  backgroundPosition: "0 3px",
                }}
              />
              <textarea
                value={monthMemo}
                onChange={(e) => onMonthMemoChange(e.target.value)}
                placeholder={`Write your ${monthName} memo here...`}
                className="w-full bg-transparent border-none outline-none resize-none notes-scroll"
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: "17px",
                  lineHeight: "28px",
                  color: "var(--text-primary)",
                  minHeight: "196px",
                  padding: "3px 0",
                }}
                data-testid="month-memo-textarea"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
