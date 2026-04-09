import React, { useState, useCallback, useEffect, useMemo } from "react";
import { addMonths, subMonths, format, isBefore, isSameDay, differenceInCalendarDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import CalendarPaper from "./calendarPaper";
import StickyNote from "./sticyNotes";
import MascotBuddy from "./mascotBuddy";
import NoteCreator from "./noteCreator";
import WeatherWidget from "./weatherWidget";
import { useCalendarStore } from "../../hooks/useCalendarStore";
import { MONTH_IMAGES, getMonthTheme } from "../../data/calendarData";

// Paper rustle sound using Web Audio API
const playPageSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const dur = 0.18;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) {
      const t = i / ctx.sampleRate;
      const env = Math.exp(-t * 25) * 0.15;
      ch[i] = (Math.random() * 2 - 1) * env;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 2500;
    filter.Q.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.value = 0.3;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start();
    src.onended = () => ctx.close();
  } catch {}
};

export default function WallScene() {
  const [viewDate, setViewDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [selectedRange, setSelectedRange] = useState({ start: null, end: null });
  const [lastClickedDate, setLastClickedDate] = useState(null);
  const [showNoteCreator, setShowNoteCreator] = useState(false);
  const store = useCalendarStore();
  const [darkMode, setDarkMode] = useState(store.getDarkMode());

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const theme = getMonthTheme(month);
  const monthData = MONTH_IMAGES[month];

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDark = () => { const next = !darkMode; setDarkMode(next); store.setDarkMode(next); };

  const goNext = useCallback(() => { setDirection(1); setViewDate(d => addMonths(d, 1)); setSelectedRange({ start: null, end: null }); setLastClickedDate(null); setShowNoteCreator(false); playPageSound(); }, []);
  const goPrev = useCallback(() => { setDirection(-1); setViewDate(d => subMonths(d, 1)); setSelectedRange({ start: null, end: null }); setLastClickedDate(null); setShowNoteCreator(false); playPageSound(); }, []);

  useEffect(() => {
    const h = (e) => { if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return; if (e.key === "ArrowRight") goNext(); if (e.key === "ArrowLeft") goPrev(); };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev]);

  const handleDayClick = useCallback((date) => {
    setLastClickedDate(date);
    setSelectedRange((prev) => {
      if (!prev.start || (prev.start && prev.end)) return { start: date, end: null };
      if (isSameDay(date, prev.start)) return { start: null, end: null };
      if (isBefore(date, prev.start)) return { start: date, end: prev.start };
      return { start: prev.start, end: date };
    });
  }, []);

  useEffect(() => {
    if (selectedRange.start && selectedRange.end) setShowNoteCreator(true);
    else setShowNoteCreator(false);
  }, [selectedRange]);

  const monthStickyNotes = store.getMonthStickyNotes(year, month);
  const customImage = store.getCustomImage(month);

  const rangeDayCount = useMemo(() => {
    if (selectedRange.start && selectedRange.end) return differenceInCalendarDays(selectedRange.end, selectedRange.start) + 1;
    return 0;
  }, [selectedRange]);

  const goToday = useCallback(() => { setDirection(0); setViewDate(new Date()); setSelectedRange({ start: null, end: null }); setLastClickedDate(null); }, []);
  const handleYearChange = useCallback((ny) => { setDirection(ny > year ? 1 : -1); setViewDate(new Date(ny, month, 1)); setSelectedRange({ start: null, end: null }); playPageSound(); }, [year, month]);
  const handleMonthJump = useCallback((tm) => { setDirection(tm > month ? 1 : -1); setViewDate(new Date(year, tm, 1)); setSelectedRange({ start: null, end: null }); playPageSound(); }, [year, month]);

  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== "string") return;
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        const sc = Math.min(1, 800 / img.width);
        c.width = img.width * sc;
        c.height = img.height * sc;
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        store.setCustomImage(month, c.toDataURL("image/jpeg", 0.65));
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }, [month, store]);

  const handleSaveNote = useCallback((text, priority) => {
    if (!selectedRange.start || !selectedRange.end) return;
    store.addStickyNote(format(selectedRange.start, "yyyy-MM-dd"), format(selectedRange.end, "yyyy-MM-dd"), text, priority);
    setSelectedRange({ start: null, end: null });
    setShowNoteCreator(false);
  }, [selectedRange, store]);

  const mascotMood = monthStickyNotes.length === 0 ? "sleeping" : showNoteCreator ? "writing" : "happy";

  // Weather date strings for the selected range
  const weatherStart = selectedRange.start ? format(selectedRange.start, "yyyy-MM-dd") : null;
  const weatherEnd = selectedRange.end ? format(selectedRange.end, "yyyy-MM-dd") : null;

  return (
    <div className="wall-background" data-testid="wall-scene">
      <svg className="wall-noise" aria-hidden="true"><filter id="wallNoise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter><rect width="100%" height="100%" filter="url(#wallNoise)" /></svg>

      {/* Dark mode toggle */}
      <motion.button
        onClick={toggleDark}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-colors"
        style={{ background: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)", backdropFilter: "blur(10px)", border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"}` }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        data-testid="dark-mode-toggle"
        aria-label="Toggle dark mode"
      >
        {darkMode ? <Sun size={18} color="#F4D35E" /> : <Moon size={18} color="#5E705B" />}
      </motion.button>

      {/* Main Layout */}
      <div className="relative z-10 flex flex-col lg:flex-row items-start justify-center gap-4 lg:gap-6 px-4 sm:px-6 lg:px-8 pt-6 pb-8 md:pt-12 md:pb-6" data-testid="calendar-layout">

        {/* Calendar Column with Nail */}
        <div className="relative w-full max-w-[540px] mx-auto lg:mx-0 lg:ml-auto" style={{ paddingTop: "40px" }}>
          {/* Nail - centered on calendar */}
          <div className="absolute left-1/2 -translate-x-1/2 z-30 hidden lg:block" style={{ top: "0px" }} data-testid="wall-nail">
            <svg width="28" height="40" viewBox="0 0 28 40">
              {/* Nail shadow on wall */}
              <ellipse cx="14" cy="36" rx="8" ry="2.5" fill="rgba(0,0,0,0.12)" />
              {/* Shaft */}
              <rect x="12" y="22" width="4" height="16" rx="2" fill="url(#nailShaft2)" />
              {/* Head - dome shape */}
              <ellipse cx="14" cy="16" rx="12" ry="10" fill="url(#nailHead2)" stroke="#555" strokeWidth="0.6" />
              {/* Head bevel ring */}
              <ellipse cx="14" cy="16" rx="9" ry="7.5" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
              {/* Specular highlight */}
              <ellipse cx="10" cy="12" rx="5" ry="3.5" fill="url(#nailSpec2)" />
              {/* Center dimple */}
              <circle cx="14" cy="16" r="2.5" fill="rgba(0,0,0,0.12)" />
              <circle cx="13.5" cy="15.5" r="1" fill="rgba(255,255,255,0.15)" />
              <defs>
                <radialGradient id="nailHead2" cx="0.4" cy="0.35">
                  <stop offset="0%" stopColor="#C0C0C0" />
                  <stop offset="40%" stopColor="#999" />
                  <stop offset="80%" stopColor="#777" />
                  <stop offset="100%" stopColor="#555" />
                </radialGradient>
                <linearGradient id="nailShaft2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#999" />
                  <stop offset="50%" stopColor="#777" />
                  <stop offset="100%" stopColor="#666" />
                </linearGradient>
                <radialGradient id="nailSpec2" cx="0.3" cy="0.3">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              </defs>
            </svg>
          </div>

          {/* String from nail to calendar */}
          <svg className="absolute left-1/2 -translate-x-1/2 z-20 hidden lg:block" style={{ top: "30px", width: "70px", height: "22px" }} aria-hidden="true">
            <path d="M 35 0 C 18 8 15 18 25 20 M 35 0 C 52 8 55 18 45 20" stroke={darkMode ? "rgba(200,200,200,0.3)" : "rgba(80,75,65,0.5)"} strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </svg>

          <CalendarPaper
            year={year} month={month} direction={direction} selectedRange={selectedRange}
            onDayClick={handleDayClick} onNext={goNext} onPrev={goPrev} onGoToday={goToday}
            onYearChange={handleYearChange} rangeDayCount={rangeDayCount} theme={theme}
            customImage={customImage} onImageUpload={handleImageUpload}
            onImageClear={() => store.clearCustomImage(month)} onMonthJump={handleMonthJump}
            darkMode={darkMode}
          />
        </div>

        {/* Side Panel: Mascot + Notes */}
        <div className="w-full max-w-[540px] lg:max-w-[300px] mx-auto lg:mx-0 lg:mr-auto flex flex-col items-center gap-2 lg:pt-12">
          {/* Mascot */}
          <div className="flex flex-col items-center">
            <MascotBuddy mood={mascotMood} size={65} />
            <p className="text-xs mt-1" style={{ fontFamily: "'Caveat', cursive", color: "var(--text-muted)", fontSize: "14px" }}>
              {mascotMood === "sleeping" ? "Your task buddy is resting..." : mascotMood === "writing" ? "Creating a new task!" : "Ready to help!"}
            </p>
          </div>

          {/* Note Creator (when range selected) */}
          <AnimatePresence>
            {showNoteCreator && selectedRange.start && selectedRange.end && (
              <NoteCreator
                startDate={format(selectedRange.start, "MMM d")}
                endDate={format(selectedRange.end, "MMM d, yyyy")}
                dayCount={rangeDayCount}
                onSave={handleSaveNote}
                onCancel={() => { setSelectedRange({ start: null, end: null }); setShowNoteCreator(false); }}
                theme={theme}
              />
            )}
          </AnimatePresence>

          {/* Weather Widget when range is selected */}
          {weatherStart && weatherEnd && (
            <WeatherWidget startDate={weatherStart} endDate={weatherEnd} theme={theme} />
          )}

          {/* Sticky Notes */}
          <div className="w-full flex flex-col gap-1">
            <AnimatePresence>
              {monthStickyNotes.map((note, i) => (
                <StickyNote
                  key={note.id}
                  note={note}
                  onDelete={() => store.deleteStickyNote(note.id)}
                  rotation={i % 3 === 0 ? -1.5 : i % 3 === 1 ? 1.2 : -0.5}
                />
              ))}
            </AnimatePresence>
            {monthStickyNotes.length === 0 && !showNoteCreator && (
              <div className="text-center py-4" style={{ color: "var(--text-muted)", fontFamily: "'Caveat', cursive", fontSize: "16px" }}>
                Select a date range to create tasks
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
