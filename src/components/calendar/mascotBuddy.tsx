import { motion } from "framer-motion";
import React from 'react';

const MascotBuddy = ({ mood = "happy", size = 80, className = "" }) => {
  const s = size;
  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={
        mood === "happy"
          ? { y: [0, -4, 0], rotate: [0, 2, -2, 0] }
          : mood === "sleeping"
          ? { y: [0, -2, 0] }
          : {}
      }
      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      data-testid={`mascot-${mood}`}
    >
      <svg viewBox="0 0 120 120" width={s} height={s}>
        {/* Shadow */}
        <ellipse cx="60" cy="110" rx="25" ry="5" fill="rgba(0,0,0,0.08)" />

        {/* Body */}
        <ellipse cx="60" cy="70" rx="32" ry="30" fill="white" stroke="#2C2A25" strokeWidth="2.2" />

        {/* Left wing */}
        <ellipse cx="30" cy="68" rx="10" ry="16" fill="white" stroke="#2C2A25" strokeWidth="1.8"
          transform={mood === "happy" ? "rotate(-15 30 68)" : "rotate(-5 30 68)"} />

        {/* Right wing */}
        <ellipse cx="90" cy="68" rx="10" ry="16" fill="white" stroke="#2C2A25" strokeWidth="1.8"
          transform={mood === "happy" ? "rotate(15 90 68)" : "rotate(5 90 68)"} />

        {/* Feet */}
        <ellipse cx="48" cy="98" rx="8" ry="4" fill="#F4A460" stroke="#2C2A25" strokeWidth="1.2" />
        <ellipse cx="72" cy="98" rx="8" ry="4" fill="#F4A460" stroke="#2C2A25" strokeWidth="1.2" />

        {mood === "sleeping" ? (
          <>
            {/* Closed eyes */}
            <path d="M 46 62 Q 50 66 54 62" stroke="#2C2A25" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 66 62 Q 70 66 74 62" stroke="#2C2A25" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Z Z z */}
            <text x="82" y="40" fill="#2C2A25" fontSize="14" fontWeight="bold" fontFamily="'Caveat', cursive" opacity="0.6">Z</text>
            <text x="92" y="30" fill="#2C2A25" fontSize="10" fontWeight="bold" fontFamily="'Caveat', cursive" opacity="0.4">z</text>
            <text x="98" y="22" fill="#2C2A25" fontSize="8" fontWeight="bold" fontFamily="'Caveat', cursive" opacity="0.3">z</text>
          </>
        ) : mood === "writing" ? (
          <>
            {/* Focused eyes */}
            <circle cx="50" cy="62" r="3.5" fill="#2C2A25" />
            <circle cx="70" cy="62" r="3.5" fill="#2C2A25" />
            <circle cx="51" cy="61" r="1" fill="white" />
            <circle cx="71" cy="61" r="1" fill="white" />
            {/* Pencil in right wing */}
            <line x1="98" y1="55" x2="108" y2="82" stroke="#DAA520" strokeWidth="3" strokeLinecap="round" />
            <line x1="108" y1="82" x2="110" y2="86" stroke="#2C2A25" strokeWidth="2" strokeLinecap="round" />
          </>
        ) : (
          <>
            {/* Happy eyes */}
            <circle cx="50" cy="62" r="3.5" fill="#2C2A25" />
            <circle cx="70" cy="62" r="3.5" fill="#2C2A25" />
            <circle cx="51.5" cy="61" r="1.2" fill="white" />
            <circle cx="71.5" cy="61" r="1.2" fill="white" />
          </>
        )}

        {/* Beak */}
        <path d="M 55 70 L 60 78 L 65 70" fill="#F4A460" stroke="#2C2A25" strokeWidth="1.5" strokeLinejoin="round" />

        {/* Blush */}
        <ellipse cx="40" cy="70" rx="6" ry="3.5" fill="#FFB7B7" opacity="0.4" />
        <ellipse cx="80" cy="70" rx="6" ry="3.5" fill="#FFB7B7" opacity="0.4" />

        {/* Head tuft */}
        <path d="M 55 42 Q 58 32 62 42 Q 65 35 68 42" fill="white" stroke="#2C2A25" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </motion.div>
  );
};

export default MascotBuddy;
