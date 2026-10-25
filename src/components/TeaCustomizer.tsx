'use client';

import { m, type Variants } from 'framer-motion';
import { Check } from 'lucide-react';
import { type ReactNode, useId } from 'react';
import {
  ADDONS,
  type Addon,
  liquidColor,
  STRENGTHS,
  SUGAR_CUBES,
  SUGARS,
  TEA_TYPES,
  type TeaOrder,
  type TeaType
} from '@/data/tea';
import { useLanguage } from '@/i18n/LanguageProvider';
import { playPlop, playPour } from '@/utils/sound';

type StepKey = keyof TeaOrder;

interface Choice {
  value: string;
  selected: boolean;
  next: TeaOrder;
  copy: { label: string; desc: string };
  art: ReactNode;
}

/** Per step: option grid, selected fill (AA text contrast on each fill) and number badge. */
const STEP_STYLES: Record<
  StepKey,
  { grid: string; card: string; badge: string }
> = {
  type: {
    grid: 'sm:grid-cols-3',
    card: 'sm:flex-col peer-checked:bg-koshary peer-checked:text-cream',
    badge: 'bg-koshary text-cream'
  },
  strength: {
    grid: 'sm:grid-cols-3',
    card: 'sm:flex-col peer-checked:bg-brass-light',
    badge: 'bg-brass-light'
  },
  sugar: {
    grid: 'sm:grid-cols-2',
    // Paper sprinkled with sugar grains
    card: 'peer-checked:bg-paper peer-checked:bg-[radial-gradient(color-mix(in_oklab,var(--color-caramel)_55%,transparent)_1px,transparent_1.6px)] peer-checked:bg-size-[10px_10px]',
    badge: 'bg-paper'
  },
  addon: {
    grid: 'sm:grid-cols-2',
    card: 'peer-checked:bg-mint peer-checked:text-cream',
    badge: 'bg-mint text-cream'
  }
};

/* Reactions played when an option becomes the selected one ("on"); only the flame keeps going. */
const settle: Variants = {
  off: { y: 0, rotate: 0 },
  on: (i: number) => ({
    y: [-14, 0],
    rotate: [-60, 0],
    transition: {
      type: 'spring',
      stiffness: 320,
      damping: 13,
      delay: i * 0.09
    }
  })
};
const drop: Variants = {
  off: { y: 0 },
  on: (i: number) => ({
    y: [-34, 0],
    transition: {
      type: 'spring',
      stiffness: 520,
      damping: 17,
      delay: i * 0.08
    }
  })
};
const wiggle: Variants = {
  off: { rotate: 0 },
  on: { rotate: [0, -16, 12, -6, 0], transition: { duration: 0.7 } }
};
const dunk: Variants = {
  off: { y: 0 },
  on: { y: [0, 7, 0, 5, 0], transition: { duration: 0.9 } }
};
const swing: Variants = {
  off: { rotate: 0 },
  on: { rotate: [0, 30, -18, 9, 0], transition: { duration: 1.1 } }
};
const flicker: Variants = {
  off: { scaleX: 1, scaleY: 1 },
  on: {
    scaleX: [1, 0.9, 1.06, 0.95, 1],
    scaleY: [1, 1.2, 0.9, 1.12, 1],
    transition: { duration: 1.2, repeat: Number.POSITIVE_INFINITY }
  }
};
const pourIn: Variants = {
  off: { scaleY: 1 },
  on: {
    scaleY: [0.1, 1],
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
  }
};
const plunge: Variants = {
  off: { y: 0, scaleY: 1 },
  on: {
    y: [-24, 0, -3, 0],
    scaleY: [1.15, 0.78, 1.06, 1],
    transition: { duration: 0.6, times: [0, 0.55, 0.8, 1] }
  }
};
const strike: Variants = {
  off: { pathLength: 1 },
  on: { pathLength: [0, 1], transition: { duration: 0.35, delay: 0.1 } }
};
const twirl: Variants = {
  off: { rotate: 0 },
  on: (i: number) => ({
    rotate: [0, i ? 28 : -28, 0],
    transition: { duration: 0.6, delay: i * 0.12 }
  })
};

const LEAVES = [
  [12, 22, -55, 'fill-koshary'],
  [28, 21, 50, 'fill-koshary'],
  [20, 12, -8, 'fill-mint']
] as const;

/** تفل: loose leaves swirling down to settle, with a dusting of tea grains. */
function LooseTea() {
  return (
    <>
      <path
        d="M9 35h.01M15 33h.01M21.5 35.5h.01M27 33.5h.01M32 35h.01"
        strokeWidth={2.6}
      />
      {LEAVES.map(([x, y, angle, fill], i) => (
        <m.g key={x} custom={i} variants={settle}>
          <g transform={`translate(${x} ${y}) rotate(${angle})`}>
            <path d="M0 8C-6 6-6.5-2 0-9 6.5-2 6 6 0 8V11" className={fill} />
            <path d="M0 5.5V-5" className="stroke-cream" strokeWidth={1.2} />
          </g>
        </m.g>
      ))}
    </>
  );
}

/** فتلة: a tea bag that dunks while its yellow tag swings outside the glass. */
function TeaBag() {
  return (
    <m.g variants={dunk}>
      <path d="M14 17C14 9 20 5 26.5 8.5" fill="none" />
      <m.g variants={swing} style={{ originX: 0.2, originY: 0 }}>
        <rect
          x="24"
          y="8"
          width="11"
          height="10"
          rx="2"
          className="fill-brass-light"
        />
        <path d="M27 13H32" strokeWidth={1.5} />
      </m.g>
      <rect
        x="6"
        y="17"
        width="16"
        height="19"
        rx="2.5"
        className="fill-caramel"
      />
      <path d="M6 21.5H22" />
      <path d="M10 27h.01M14 30h.01M18 26h.01" strokeWidth={2.4} />
    </m.g>
  );
}

/** سبرتاية: a brass spirit burner with a flickering flame. */
function SpiritBurner() {
  return (
    <>
      <m.g variants={flicker} style={{ originX: 0.5, originY: 1 }}>
        <path
          d="M20 4C25.5 10 27 15 24.5 19.5 23.3 21.7 21.8 23 20 23S16.7 21.7 15.5 19.5C13 15 14.5 10 20 4Z"
          className="fill-fatla"
        />
        <path
          d="M20 11.5C22.5 14.5 23 17 21.8 19.3 21.3 20.3 20.7 20.8 20 20.8S18.7 20.3 18.2 19.3C17 17 17.5 14.5 20 11.5Z"
          className="fill-brass-light"
          stroke="none"
        />
      </m.g>
      <rect
        x="16"
        y="24"
        width="8"
        height="4"
        rx="1"
        className="fill-caramel"
      />
      <path d="M10.5 28H29.5L27.5 36H12.5Z" className="fill-brass" />
    </>
  );
}

const GLASS =
  'M11 6H29C28 14 25 18 25 22.5 25 27 27.5 31 27.5 35.5H12.5C12.5 31 15 27 15 22.5 15 18 12 14 11 6Z';

/** A mini waisted glass filled with the tea colour this strength would brew. */
function GlassSwatch({ color }: { color: string }) {
  const clip = useId();
  return (
    <>
      <clipPath id={clip}>
        <path d={GLASS} />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <m.g variants={pourIn} style={{ originY: 1 }}>
          <rect
            x="8"
            y="12.5"
            width="24"
            height="25"
            stroke="none"
            style={{ fill: color }}
            className="transition-[fill] duration-500"
          />
        </m.g>
      </g>
      <path
        d="M13.6 9.5C14.3 13 15.6 16 16.5 18.5"
        className="stroke-paper"
        strokeWidth={1.6}
      />
      <path d={GLASS} fill="none" />
    </>
  );
}

const CUBE_TILTS = [-8, 6, 9, -5];

/** That many sugar cubes plopping in, two per row; no sugar leaves an empty spoon. */
function SugarCubes({ count }: { count: number }) {
  if (count === 0) {
    return (
      <m.g variants={wiggle} style={{ originX: 0.5, originY: 0.5 }}>
        <path d="M19.5 20.5L32 8" strokeWidth={4} />
        <path d="M19.5 20.5L32 8" className="stroke-paper" strokeWidth={1.2} />
        <ellipse
          cx="14"
          cy="26"
          rx="8"
          ry="5.5"
          transform="rotate(-45 14 26)"
          className="fill-paper"
        />
        <path
          d="M11.5 24.5C12.5 22.5 14 21.5 15.8 21"
          className="stroke-caramel"
          strokeWidth={1.4}
        />
      </m.g>
    );
  }
  // 12-unit cubes on a 15-unit pitch, centred; the bottom row lands first
  const cols = Math.min(count, 2);
  const rows = Math.ceil(count / 2);
  return Array.from({ length: count }, (_, i) => {
    const x = 20 - (cols * 15 - 3) / 2 + (i % 2) * 15;
    const y = 20 - (rows * 15 - 3) / 2 + (rows - 1 - Math.floor(i / 2)) * 15;
    return (
      <m.g key={`${x}-${y}`} custom={i} variants={drop}>
        <g transform={`rotate(${CUBE_TILTS[i]} ${x + 6} ${y + 6})`}>
          <rect
            x={x + 2}
            y={y + 2}
            width="12"
            height="12"
            rx="2.5"
            className="fill-espresso"
          />
          <rect
            x={x}
            y={y}
            width="12"
            height="12"
            rx="2.5"
            className="fill-paper"
          />
          <path
            d={`M${x + 3.5} ${y + 3.5}h3`}
            className="stroke-caramel"
            strokeWidth={1.5}
          />
        </g>
      </m.g>
    );
  });
}

/** من غير فلسفة: a sparkle, struck out. */
function NoSparkle() {
  return (
    <>
      <path
        d="M20 5C21.2 13.5 24.5 16.8 33 18 24.5 19.2 21.2 22.5 20 31 18.8 22.5 15.5 19.2 7 18 15.5 16.8 18.8 13.5 20 5Z"
        className="fill-brass-light"
      />
      <path d="M31 27.5V34M27.8 30.8H34.2" strokeWidth={1.8} />
      <m.path
        d="M8 8L32 32"
        variants={strike}
        className="stroke-paper"
        strokeWidth={7}
      />
      <m.path
        d="M8 8L32 32"
        variants={strike}
        className="stroke-fatla"
        strokeWidth={3.2}
      />
    </>
  );
}

/** نعناع: a fresh mint sprig swaying from its stem. */
function MintSprig() {
  return (
    <m.g variants={wiggle} style={{ originX: 0.5, originY: 1 }}>
      <path d="M20 36C20 28 19.5 20 21 9" fill="none" />
      <path
        d="M19.8 27C12.5 28 8 23 8.5 16.5 15 16 19.5 20.5 19.8 27Z"
        className="fill-mint"
      />
      <path
        d="M20.4 20C27 21 32 16 31.5 9.5 25 9 20.5 13.5 20.4 20Z"
        className="fill-mint"
      />
      <path
        d="M21 9C20 6 21 4 23.5 3 24.5 6 23.5 8 21 9Z"
        className="fill-mint"
      />
      <path
        d="M18.5 25.5L12 19M21.6 18.6L28.5 12"
        className="stroke-cream"
        strokeWidth={1.3}
      />
    </m.g>
  );
}

/** حليب: a milk drop that plunges in and squashes. */
function MilkDrop() {
  return (
    <m.g variants={plunge} style={{ originX: 0.5, originY: 1 }}>
      <path
        d="M20 5C20 5 30.5 16.5 30.5 24 30.5 30 25.8 34.5 20 34.5S9.5 30 9.5 24C9.5 16.5 20 5 20 5Z"
        className="fill-paper"
      />
      <path
        d="M14.5 23.5C14.5 27 16.5 29.5 19 30"
        className="stroke-caramel"
        strokeWidth={1.8}
        fill="none"
      />
    </m.g>
  );
}

/** فصين قرنفل: two clove buds that twirl. */
function Cloves() {
  return (
    <>
      {(
        [
          [-7, -22],
          [7, 20]
        ] as const
      ).map(([dx, angle], i) => (
        <m.g key={dx} custom={i} variants={twirl}>
          <g transform={`translate(${dx} 1) rotate(${angle} 20 21)`}>
            <path
              d="M17.5 16H22.5L21 35.5Q20 37 19 35.5Z"
              className="fill-koshary"
            />
            <path
              d="M12.5 12L17 14.5 20 12.5 23 14.5 27.5 12 25 17.5Q20 19.5 15 17.5Z"
              className="fill-koshary"
            />
            <circle cx="20" cy="10" r="3.4" className="fill-caramel" />
          </g>
        </m.g>
      ))}
    </>
  );
}

const TYPE_ART: Record<TeaType, ReactNode> = {
  koshary: <LooseTea />,
  fatla: <TeaBag />,
  maghly: <SpiritBurner />
};

const ADDON_ART: Record<Addon, ReactNode> = {
  none: <NoSparkle />,
  mint: <MintSprig />,
  milk: <MilkDrop />,
  cloves: <Cloves />
};

export default function TeaCustomizer({
  order,
  onChange
}: {
  order: TeaOrder;
  onChange: (order: TeaOrder) => void;
}) {
  const { t, num } = useLanguage();
  const id = useId();

  function choose(next: TeaOrder) {
    if (next.type !== order.type) playPour();
    if (SUGAR_CUBES[next.sugar] > SUGAR_CUBES[order.sugar]) playPlop();
    onChange(next);
  }

  const steps: [StepKey, Choice[]][] = [
    [
      'type',
      TEA_TYPES.map((type) => ({
        value: type,
        selected: order.type === type,
        next: { ...order, type },
        copy: t.options.type[type],
        art: TYPE_ART[type]
      }))
    ],
    [
      'strength',
      STRENGTHS.map((strength) => ({
        value: strength,
        selected: order.strength === strength,
        next: { ...order, strength },
        copy: t.options.strength[strength],
        art: <GlassSwatch color={liquidColor({ ...order, strength })} />
      }))
    ],
    [
      'sugar',
      SUGARS.map((sugar) => ({
        value: sugar,
        selected: order.sugar === sugar,
        next: { ...order, sugar },
        copy: t.options.sugar[sugar],
        art: <SugarCubes count={SUGAR_CUBES[sugar]} />
      }))
    ],
    [
      'addon',
      ADDONS.map((addon) => ({
        value: addon,
        selected: order.addon === addon,
        next: { ...order, addon },
        copy: t.options.addon[addon],
        art: ADDON_ART[addon]
      }))
    ]
  ];

  return (
    <div className="flex flex-col gap-6">
      {steps.map(([key, choices], i) => {
        const styles = STEP_STYLES[key];
        return (
          <fieldset key={key} className="card min-w-0 bg-paper p-4 sm:p-6">
            <legend className="float-start mb-5 flex w-full items-center gap-3">
              <span
                className={`grid size-11 shrink-0 -rotate-6 place-items-center rounded-full border-3 border-espresso font-black font-display text-xl shadow-brutal-sm rtl:rotate-6 ${styles.badge}`}
              >
                {num(i + 1)}
              </span>
              <span className="min-w-0">
                <span className="block font-bold font-display text-xl leading-tight sm:text-2xl">
                  {t.studio.steps[key]}
                </span>
                <span className="block text-sm sm:text-base">
                  {t.studio.prompts[key]}
                </span>
              </span>
            </legend>
            <div className={`clear-both grid gap-4 ${styles.grid}`}>
              {choices.map(({ value, selected, next, copy, art }) => {
                const optionId = `${id}-${key}-${value}`;
                return (
                  <label key={value} className="relative block">
                    <input
                      type="radio"
                      name={`${id}-${key}`}
                      value={value}
                      checked={selected}
                      onChange={() => choose(next)}
                      aria-labelledby={`${optionId}-label`}
                      aria-describedby={`${optionId}-desc`}
                      className="peer sr-only"
                    />
                    <span
                      className={`press relative flex h-full gap-3 rounded-xl border-3 border-espresso bg-cream p-3 shadow-brutal peer-checked:translate-x-1 peer-checked:translate-y-1 peer-checked:shadow-none peer-focus-visible:outline-3 peer-focus-visible:outline-wood peer-focus-visible:outline-offset-3 ${styles.card}`}
                    >
                      <span
                        aria-hidden="true"
                        className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-lg border-2 border-espresso bg-paper"
                      >
                        <m.svg
                          viewBox="0 0 40 40"
                          initial={false}
                          animate={selected ? 'on' : 'off'}
                          className="size-11 stroke-espresso"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          {art}
                        </m.svg>
                      </span>
                      <span className="min-w-0">
                        <span
                          id={`${optionId}-label`}
                          className="block text-balance font-bold leading-snug"
                        >
                          {copy.label}
                        </span>
                        <span
                          id={`${optionId}-desc`}
                          className="mt-1 block text-pretty text-sm leading-snug"
                        >
                          {copy.desc}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`absolute -inset-e-3 -top-3 grid size-8 rotate-12 place-items-center rounded-full border-2 border-espresso bg-espresso text-cream motion-safe:transition-[scale] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)] ${selected ? 'scale-100' : 'scale-0'}`}
                      >
                        <Check className="size-5" strokeWidth={3.5} />
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        );
      })}
    </div>
  );
}
