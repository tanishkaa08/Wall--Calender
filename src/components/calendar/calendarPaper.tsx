import React from 'react';
import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Camera, X } from "lucide-react";
import { MONTH_IMAGES, getMonthTheme } from "../../data/calendarData";
import DateGrid from "./dateGrid";

const flipVariants = {
  enter: (dir) => ({
    rotateX: dir > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.95,
    y: dir > 0 ? 10 : -10,
    filter: "brightness(0.85)",
  }),
  center: {
    rotateX: 0, opacity: 1, scale: 1, y: 0, filter: "brightness(1)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (dir) => ({
    rotateX: dir > 0 ? -90 : 90,
    opacity: 0,
    scale: 0.95,
    y: dir > 0 ? -15 : 15,
    filter: "brightness(0.7)",
    transition: { duration: 0.55, ease: [0.55, 0, 1, 0.45] },
  }),
};

const SpiralBinding = () => (
  <div className="relative w-full" style={{ height: "22px", zIndex: 15 }} data-testid="spiral-binding">
    <svg viewBox="0 0 540 28" className="w-full h-full" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="spiralGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C0C0C0" />
          <stop offset="30%" stopColor="#A0A0A0" />
          <stop offset="50%" stopColor="#707070" />
          <stop offset="70%" stopColor="#A0A0A0" />
          <stop offset="100%" stopColor="#B0B0B0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 16 }).map((_, i) => {
        const cx = 15 + (i * 510) / 15;
        return (
          <g key={i}>
            <ellipse cx={cx} cy={6} rx={9} ry={12} fill="none" stroke="url(#spiralGrad)" strokeWidth="3" style={{ filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.25))" }} />
            <ellipse cx={cx} cy={22} rx={5} ry={2} fill="rgba(0,0,0,0.06)" />
          </g>
        );
      })}
    </svg>
  </div>
);

const SeasonalParticles = ({ season }) => {
  const getSeasonConfig = () => {
    switch (season) {
      case "winter":
        return { n: 8, cls: "particle-snow", d: [4, 5, 6, 3.5, 7, 4.5, 5.5, 6.5] };
      case "spring":
        return { n: 6, cls: "particle-petal", d: [5, 6.5, 4, 7, 5.5, 8] };
      case "summer":
        return { n: 5, cls: "particle-firefly", d: [3, 4, 3.5, 5, 4.5] };
      case "autumn":
        return { n: 7, cls: "particle-leaf", d: [5, 6, 4.5, 7, 5.5, 8, 6.5] };
      default:
        return { n: 0, cls: "", d: [] };
    }
  };
  const c = getSeasonConfig();
  return <>{Array.from({ length: c.n }).map((_, i) => <div key={i} className={`particle ${c.cls}`} style={{ left: `${10 + (i * 80) / c.n + Math.random() * 8}%`, top: `${Math.random() * 30}%`, animationDuration: `${c.d[i]}s`, animationDelay: `${i * 0.7}s`, opacity: 0 }} />)}</>;
};

const HeroImage = ({ month, year, monthName, imageUrl, alt, theme, customImage, onImageUpload, onImageClear }) => {
  const [loaded, setLoaded] = useState(false);
  const fileRef = useRef(null);
  const displayImage = customImage || imageUrl;
  return (
    <div className="relative w-full overflow-hidden group" style={{ height: "clamp(155px, 28vw, 240px)" }}>
      <img src={displayImage} alt={alt} className="w-full h-full object-cover transition-all duration-700"
        style={{ filter: customImage ? "none" : "grayscale(12%) sepia(6%) contrast(1.05)", opacity: loaded ? 1 : 0 }}
        onLoad={() => setLoaded(true)} data-testid="hero-image" />
      {!loaded && <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f?.type.startsWith("image/")) onImageUpload(f); e.target.value = ""; }} data-testid="image-upload-input" />
      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <button onClick={() => fileRef.current?.click()} className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} data-testid="upload-image-btn"><Camera size={14} /></button>
        {customImage && <button onClick={onImageClear} className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} data-testid="clear-image-btn"><X size={14} /></button>}
      </div>
      <div className="absolute bottom-0 left-0 w-full h-24 hero-geometric-left" style={{ background: theme.geo1 }} />
      <div className="absolute bottom-0 right-0 w-full h-20 hero-geometric-right" style={{ background: theme.geo2 }} />
      <div className="absolute bottom-4 right-5 z-10 text-right" data-testid="month-year-display">
        <div className="text-sm tracking-[0.3em] text-white/80" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300 }}>{year}</div>
        <div className="text-2xl sm:text-3xl text-white tracking-wider" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600 }}>{monthName.toUpperCase()}</div>
      </div>
      <div className="absolute bottom-3 left-4 z-10 max-w-[180px] hidden sm:block">
        <p className="text-[10px] text-white/70 italic leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{theme.quote}</p>
      </div>
      <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 -30px 30px -20px rgba(0,0,0,0.1)" }} />
      <SeasonalParticles season={theme.season} />
    </div>
  );
};

export default function CalendarPaper({
  year, month, direction, selectedRange, onDayClick, onNext, onPrev,
  onGoToday, onYearChange, rangeDayCount, theme, customImage,
  onImageUpload, onImageClear, onMonthJump, darkMode,
}) {
  const monthData = MONTH_IMAGES[month];
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true });
  const [showYearPicker, setShowYearPicker] = useState(false);
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const prevMonthName = MONTH_IMAGES[(month + 11) % 12].name;
  const nextMonthName = MONTH_IMAGES[(month + 1) % 12].name;

  const handleDragEnd = (_, info) => { if (info.offset.x > 80) onPrev(); else if (info.offset.x < -80) onNext(); };
  const yearRange = Array.from({ length: 7 }, (_, i) => year - 3 + i);

  return (
    <motion.div ref={containerRef} className="page-edges" data-testid="calendar-paper-container"
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}>
      <SpiralBinding />
      <div className="flip-perspective">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div key={`${year}-${month}`} custom={direction} variants={flipVariants}
            initial="enter" animate="center" exit="exit"
            drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12} onDragEnd={handleDragEnd}
            style={{ transformOrigin: "top center", backfaceVisibility: "hidden" }}
            className="calendar-paper paper-texture" data-testid="calendar-page">

            <HeroImage month={month} year={year} monthName={monthData.name} imageUrl={monthData.image}
              alt={monthData.alt} theme={theme} customImage={customImage}
              onImageUpload={onImageUpload} onImageClear={onImageClear} />

            <div className="px-4 sm:px-6 pt-3 pb-4">
              {/* Month Name Navigation: "March < APRIL > May" */}
              <div className="flex items-center justify-between mb-2">
                <button onClick={onPrev} className="nav-arrow flex items-center gap-1 px-2 py-1 rounded-md"
                  data-testid="prev-month-btn" aria-label="Previous month">
                  <span className="text-xs font-medium" style={{ color: theme.accent, fontFamily: "'Outfit', sans-serif" }}>{prevMonthName}</span>
                </button>

                <div className="text-center select-none flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-bold tracking-wide" style={{ color: "var(--text-primary)", fontFamily: "'Cormorant Garamond', serif" }}>
                    {monthData.name}
                  </span>
                  <div className="relative">
                    <button onClick={() => setShowYearPicker(p => !p)}
                      className="text-sm font-light tracking-widest hover:underline underline-offset-4 transition-all"
                      style={{ color: theme.accent, fontFamily: "'Cormorant Garamond', serif" }}
                      data-testid="year-picker-btn">{year}</button>
                    <AnimatePresence>
                      {showYearPicker && (
                        <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.2 }}
                          className="absolute top-full mt-1 left-1/2 -translate-x-1/2 rounded-md shadow-lg border py-1 z-50"
                          style={{ background: "var(--paper)", borderColor: "rgba(0,0,0,0.1)" }}
                          data-testid="year-picker-dropdown">
                          {yearRange.map(y => (
                            <button key={y} onClick={() => { onYearChange(y); setShowYearPicker(false); }}
                              className="block w-full px-4 py-1.5 text-sm hover:bg-black/5 transition-colors"
                              style={{ color: y === year ? theme.accent : "var(--text-primary)", fontWeight: y === year ? 600 : 400, fontFamily: "'Outfit', sans-serif" }}
                              data-testid={`year-option-${y}`}>{y}</button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <button onClick={onNext} className="nav-arrow flex items-center gap-1 px-2 py-1 rounded-md"
                  data-testid="next-month-btn" aria-label="Next month">
                  <span className="text-xs font-medium" style={{ color: theme.accent, fontFamily: "'Outfit', sans-serif" }}>{nextMonthName}</span>
                </button>
              </div>

              {/* Today + range count */}
              <div className="flex items-center justify-between mb-2">
                {!isCurrentMonth ? (
                  <button onClick={onGoToday} className="text-xs px-2.5 py-1 rounded-full transition-all hover:scale-105"
                    style={{ background: "var(--today-bg)", color: "var(--today-text)", fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
                    data-testid="go-today-btn">Today</button>
                ) : <div />}
                {rangeDayCount > 0 && (
                  <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    className="text-xs px-2 py-0.5 rounded-full range-indicator"
                    style={{ background: theme.accentLight, color: theme.accent, fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
                    data-testid="range-day-count">{rangeDayCount} day{rangeDayCount !== 1 ? "s" : ""} selected</motion.span>
                )}
              </div>

              <DateGrid year={year} month={month} selectedRange={selectedRange} onDayClick={onDayClick} theme={theme} />

              {/* Mini Month Nav */}
              <div className="flex items-center justify-center gap-1.5 mt-3 pt-3" style={{ borderTop: "1px solid rgba(128,128,128,0.1)" }} data-testid="mini-month-nav">
                {["J","F","M","A","M","J","J","A","S","O","N","D"].map((letter, i) => {
                  const mt = getMonthTheme(i);
                  const isCur = i === month;
                  const isTod = i === new Date().getMonth() && year === new Date().getFullYear();
                  return (
                    <button key={i} onClick={() => onMonthJump(i)}
                      className="relative flex items-center justify-center transition-all hover:scale-125"
                      style={{ width: isCur ? "24px" : "18px", height: isCur ? "24px" : "18px", borderRadius: "50%",
                        background: isCur ? mt.accent : "transparent",
                        border: isTod && !isCur ? `1.5px solid ${mt.accent}` : "none",
                        fontSize: "8px", fontWeight: isCur ? 700 : 400,
                        color: isCur ? "white" : "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}
                      data-testid={`mini-month-${i}`} aria-label={MONTH_IMAGES[i].name}>{letter}</button>
                  );
                })}
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-8 h-8 pointer-events-none"
              style={{ background: "linear-gradient(225deg, var(--wall-base) 0%, var(--wall-base) 40%, transparent 40.5%)", borderRadius: "0 0 3px 0" }} />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
