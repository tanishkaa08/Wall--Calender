import { useState, useCallback } from "react";

const STORAGE_KEY = "wall-calendar-store";
const load = () => { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : {}; } catch { return {}; } };
const persist = (d) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} };
const genId = () => Math.random().toString(36).slice(2, 10);

export const useCalendarStore = () => {
  const [store, setStore] = useState(load);
  const update = useCallback((fn) => { setStore((prev) => { const next = fn(prev); persist(next); return next; }); }, []);

  // Month memo
  const getMonthNotes = useCallback((y, m) => store[`month-${y}-${m}`] || "", [store]);
  const setMonthNotes = useCallback((y, m, t) => update(s => ({ ...s, [`month-${y}-${m}`]: t })), [update]);

  // Range notes (sticky notes with priority)
  // Structure: store["notes"] = [{ id, startDate, endDate, text, priority, createdAt }]
  const getAllNotes = useCallback(() => store.notes || [], [store]);

  const getMonthStickyNotes = useCallback((y, m) => {
    const notes = store.notes || [];
    const prefix = `${y}-${String(m + 1).padStart(2, "0")}`;
    return notes.filter(n => n.startDate.startsWith(prefix) || n.endDate.startsWith(prefix));
  }, [store]);

  const addStickyNote = useCallback((startDate, endDate, text, priority) => {
    update(s => ({
      ...s,
      notes: [...(s.notes || []), { id: genId(), startDate, endDate, text, priority, createdAt: new Date().toISOString() }]
    }));
  }, [update]);

  const deleteStickyNote = useCallback((noteId) => {
    update(s => ({ ...s, notes: (s.notes || []).filter(n => n.id !== noteId) }));
  }, [update]);

  const updateStickyNote = useCallback((noteId, updates) => {
    update(s => ({
      ...s,
      notes: (s.notes || []).map(n => n.id === noteId ? { ...n, ...updates } : n)
    }));
  }, [update]);

  // Custom images
  const getCustomImage = useCallback((m) => store[`img-${m}`] || null, [store]);
  const setCustomImage = useCallback((m, b64) => update(s => ({ ...s, [`img-${m}`]: b64 })), [update]);
  const clearCustomImage = useCallback((m) => update(s => { const n = { ...s }; delete n[`img-${m}`]; return n; }), [update]);

  // Dark mode
  const getDarkMode = useCallback(() => store.darkMode || false, [store]);
  const setDarkMode = useCallback((v) => update(s => ({ ...s, darkMode: v })), [update]);

  return {
    getMonthNotes, setMonthNotes,
    getAllNotes, getMonthStickyNotes, addStickyNote, deleteStickyNote, updateStickyNote,
    getCustomImage, setCustomImage, clearCustomImage,
    getDarkMode, setDarkMode,
  };
};
