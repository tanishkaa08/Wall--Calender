import React from 'react';
import { useMemo, useState } from "react";
import { startOfMonth, endOfMonth, getDay, getDaysInMonth, addDays, subDays, isSameDay, isWithinInterval, isToday, format } from "date-fns";
import { DAY_NAMES, getHoliday } from "../../data/calendarData";
import { motion, AnimatePresence } from "framer-motion";

const HolidayTooltip = ({ holiday, theme, visible }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 4, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 4, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 whitespace-nowrap pointer-events-none"
        data-testid="holiday-tooltip"
      >
        <div className="px-2.5 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5"
          style={{ background: theme?.accent || "#D4A355", color: "white", fontFamily: "'Outfit', sans-serif", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
          <span className="text-sm">&#127881;</span>
          <span>{holiday}</span>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0"
          style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: `5px solid ${theme?.accent || "#D4A355"}` }} />
      </motion.div>
    )}
  </AnimatePresence>
);

export default function DateGrid({ year, month, selectedRange, onDayClick, theme }) {
  const [hoveredHoliday, setHoveredHoliday] = useState<string | null>(null);

  const grid = useMemo(() => {
    const first = startOfMonth(new Date(year, month));
    const last = endOfMonth(new Date(year, month));
    const totalDays = getDaysInMonth(new Date(year, month));
    let startDow = getDay(first) - 1;
    if (startDow < 0) startDow = 6;
    const cells: { date: Date; day: number; isCurrent: boolean }[] = [];
    for (let i = startDow - 1; i >= 0; i--) { const d = subDays(first, i + 1); cells.push({ date: d, day: d.getDate(), isCurrent: false }); }
    for (let i = 0; i < totalDays; i++) { const d = addDays(first, i); cells.push({ date: d, day: d.getDate(), isCurrent: true }); }
    const endDow = getDay(last) - 1;
    const remaining = endDow < 0 ? 0 : 6 - endDow;
    for (let i = 1; i <= remaining; i++) { const d = addDays(last, i); cells.push({ date: d, day: d.getDate(), isCurrent: false }); }
    return cells;
  }, [year, month]);

  const getSelectionState = (date) => {
    const { start, end } = selectedRange;
    if (!start) return null;
    if (isSameDay(date, start)) return "start";
    if (end && isSameDay(date, end)) return "end";
    if (end && isWithinInterval(date, { start, end })) return "between";
    return null;
  };

  return (
    <div data-testid="date-grid">
      <div className="grid grid-cols-7 gap-x-1 mb-1.5">
        {DAY_NAMES.map(name => (
          <div key={name} className="text-center text-[10px] sm:text-xs font-semibold tracking-wider uppercase py-1"
            style={{ color: name === "Sat" || name === "Sun" ? theme?.accent || "var(--accent-border)" : "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>
            {name}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-x-1 gap-y-0.5">
        {grid.map((cell, i) => {
          const sel = cell.isCurrent ? getSelectionState(cell.date) : null;
          const today = cell.isCurrent && isToday(cell.date);
          const holiday = cell.isCurrent ? getHoliday(cell.date) : null;
          const hasEnd = !!selectedRange.end;
          const dayOfWeek = i % 7;
          const isFirstInRow = dayOfWeek === 0;
          const isLastInRow = dayOfWeek === 6;
          const dateKey = cell.isCurrent ? format(cell.date, "yyyy-MM-dd") : `pad-${i}`;

          let cls = "day-cell flex flex-col items-center justify-center cursor-pointer relative ";
          if (!cell.isCurrent) cls += "day-muted ";
          else if (sel === "start") cls += `day-selected-start ${hasEnd ? "has-end" : ""} `;
          else if (sel === "end") cls += "day-selected-end has-start ";
          else if (sel === "between") { cls += "day-selected-between "; if (isFirstInRow) cls += "rounded-l-full "; if (isLastInRow) cls += "rounded-r-full "; }
          else if (today) cls += "day-today ";

          const holidayBg = holiday && !sel && !today ? `${theme?.accent || "#D4A355"}15` : undefined;

          return (
            <div
              key={`${dateKey}-${i}`}
              className="relative"
              onMouseEnter={() => holiday && setHoveredHoliday(dateKey)}
              onMouseLeave={() => holiday && setHoveredHoliday(null)}
            >
              {/* Holiday tooltip */}
              {holiday && <HolidayTooltip holiday={holiday} theme={theme} visible={hoveredHoliday === dateKey} />}

              <button className={cls}
                style={{
                  fontFamily: "'Outfit', sans-serif", fontSize: "clamp(12px, 2vw, 15px)",
                  aspectRatio: "1", minHeight: "30px", maxHeight: "42px",
                  background: holidayBg,
                  borderBottom: holiday && !sel ? `2px solid ${theme?.accent || "#D4A355"}` : undefined,
                }}
                onClick={() => cell.isCurrent && onDayClick(cell.date)}
                disabled={!cell.isCurrent}
                data-testid={cell.isCurrent ? `day-${dateKey}` : undefined}
                aria-label={cell.isCurrent ? `${format(cell.date, "MMMM d, yyyy")}${holiday ? ` - ${holiday}` : ""}${today ? " (Today)" : ""}` : undefined}>
                <span className="relative z-10 leading-none">{cell.day}</span>
                {holiday && (
                  <span className="absolute bottom-px left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full" style={{ background: theme?.accent || "var(--holiday-dot)" }} />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
