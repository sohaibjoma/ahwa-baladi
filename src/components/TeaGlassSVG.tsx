'use client';

import {
  AnimatePresence,
  m,
  type Transition,
  useReducedMotionConfig,
  type Variants
} from 'framer-motion';
import { GlassWater } from 'lucide-react';
import { useId, useState } from 'react';
import { liquidColor, SUGAR_CUBES, type TeaOrder } from '@/data/tea';
import { orderLine } from '@/i18n/format';
import { useLanguage } from '@/i18n/LanguageProvider';
import { playClink, playPour, playSlurp } from '@/utils/sound';

/* Geometry in the 400×440 viewBox: the glass stands left of the tray's centre so the spoon fits beside it. */
const GX = 168;
const GLASS =
  'M234 120C232 160 214 190 214 222C214 256 228 266 228 300C228 330 220 344 212 352C209 356 217 360 217 366Q217 372 211 372Q168 376 125 372Q119 372 119 366C119 360 127 356 124 352C116 344 108 330 108 300C108 266 122 256 122 222C122 190 104 160 102 120A66 10 0 0 1 234 120Z';
const INSIDE =
  'M229 121C227 160 209 190 209 222C209 256 223 266 223 300C223 326 216 338 202 345Q168 350 134 345C120 338 113 326 113 300C113 266 127 256 127 222C127 190 109 160 107 121Z';
const BASE =
  'M134 345Q168 350 202 345L212 352C209 356 217 360 217 366Q217 372 211 372Q168 376 125 372Q119 372 119 366C119 360 127 356 124 352Z';

/** Tea surface height after 0–4 sips (the last one sits below the bottom: empty) and the meniscus width there. */
const LEVELS = [134, 182, 232, 286, 362];
const MENISCUS = [1.02, 0.83, 0.72, 0.93, 0.7];
const SIPS = LEVELS.length - 1;

/* Illustration colours that have no brand token */
const BRONZE = '#9a4a07';
const LEAF_DUST = '#2b1408';
const BAG_PAPER = '#eed9b3';
const CLOVE = '#6b3416';
const PEWTER = '#8f877a';

/** Rotates or scales an SVG group around its local 0,0 instead of its bounding-box centre. */
const PIVOT = { transformBox: 'view-box', originX: 0, originY: 0 } as const;
const GLASS_PIVOT = {
  transformBox: 'view-box',
  originX: `${GX}px`,
  originY: '374px'
} as const;

const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.45 }
} as const;

const COLOR: Transition = { duration: 0.9, ease: 'easeInOut' };
const GULP: Transition = { type: 'spring', visualDuration: 0.6, bounce: 0.3 };
const FILL: Transition = { delay: 0.6, duration: 1, ease: 'easeInOut' };

/* Clink: playClink() strikes at 0, 0.12 and 0.21 s, so it starts once the spoon reaches the glass. */
const TAP_DELAY_MS = 170;
const TAPS = [0.17, 0.29, 0.38];
const CLINK: Transition = {
  duration: 0.85,
  times: [0, 0.2, 0.27, 0.34, 0.39, 0.45, 1],
  ease: ['easeIn', 'easeOut', 'easeIn', 'easeOut', 'easeIn', 'easeInOut']
};
const SPOON_TAP = {
  rotate: [0, 14, 9, 14, 10, 14, 0],
  y: [0, -3, -2, -3, -2, -3, 0]
};
const SHAKE: Transition = {
  duration: 0.85,
  times: [0, 0.2, 0.25, 0.34, 0.39, 0.45, 0.5, 0.65, 1]
};
const SHAKE_X = [0, 0, -2.4, 0, -2, 0, -1.5, 0.4, 0];
const SHAKE_ROTATE = [0, 0, -1.2, 0, -1, 0, -0.8, 0.2, 0];

/* Pour: the teapot glides in, tilts, pours and leaves; the stream and the sound follow the tilt. */
const POUR: Transition = {
  duration: 2.1,
  times: [0, 0.12, 0.22, 0.75, 0.85, 1],
  ease: 'easeInOut'
};
const TEAPOT = {
  x: [70, 0, 0, 0, 0, 70],
  y: [-60, 0, 0, 0, 0, -60],
  rotate: [0, 0, -38, -38, 0, 0],
  opacity: [0, 1, 1, 1, 1, 0]
};
const POUR_SOUND_DELAY_MS = 460;

const round = (n: number) => Math.round(n * 10) / 10;

/** Engraved petals around the tray floor, each turned along the ring. */
const PETALS = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * 2 * Math.PI;
  return {
    x: round(200 + 131 * Math.cos(a)),
    y: round(374 + 31 * Math.sin(a)),
    r: round((Math.atan2(31 * Math.cos(a), -131 * Math.sin(a)) * 180) / Math.PI)
  };
});

/** Koshary leaves: where each settles on the bottom, its tilt, and where it swirls from when koshary is chosen. */
const SPECKS = [
  { x: 140, y: 343, r: 20, from: [178, 176] },
  { x: 147, y: 345, r: -30, from: [157, 185] },
  { x: 153, y: 341, r: 60, from: [165, 193] },
  { x: 159, y: 346, r: 10, from: [193, 202] },
  { x: 165, y: 343, r: -50, from: [131, 210] },
  { x: 171, y: 346, r: 80, from: [173, 219] },
  { x: 177, y: 342, r: -15, from: [174, 227] },
  { x: 183, y: 345, r: 35, from: [146, 236] },
  { x: 189, y: 343, r: -70, from: [196, 244] },
  { x: 195, y: 341, r: 45, from: [158, 253] },
  { x: 156, y: 334, r: 15, from: [163, 261] },
  { x: 175, y: 335, r: -40, from: [185, 270] },
  { x: 186, y: 331, r: 70, from: [149, 278] },
  { x: 145, y: 333, r: -25, from: [170, 287] }
];
const LEAF_BITS = [
  'M-4 -1C-2 -3 3 -2.5 4.5 -0.5C3 1.8 -2 2.2 -4 -1Z',
  'M-2.5 -2L2 -2.5L3 1L-1 2.5L-3 0.5Z'
];

const CUBE_SLOTS = [
  { x: 159, y: 338, r: 6 },
  { x: 178, y: 338, r: -8 },
  { x: 141, y: 336, r: -12 },
  { x: 196, y: 336, r: 10 }
];

/* Surface decorations, relative to the tea surface (y 0) */
const MINT = [
  { x: GX - 12, y: -1, r: 194 },
  { x: GX - 8, y: -2, r: -16 },
  { x: GX - 9, y: 2, r: 38 }
];
const CLOVES = [
  { x: GX - 26, y: 20, r: -35 },
  { x: GX + 4, y: 30, r: 25 },
  { x: GX + 26, y: 16, r: 70 },
  { x: GX - 8, y: 46, r: -80 }
];
const BUBBLES = [
  { x: GX - 30, r: 2.5, duration: 1.9 },
  { x: GX - 12, r: 3.5, duration: 2.3 },
  { x: GX + 4, r: 2, duration: 1.7 },
  { x: GX + 18, r: 4, duration: 2.1 },
  { x: GX + 32, r: 2.5, duration: 1.8 },
  { x: GX - 22, r: 2, duration: 1.6 },
  { x: GX + 10, r: 3, duration: 2.4 },
  { x: GX - 2, r: 2.5, duration: 2 }
];
const STEAM = {
  light: [GX - 22, GX, GX + 22],
  heavy: [GX - 33, GX - 11, GX + 11, GX + 33]
};
const WISPS = [
  'M0 0C-7 -9 7 -17 0 -27C-7 -37 7 -45 0 -54',
  'M0 0C6 -8 -6 -17 0 -25C6 -33 -5 -41 1 -49C5 -54 2 -59 -1 -61',
  'M0 0C-5 -7 5 -13 0 -20C-6 -28 6 -36 0 -44'
];
const MILK_SWIRL =
  'M0 0a4 4 0 0 1 8 0a8 8 0 0 1 -16 0a12 12 0 0 1 24 0a16 16 0 0 1 -32 0a20 20 0 0 1 40 0a24 24 0 0 1 -48 0';

/* Perpetual loops are variants started by their layer's whileInView, so they pause off-screen. */
const drift: Variants = {
  loop: (g: number) => ({
    x: [0, 1.5, -1, 0],
    y: [0, -1.5, 0.5, 0],
    transition: {
      duration: 5 + g,
      delay: g * 0.7,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  })
};
const bob: Variants = {
  loop: {
    y: [0, -4, 0],
    rotate: [-3, 3, -3],
    transition: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
  }
};
const swing: Variants = {
  loop: {
    rotate: [-4, 4, -4],
    transition: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
  }
};
const sway: Variants = {
  loop: (i: number) => ({
    rotate: [0, 7, 0],
    y: [0, -1.5, 0],
    transition: {
      duration: 3 + i * 0.5,
      delay: i * 0.4,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  })
};
// Bubbles swell as they rise and pop at the surface (scale, so reduced motion simply hides them)
const rise: Variants = {
  loop: (i: number) => {
    const timing = {
      duration: BUBBLES[i].duration,
      delay: i * 0.27,
      repeat: Infinity
    };
    return {
      y: [212, 6],
      scale: [0.5, 1.1, 0],
      transition: {
        y: { ...timing, ease: 'easeIn' },
        scale: { ...timing, times: [0, 0.85, 1] }
      }
    };
  }
};
const spin: Variants = {
  loop: {
    rotate: 360,
    transition: { duration: 16, repeat: Infinity, ease: 'linear' }
  }
};
const steam: Variants = {
  loop: (i: number) => ({
    y: [8, -22],
    x: [0, 2, -2],
    opacity: [0, 1, 0],
    transition: {
      duration: 3,
      delay: i * 0.75,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  })
};

function Tray({ id }: { id: string }) {
  return (
    <g>
      <ellipse cx="207" cy="386" rx="180" ry="48" className="fill-espresso" />
      <ellipse
        cx="200"
        cy="380"
        rx="180"
        ry="48"
        fill={BRONZE}
        className="stroke-espresso"
        strokeWidth="3"
      />
      <ellipse
        cx="200"
        cy="370"
        rx="180"
        ry="48"
        fill={`url(#${id}-brass)`}
        className="stroke-espresso"
        strokeWidth="3"
      />
      <ellipse
        cx="200"
        cy="373"
        rx="158"
        ry="39"
        fill={`url(#${id}-floor)`}
        className="stroke-espresso"
        strokeWidth="2"
      />
      <g fill="none" className="stroke-espresso" strokeLinecap="round">
        <path
          d="M31 370a169 43.5 0 1 0 338 0a169 43.5 0 1 0 -338 0"
          pathLength={48}
          strokeDasharray="0 1"
          strokeOpacity="0.5"
          strokeWidth="3"
        />
        <ellipse
          cx="200"
          cy="374"
          rx="140"
          ry="33.5"
          strokeDasharray="5 4"
          strokeOpacity="0.4"
          strokeWidth="1.5"
        />
        <ellipse
          cx="200"
          cy="375"
          rx="122"
          ry="28"
          strokeOpacity="0.3"
          strokeWidth="1.5"
        />
      </g>
      <g className="fill-espresso" fillOpacity="0.35">
        {PETALS.map(({ x, y, r }) => (
          <path
            key={`${x}-${y}`}
            d="M-5 0Q0 -2.6 5 0Q0 2.6 -5 0Z"
            transform={`translate(${x} ${y}) rotate(${r})`}
          />
        ))}
      </g>
      <path
        d="M36 350A176 46 0 0 1 140 326"
        fill="none"
        className="stroke-white"
        strokeOpacity="0.65"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

function Spoon({ id, clinks }: { id: string; clinks: number }) {
  return (
    <g transform="translate(322 385)">
      <m.g
        key={clinks}
        style={PIVOT}
        animate={clinks ? SPOON_TAP : undefined}
        transition={CLINK}
      >
        <g
          transform="rotate(14)"
          fill={`url(#${id}-silver)`}
          className="stroke-espresso"
          strokeWidth="2.5"
          strokeLinejoin="round"
        >
          <path d="M-12 -2.4C-40 -2.8 -70 -3.2 -84 -3.4C-91 -3.6 -95 -6 -99 -5.2C-105 -4 -105 4 -99 5.2C-95 6 -91 3.6 -84 3.4C-70 3.2 -40 2.8 -12 2.4Z" />
          <path d="M-15 0C-15 -8.5 -4 -12.5 7 -12.5C19 -12.5 26 -6.5 26 0C26 6.5 19 12.5 7 12.5C-4 12.5 -15 8.5 -15 0Z" />
          <path
            d="M-9 0C-9 -5.5 -2 -8 6 -8C14 -8 19 -4.5 19 0C19 4.5 14 8 6 8C-2 8 -9 5.5 -9 0Z"
            stroke="none"
            fill={PEWTER}
            fillOpacity="0.45"
          />
          <path
            d="M-3 -4C1 -6 7 -6 12 -4.5M-30 -0.6L-82 -1"
            fill="none"
            className="stroke-white"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </g>
      </m.g>
    </g>
  );
}

function TeaString({ d }: { d: string }) {
  return (
    <g fill="none" strokeLinecap="round">
      <path d={d} className="stroke-espresso" strokeWidth="3.2" />
      <path d={d} className="stroke-paper" strokeWidth="1.4" />
    </g>
  );
}

function KosharyLeaves() {
  return (
    <m.g {...FADE} whileInView="loop" fill={LEAF_DUST}>
      {[0, 1, 2].map((group) => (
        <m.g key={group} variants={drift} custom={group}>
          {SPECKS.map(
            ({ x, y, r, from }, i) =>
              i % 3 === group && (
                <g key={`${x}-${y}`} transform={`translate(${x} ${y})`}>
                  <m.path
                    d={LEAF_BITS[i % 2]}
                    initial={{
                      x: from[0] - x,
                      y: from[1] - y,
                      rotate: r + 140
                    }}
                    animate={{ x: 0, y: 0, rotate: r }}
                    transition={{
                      type: 'spring',
                      visualDuration: 1.3,
                      bounce: 0.2,
                      delay: 0.15 + i * 0.07
                    }}
                  />
                </g>
              )
          )}
        </m.g>
      ))}
    </m.g>
  );
}

function FatlaBag() {
  return (
    <m.g {...FADE} whileInView="loop">
      <TeaString d="M160 283C154 230 122 170 103 120" />
      <g transform="translate(160 281)">
        <m.g style={PIVOT} variants={bob}>
          <path
            d="M-17 10L-11 4H11L17 10V44Q17 46 15 46H-15Q-17 46 -17 44Z"
            fill={BAG_PAPER}
            className="stroke-espresso"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M-13 13L-9 9H9L13 13V41H-13Z"
            fill="none"
            className="stroke-espresso"
            strokeOpacity="0.45"
            strokeWidth="1.2"
            strokeDasharray="2.5 2.5"
          />
          <g fill={LEAF_DUST} fillOpacity="0.55">
            <circle cx="-6" cy="27" r="1.7" />
            <circle cx="4" cy="31" r="1.7" />
            <circle cx="-2" cy="36" r="1.5" />
            <circle cx="7" cy="23" r="1.4" />
            <circle cx="-8" cy="37" r="1.4" />
          </g>
          <rect
            x="-3"
            y="1.5"
            width="6"
            height="4"
            rx="1"
            className="fill-cream stroke-espresso"
            strokeWidth="1.2"
          />
        </m.g>
      </g>
    </m.g>
  );
}

function FatlaTag({ label, fontSize }: { label: string; fontSize: number }) {
  return (
    <m.g {...FADE} whileInView="loop">
      <g transform="translate(102 119) rotate(12)">
        <m.g style={PIVOT} variants={swing}>
          <TeaString d="M0 0C-2 28 -1 56 0 81" />
          <g transform="translate(0 76)">
            <rect
              x="-23"
              y="2"
              width="50"
              height="30"
              rx="4"
              className="fill-espresso"
            />
            <rect
              x="-25"
              width="50"
              height="30"
              rx="4"
              className="fill-brass-light stroke-espresso"
              strokeWidth="2.5"
            />
            <circle
              cy="5.5"
              r="2"
              className="fill-cream stroke-espresso"
              strokeWidth="1.2"
            />
            <text
              y="24"
              textAnchor="middle"
              fontSize={fontSize}
              className="fill-espresso font-black font-display"
            >
              {label}
            </text>
          </g>
        </m.g>
      </g>
    </m.g>
  );
}

function SugarCube({
  x,
  y,
  r,
  nth
}: {
  x: number;
  y: number;
  r: number;
  nth: number;
}) {
  // Cubes land in pairs, so a newly added cube never waits long
  const delay = (nth % 2) * 0.15;
  return (
    <g transform={`translate(${x} ${y})`}>
      <m.g
        initial={{ y: -236, rotate: r - 80 }}
        animate={{
          y: [-236, 0, -10, 0, -3, 0],
          rotate: r,
          scale: 0.45,
          opacity: 0.85
        }}
        exit={{ opacity: 0, scale: 0, transition: { duration: 0.3 } }}
        transition={{
          y: {
            duration: 0.95,
            delay,
            times: [0, 0.5, 0.66, 0.8, 0.9, 1],
            ease: ['easeIn', 'easeOut', 'easeIn', 'easeOut', 'easeIn']
          },
          rotate: { type: 'spring', visualDuration: 0.9, bounce: 0.35, delay },
          default: { delay: delay + 1.6, duration: 6, ease: 'easeInOut' }
        }}
      >
        <rect
          x="-8"
          y="-8"
          width="16"
          height="16"
          rx="3.5"
          className="fill-white stroke-espresso"
          strokeWidth="2"
        />
        <path
          d="M-4 -4.5H2"
          className="stroke-espresso"
          strokeOpacity="0.25"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </m.g>
    </g>
  );
}

function Bubbles() {
  return (
    <m.g
      {...FADE}
      whileInView="loop"
      className="fill-cream/30 stroke-cream"
      strokeWidth="1.5"
    >
      {BUBBLES.map(({ x, r }, i) => (
        <m.circle key={x} cx={x} r={r} variants={rise} custom={i} />
      ))}
    </m.g>
  );
}

function MintLeaves() {
  return (
    <m.g {...FADE} whileInView="loop">
      {MINT.map(({ x, y, r }, i) => (
        <g
          key={r}
          transform={`translate(${x} ${y}) scale(1 0.55) rotate(${r})`}
        >
          <m.g style={PIVOT} variants={sway} custom={i}>
            <path
              d="M0 0C6 -9 19 -10 28 -2Q30 0 28 2C19 10 6 9 0 0Z"
              className="fill-mint stroke-espresso"
              strokeWidth="2"
            />
            <path
              d="M2 0Q14 -0.6 26 0M10 0L14 -4M17 0L21 -4M10 0L14 4M17 0L21 4"
              fill="none"
              className="stroke-cream"
              strokeOpacity="0.8"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </m.g>
        </g>
      ))}
    </m.g>
  );
}

function Cloves() {
  return (
    <m.g {...FADE} whileInView="loop">
      {CLOVES.map(({ x, y, r }, i) => (
        <g key={r} transform={`translate(${x} ${y}) rotate(${r})`}>
          <m.g style={PIVOT} variants={sway} custom={i}>
            <path
              d="M-1.8 2L-1 18Q0 20.5 1 18L1.8 2Z"
              fill={CLOVE}
              className="stroke-espresso"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <path
              d="M0 -6C2 -6 2.5 -3 4.5 -2.5C6 -1 5 2 2.5 2C1 3.5 -1 3.5 -2.5 2C-5 2 -6 -1 -4.5 -2.5C-2.5 -3 -2 -6 0 -6Z"
              fill={CLOVE}
              className="stroke-espresso"
              strokeWidth="1.2"
            />
            <circle cx="-1" cy="-3" r="1" className="fill-caramel" />
          </m.g>
        </g>
      ))}
    </m.g>
  );
}

function MilkSwirl() {
  return (
    <m.g {...FADE} whileInView="loop" transform="scale(1 0.22)">
      <m.path
        d={MILK_SWIRL}
        style={PIVOT}
        variants={spin}
        fill="none"
        className="stroke-paper"
        strokeOpacity="0.9"
        strokeWidth="3.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </m.g>
  );
}

function Ripples() {
  return (
    <g fill="none" className="stroke-white" strokeWidth="2">
      {TAPS.map((delay) => (
        <m.ellipse
          key={delay}
          rx="56"
          ry="8"
          vectorEffect="non-scaling-stroke"
          initial={{ scale: 0.15, opacity: 0 }}
          animate={{ scale: [0.15, 1], opacity: [0.9, 0] }}
          transition={{ delay, duration: 0.7, ease: 'easeOut' }}
        />
      ))}
    </g>
  );
}

function Steam({ heavy }: { heavy: boolean }) {
  return (
    <m.g
      {...FADE}
      whileInView="loop"
      fill="none"
      className="stroke-espresso"
      strokeOpacity={heavy ? 0.45 : 0.3}
      strokeWidth={heavy ? 6.5 : 4.5}
      strokeLinecap="round"
    >
      {STEAM[heavy ? 'heavy' : 'light'].map((x, i) => (
        <g key={x} transform={`translate(${x} ${i % 2 ? 98 : 104})`}>
          <m.path d={WISPS[i % WISPS.length]} variants={steam} custom={i} />
        </g>
      ))}
    </m.g>
  );
}

function Teapot({ id }: { id: string }) {
  return (
    <g
      transform="scale(1.15)"
      fill={`url(#${id}-silver)`}
      className="stroke-espresso"
      strokeWidth="2.5"
      strokeLinejoin="round"
    >
      <path d="M28 4C16 4 8 0 0 -2L2 4C10 6 18 12 26 14Z" />
      <path
        d="M80 -8C98 -8 100 14 82 14"
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M24 18C18 6 22 -10 34 -14H70C82 -10 86 6 80 18Z" />
      <path d="M36 -14C38 -24 66 -24 68 -14Z" />
      <circle cx="52" cy="-25" r="4" className="fill-espresso" />
      <path
        d="M30 8C29 0 31 -6 37 -9"
        fill="none"
        className="stroke-white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </g>
  );
}

function Pour({
  id,
  color,
  onDone
}: {
  id: string;
  color: string;
  onDone: () => void;
}) {
  // With reduced motion the teapot skips its entrance and simply fades in mid-pour
  const still = useReducedMotionConfig();
  return (
    <g>
      <m.path
        d={`M${GX + 6} 86V350`}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: [0, 0, 1, 1, 1, 1],
          pathOffset: [0, 0, 0, 0, 1, 1],
          opacity: [0, 0, 1, 1, 1, 0]
        }}
        transition={{
          duration: 2.1,
          times: [0, 0.2, 0.3, 0.72, 0.84, 1],
          ease: 'linear'
        }}
      />
      <g transform={`translate(${GX + 6} 84)`}>
        <m.g
          style={PIVOT}
          initial={{ opacity: 0 }}
          animate={still ? { rotate: -38, opacity: TEAPOT.opacity } : TEAPOT}
          transition={POUR}
          onAnimationComplete={onDone}
        >
          <Teapot id={id} />
        </m.g>
      </g>
    </g>
  );
}

/** What the speech bubble says: a studio line, or an index into the sip lines. */
type Line = 'hint' | 'clinked' | 'empty' | 'refilled' | number;

export default function TeaGlassSVG({ order }: { order: TeaOrder }) {
  const { locale, t } = useLanguage();
  const id = useId();
  const [sips, setSips] = useState(0);
  const [pouring, setPouring] = useState(false);
  const [clinks, setClinks] = useState(0);
  const [note, setNote] = useState<{ line: Line; n: number }>({
    line: 'hint',
    n: 0
  });
  const [brew, setBrew] = useState(order);

  // A new order comes in a full glass; a new brew or a drunk glass gets poured afresh
  if (brew !== order) {
    setBrew(order);
    if (sips > 0 || brew.type !== order.type) {
      setSips(0);
      setPouring(true);
    }
  }

  const empty = sips === SIPS;
  const color = liquidColor(order);
  const level = { y: LEVELS[sips] };
  const levelTransition = pouring ? FILL : GULP;
  const clip = `url(#${id}-inside)`;
  const message =
    typeof note.line === 'number'
      ? t.studio.sips[note.line]
      : t.studio[note.line];
  // Alternating amplitudes give every clink new keyframes, so the shake replays
  const shake = clinks % 2 ? 1 : 0.8;

  function say(line: Line) {
    setNote((prev) => ({ line, n: prev.n + 1 }));
  }

  function clink() {
    setClinks((n) => n + 1);
    say('clinked');
    setTimeout(playClink, TAP_DELAY_MS);
  }

  function sip() {
    playSlurp();
    setSips(sips + 1);
    setPouring(false);
    say(sips + 1 === SIPS ? 'empty' : sips);
  }

  function refill() {
    setSips(0);
    setPouring(true);
    setTimeout(playPour, POUR_SOUND_DELAY_MS);
  }

  function poured() {
    setPouring(false);
    say('refilled');
  }

  return (
    <figure className="@container mx-auto w-full max-w-md">
      <svg
        viewBox="0 0 400 440"
        role="img"
        aria-labelledby={`${id}-title`}
        className="block h-auto w-full lg:max-h-[calc(100svh-18rem)]"
      >
        <title
          id={`${id}-title`}
        >{`${t.studio.glassLabel}: ${orderLine(t, order)}`}</title>
        <defs>
          <linearGradient id={`${id}-brass`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0"
              style={{ stopColor: 'var(--color-brass-light)' }}
            />
            <stop offset="0.55" style={{ stopColor: 'var(--color-brass)' }} />
            <stop offset="1" stopColor={BRONZE} />
          </linearGradient>
          <linearGradient id={`${id}-floor`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b8650a" />
            <stop offset="0.45" stopColor="#e08a0c" />
            <stop
              offset="1"
              style={{ stopColor: 'var(--color-brass-light)' }}
            />
          </linearGradient>
          <linearGradient id={`${id}-silver`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbf9f4" />
            <stop offset="0.5" stopColor="#cfc8bc" />
            <stop offset="1" stopColor={PEWTER} />
          </linearGradient>
          <linearGradient id={`${id}-depth`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.2" />
            <stop offset="0.3" stopColor="#fff" stopOpacity="0" />
            <stop
              offset="1"
              stopOpacity="0.35"
              style={{ stopColor: 'var(--color-espresso)' }}
            />
          </linearGradient>
          <clipPath id={`${id}-inside`}>
            <path d={INSIDE} />
          </clipPath>
        </defs>

        <Tray id={id} />
        <ellipse
          cx={GX + 9}
          cy="376"
          rx="47"
          ry="6.5"
          className="fill-espresso"
        />

        <m.g
          style={GLASS_PIVOT}
          animate={
            clinks
              ? {
                  x: SHAKE_X.map((v) => v * shake),
                  rotate: SHAKE_ROTATE.map((v) => v * shake)
                }
              : undefined
          }
          transition={SHAKE}
        >
          <path d={GLASS} className="fill-white" fillOpacity="0.3" />
          {pouring && <Pour id={id} color={color} onDone={poured} />}

          <g clipPath={clip}>
            <m.g
              initial={false}
              animate={level}
              transition={levelTransition}
              opacity="0.9"
            >
              <m.rect
                x={GX - 72}
                width="144"
                height="250"
                initial={false}
                animate={{ fill: color }}
                transition={COLOR}
              />
              <rect
                x={GX - 72}
                width="144"
                height="250"
                fill={`url(#${id}-depth)`}
              />
              <g transform={`translate(${GX} 0)`}>
                <m.g
                  style={PIVOT}
                  initial={false}
                  animate={{ scale: MENISCUS[sips] }}
                  transition={levelTransition}
                >
                  <m.ellipse
                    rx="60"
                    ry="9"
                    initial={false}
                    animate={{ fill: color }}
                    transition={COLOR}
                  />
                  <ellipse
                    rx="60"
                    ry="9"
                    className="fill-white"
                    fillOpacity="0.25"
                  />
                </m.g>
              </g>
            </m.g>
          </g>

          <AnimatePresence initial={false}>
            {order.type === 'koshary' && <KosharyLeaves key="koshary" />}
            {order.type === 'fatla' && <FatlaBag key="fatla" />}
          </AnimatePresence>
          <AnimatePresence initial={false}>
            {CUBE_SLOTS.slice(0, SUGAR_CUBES[order.sugar]).map((slot, nth) => (
              <SugarCube key={slot.x} {...slot} nth={nth} />
            ))}
          </AnimatePresence>

          {/* The tea in front of whatever sank into it */}
          <g clipPath={clip}>
            <m.g initial={false} animate={level} transition={levelTransition}>
              <m.rect
                x={GX - 72}
                y="9"
                width="144"
                height="250"
                opacity="0.4"
                initial={false}
                animate={{ fill: color }}
                transition={COLOR}
              />
            </m.g>
          </g>

          <g clipPath={clip}>
            <m.g initial={false} animate={level} transition={levelTransition}>
              <AnimatePresence initial={false}>
                {order.type === 'maghly' && <Bubbles key="maghly" />}
              </AnimatePresence>
              <g transform={`translate(${GX} 0)`}>
                <m.g
                  style={PIVOT}
                  initial={false}
                  animate={{ scale: MENISCUS[sips] }}
                  transition={levelTransition}
                >
                  <AnimatePresence initial={false}>
                    {order.addon === 'milk' && <MilkSwirl key="milk" />}
                  </AnimatePresence>
                  {clinks > 0 && <Ripples key={clinks} />}
                </m.g>
              </g>
              <AnimatePresence initial={false}>
                {order.addon === 'mint' && <MintLeaves key="mint" />}
                {order.addon === 'cloves' && <Cloves key="cloves" />}
              </AnimatePresence>
            </m.g>
            <path
              d={INSIDE}
              fill="none"
              className="stroke-espresso"
              strokeOpacity="0.14"
              strokeWidth="12"
            />
          </g>

          <m.path
            d={BASE}
            fillOpacity="0.25"
            initial={false}
            animate={{ fill: empty ? '#ffffff' : color }}
            transition={COLOR}
          />
          <path d={BASE} className="fill-white" fillOpacity="0.45" />
          <path
            d="M134 345Q168 350 202 345"
            fill="none"
            className="stroke-espresso"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
          <g fill="none" className="stroke-white" strokeLinecap="round">
            <path d="M132 361H150M160 362H172" strokeWidth="2.5" />
            <path d="M114 134C117 165 128 190 131 210" strokeWidth="6" />
            <path d="M121 262C117 278 117 298 120 318" strokeWidth="5" />
            <path
              d="M222 134C221 144 219 152 216 160"
              strokeWidth="3.5"
              strokeOpacity="0.8"
            />
          </g>
          <circle cx="219" cy="282" r="2.5" className="fill-white" />

          <path
            d={GLASS}
            fill="none"
            className="stroke-espresso"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <ellipse
            cx={GX}
            cy="120"
            rx="66"
            ry="10"
            fill="none"
            className="stroke-espresso"
            strokeWidth="3"
          />
          <ellipse
            cx={GX}
            cy="121"
            rx="61"
            ry="7.5"
            fill="none"
            className="stroke-espresso"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />

          <AnimatePresence initial={false}>
            {order.type === 'fatla' && (
              <FatlaTag
                key="tag"
                label={t.studio.tag}
                fontSize={locale === 'ar' ? 15 : 12}
              />
            )}
          </AnimatePresence>
        </m.g>

        <Spoon id={id} clinks={clinks} />

        <AnimatePresence initial={false}>
          {!empty && !pouring && (
            <Steam
              key={order.type === 'maghly' ? 'heavy' : 'light'}
              heavy={order.type === 'maghly'}
            />
          )}
        </AnimatePresence>
      </svg>

      <div className="relative mt-6">
        <svg
          aria-hidden="true"
          viewBox="0 0 28 16"
          className="absolute inset-x-0 -top-3.25 z-10 mx-auto h-4 w-7"
        >
          <path
            d="M1 16L14 2L27 16"
            className="fill-paper stroke-espresso"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
        <p
          aria-live="polite"
          aria-atomic="true"
          className="card flex h-20 items-center justify-center bg-paper px-5 text-center font-bold text-balance leading-snug"
        >
          <m.span
            key={note.n}
            className="block"
            initial={note.n ? { scale: 0.9, y: 4 } : false}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', visualDuration: 0.35, bounce: 0.45 }}
          >
            {message}
          </m.span>
        </p>
      </div>

      <div className="mt-4 grid gap-3 @xs:grid-cols-2">
        <button
          type="button"
          onClick={clink}
          className="btn @xs:min-h-15.5 bg-brass-light text-center text-balance text-espresso leading-tight"
        >
          {t.studio.clink}
        </button>
        <button
          type="button"
          onClick={empty ? refill : sip}
          className={`btn @xs:min-h-15.5 text-center text-balance text-cream leading-tight ${empty ? 'bg-koshary' : 'bg-mint'}`}
        >
          {empty && (
            <GlassWater
              aria-hidden="true"
              className="hidden size-5 shrink-0 @sm:block"
            />
          )}
          {empty ? t.studio.refill : t.studio.sip}
        </button>
      </div>
    </figure>
  );
}
