'use client';

import { m, type Variants } from 'framer-motion';
import { Sun } from 'lucide-react';
import type { ReactNode } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';

/** Hovering a party card straightens it; the label also reaches its illustration. */
const CARD: Variants = {
  hover: {
    scale: 1.04,
    rotate: 0,
    transition: { type: 'spring', stiffness: 300, damping: 16 }
  }
};

/** Hovering the Koshary card tosses the leaves, each on its own beat. */
const FLUTTER: Variants = {
  hover: (i: number) => ({
    y: [0, -10 - (i % 3) * 6, 0],
    rotate: [0, i % 2 ? 35 : -35, 0],
    transition: { duration: 0.8, delay: i * 0.04 }
  })
};

/** Hovering the Fatla card dunks the bag: "غطّس وطلّع". */
const DUNK: Variants = {
  hover: {
    y: [0, 14, 0, 14, 0],
    transition: { duration: 1.2, ease: 'easeInOut' }
  }
};

/** Loose leaves as [x, y, angle, fill]: a pile with a few strays mid-air. */
const LEAVES = [
  [28, 102, -35, 'fill-caramel'],
  [52, 110, 15, 'fill-brass-light'],
  [76, 100, 60, 'fill-mint'],
  [100, 110, -20, 'fill-caramel'],
  [124, 100, 35, 'fill-cream'],
  [148, 108, -60, 'fill-brass-light'],
  [172, 100, 20, 'fill-caramel'],
  [64, 84, -10, 'fill-cream'],
  [112, 84, 75, 'fill-caramel'],
  [152, 82, -30, 'fill-mint'],
  [44, 52, 40, 'fill-brass-light'],
  [96, 42, -45, 'fill-caramel'],
  [150, 46, 25, 'fill-mint'],
  [124, 18, -15, 'fill-cream']
] as const;

const BURST = Array.from({ length: 24 }, (_, i) => {
  const radius = i % 2 ? 34 : 48;
  const angle = (i * Math.PI) / 12;
  return `${(50 + radius * Math.sin(angle)).toFixed(1)},${(50 - radius * Math.cos(angle)).toFixed(1)}`;
}).join(' ');

/** Sticker placement around the poster, matching `hero.stickers` order. */
const STICKERS = [
  'bottom-[1%] start-0 -rotate-3 bg-paper',
  'top-0 end-0 rotate-3 bg-brass-light',
  'top-[38%] start-[3%] -rotate-6 bg-mint text-cream'
];

function LooseLeaves() {
  return (
    <svg
      viewBox="0 0 200 124"
      aria-hidden="true"
      className="w-full overflow-visible"
    >
      {LEAVES.map(([x, y, angle, fill], i) => (
        <m.g
          key={`${x}-${y}`}
          custom={i}
          variants={FLUTTER}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
        >
          <g transform={`translate(${x} ${y}) rotate(${angle})`}>
            <path
              d="M0-13C8-8 8 8 0 13C-8 8-8-8 0-13Z"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className={`${fill} stroke-espresso`}
            />
            <path
              d="M0-8V8"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="stroke-espresso"
            />
          </g>
        </m.g>
      ))}
    </svg>
  );
}

/** Mirrored in RTL so the yellow tag always swings on the poster's outer edge. */
function TeaBag() {
  return (
    <svg
      viewBox="0 0 200 124"
      aria-hidden="true"
      className="w-full overflow-visible rtl:-scale-x-100"
    >
      <m.g variants={DUNK}>
        <path
          d="M84 34C90 4 138-2 153 30"
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="stroke-espresso"
        />
        <path
          d="M58 40h52l8 12v58a8 8 0 0 1-8 8H58a8 8 0 0 1-8-8V52z"
          strokeWidth="3"
          strokeLinejoin="round"
          className="fill-paper stroke-espresso"
        />
        <path
          d="M54 86c10-6 18 4 30-2s20 4 30-2v24a5 5 0 0 1-5 5H59a5 5 0 0 1-5-5z"
          className="fill-caramel"
        />
        <g className="fill-koshary">
          <circle cx="66" cy="98" r="2.5" />
          <circle cx="84" cy="106" r="2.5" />
          <circle cx="100" cy="95" r="2.5" />
          <circle cx="74" cy="110" r="2" />
          <circle cx="104" cy="108" r="2.5" />
        </g>
        <path
          d="M50 52h68"
          strokeWidth="2"
          strokeDasharray="5 4"
          className="stroke-espresso"
        />
        <rect
          x="78"
          y="33"
          width="12"
          height="8"
          rx="1.5"
          strokeWidth="2"
          className="fill-cream stroke-espresso"
        />
        <m.g
          style={{ transformBox: 'fill-box', transformOrigin: '50% 14%' }}
          whileInView={{
            rotate: [-8, 8],
            transition: {
              duration: 1.6,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut'
            }
          }}
        >
          <rect
            x="136"
            y="24"
            width="34"
            height="44"
            rx="5"
            strokeWidth="3"
            className="fill-brass-light stroke-espresso"
          />
          <circle cx="153" cy="30" r="2.5" className="fill-espresso" />
          <path
            d="M145 44h16M145 53h11"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="stroke-espresso"
          />
        </m.g>
      </m.g>
    </svg>
  );
}

function PartyCard({
  name,
  tilt,
  className,
  children
}: {
  name: string;
  tilt: number;
  className: string;
  children: ReactNode;
}) {
  return (
    <m.div
      variants={CARD}
      initial={{ scale: 0.8, rotate: 0, y: 32 }}
      animate={{ scale: 1, rotate: tilt, y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 11 }}
      whileHover="hover"
      className={`absolute flex aspect-4/5 w-[56%] flex-col rounded-3xl border-3 border-espresso p-4 shadow-brutal-lg sm:p-5 ${className}`}
    >
      <p className="font-black font-display text-2xl leading-none sm:text-4xl">
        {name}
      </p>
      <div className="mt-auto">{children}</div>
    </m.div>
  );
}

function VsPoster() {
  const { dir, t } = useLanguage();
  const flip = dir === 'rtl' ? -1 : 1;

  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-10/9 w-full max-w-136 select-none"
    >
      <PartyCard
        name={t.poll.koshary}
        tilt={-7 * flip}
        className="inset-s-0 top-[8%] bg-koshary text-cream"
      >
        <LooseLeaves />
      </PartyCard>
      <PartyCard
        name={t.poll.fatla}
        tilt={6 * flip}
        className="inset-e-0 bottom-[6%] bg-fatla text-end text-cream"
      >
        <TeaBag />
      </PartyCard>

      <m.div
        className="absolute inset-x-0 top-1/2 mx-auto w-[34%] -translate-y-1/2"
        initial={{ scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.2 }}
        whileInView={{
          rotate: [-6, 6],
          transition: {
            duration: 4,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut'
          }
        }}
      >
        <svg viewBox="0 0 104 104" aria-hidden="true" className="w-full">
          <polygon
            points={BURST}
            transform="translate(4 4)"
            className="fill-espresso"
          />
          <polygon
            points={BURST}
            strokeWidth="3"
            strokeLinejoin="round"
            className="fill-brass-light stroke-espresso"
          />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="30"
            className="fill-espresso font-black font-display"
          >
            VS
          </text>
        </svg>
      </m.div>

      {t.hero.stickers.map((sticker, i) => (
        <m.span
          key={sticker}
          className={`chip absolute max-w-[90%] ${STICKERS[i]}`}
          whileInView={{
            y: [0, -6],
            transition: {
              duration: 1.8 + i * 0.4,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut'
            }
          }}
        >
          {sticker}
        </m.span>
      ))}
    </div>
  );
}

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section
      aria-labelledby="hero-title"
      className="grid items-center gap-x-12 gap-y-14 pt-8 pb-14 sm:pt-12 lg:grid-cols-2 lg:pb-20"
    >
      <div>
        <p className="chip -rotate-2 bg-brass-light">
          <Sun aria-hidden="true" className="size-4" />
          {t.hero.greeting}
        </p>
        <h1
          id="hero-title"
          className="mt-5 text-balance font-black font-display text-5xl leading-[1.05] text-shadow-[4px_4px_0_var(--color-brass-light)] sm:text-7xl"
        >
          {t.hero.title}
        </h1>
        <p className="mt-5 max-w-xl text-pretty text-lg sm:text-xl">
          {t.hero.subtitle}
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <a href="#studio" className="btn bg-koshary text-cream max-sm:w-full">
            {t.hero.ctaStudio}
          </a>
          <a href="#quiz" className="btn bg-brass-light max-sm:w-full">
            {t.hero.ctaQuiz}
          </a>
        </div>
      </div>
      <VsPoster />
    </section>
  );
}
