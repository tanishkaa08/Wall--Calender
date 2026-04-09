import React from 'react';
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog, Thermometer, Wind } from "lucide-react";

/** Open-Meteo daily forecast slice we use from the API */
type DailyWeather = {
  time?: string[];
  weather_code?: number[];
  weathercode?: number[];
  temperature_2m_max?: number[];
  temperature_2m_min?: number[];
  wind_speed_10m_max?: number[];
  windspeed_10m_max?: number[];
};

const WMO_MAP: Record<number, { icon: typeof Sun; label: string; color: string }> = {
  0: { icon: Sun, label: "Clear", color: "#F59E0B" },
  1: { icon: Sun, label: "Mostly Clear", color: "#F59E0B" },
  2: { icon: Cloud, label: "Partly Cloudy", color: "#94A3B8" },
  3: { icon: Cloud, label: "Overcast", color: "#64748B" },
  45: { icon: CloudFog, label: "Foggy", color: "#94A3B8" },
  48: { icon: CloudFog, label: "Rime Fog", color: "#94A3B8" },
  51: { icon: CloudDrizzle, label: "Light Drizzle", color: "#60A5FA" },
  53: { icon: CloudDrizzle, label: "Drizzle", color: "#3B82F6" },
  55: { icon: CloudDrizzle, label: "Heavy Drizzle", color: "#2563EB" },
  61: { icon: CloudRain, label: "Light Rain", color: "#60A5FA" },
  63: { icon: CloudRain, label: "Rain", color: "#3B82F6" },
  65: { icon: CloudRain, label: "Heavy Rain", color: "#1D4ED8" },
  71: { icon: CloudSnow, label: "Light Snow", color: "#CBD5E1" },
  73: { icon: CloudSnow, label: "Snow", color: "#94A3B8" },
  75: { icon: CloudSnow, label: "Heavy Snow", color: "#64748B" },
  80: { icon: CloudRain, label: "Showers", color: "#60A5FA" },
  81: { icon: CloudRain, label: "Heavy Showers", color: "#3B82F6" },
  82: { icon: CloudRain, label: "Violent Showers", color: "#1D4ED8" },
  95: { icon: CloudLightning, label: "Thunderstorm", color: "#8B5CF6" },
  96: { icon: CloudLightning, label: "Hail Storm", color: "#7C3AED" },
  99: { icon: CloudLightning, label: "Heavy Hail", color: "#6D28D9" },
};

const getWeatherInfo = (code: number | undefined) =>
  (code != null && WMO_MAP[code]) || { icon: Cloud, label: "Unknown", color: "#94A3B8" };

export default function WeatherWidget({ startDate, endDate, theme }: { startDate: string; endDate: string; theme?: { accent?: string } }) {
  const [weather, setWeather] = useState<DailyWeather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!startDate || !endDate) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    // Default to Delhi, India
    const lat = 28.6139;
    const lon = 77.2090;

    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weather_code,wind_speed_10m_max&timezone=Asia/Kolkata&start_date=${startDate}&end_date=${endDate}`,
      { signal: controller.signal }
    )
      .then((r) => {
        if (!r.ok) throw new Error("Forecast unavailable for selected dates");
        return r.json();
      })
      .then((data) => {
        if (data.daily) setWeather(data.daily);
        else setError("No data");
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError(e.message || "Weather unavailable");
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className="w-full rounded-lg p-3 mt-2"
        style={{ background: "var(--paper)", border: "1px solid rgba(128,128,128,0.12)" }}
        data-testid="weather-widget-loading"
      >
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${theme?.accent || '#888'} transparent ${theme?.accent || '#888'} ${theme?.accent || '#888'}` }} />
          <span className="text-xs" style={{ color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>Loading weather...</span>
        </div>
      </motion.div>
    );
  }

  if (error || !weather) return null;

  const days = weather.time?.slice(0, 7) || [];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -10 }}
        className="w-full rounded-lg p-3 mt-1"
        style={{
          background: "var(--paper)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          border: "1px solid rgba(128,128,128,0.1)",
        }}
        data-testid="weather-widget"
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Thermometer size={12} style={{ color: theme?.accent || "var(--text-muted)" }} />
          <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: theme?.accent || "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
            Weather Forecast (Delhi)
          </span>
        </div>

        <div className="flex flex-col gap-1">
          {days.map((date, i) => {
            const code = weather.weather_code?.[i] ?? weather.weathercode?.[i];
            const info = getWeatherInfo(code);
            const Icon = info.icon;
            const hi = Math.round(weather.temperature_2m_max?.[i] ?? 0);
            const lo = Math.round(weather.temperature_2m_min?.[i] ?? 0);
            const dayName = new Date(date + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
            const wind = Math.round(weather.wind_speed_10m_max?.[i] || weather.windspeed_10m_max?.[i] || 0);

            return (
              <div
                key={date}
                className="flex items-center justify-between py-1 px-1.5 rounded"
                style={{ background: i % 2 === 0 ? "rgba(128,128,128,0.04)" : "transparent" }}
                data-testid={`weather-day-${date}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Icon size={14} style={{ color: info.color, flexShrink: 0 }} />
                  <span className="text-[11px] truncate" style={{ color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>
                    {dayName}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px]" style={{ color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
                    {info.label}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Wind size={9} style={{ color: "var(--text-muted)" }} />
                    <span className="text-[9px]" style={{ color: "var(--text-muted)" }}>{wind}</span>
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums" style={{ color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", minWidth: "52px", textAlign: "right" }}>
                    {lo}° / {hi}°
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
