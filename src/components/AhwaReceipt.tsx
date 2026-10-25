'use client';

import { AnimatePresence, m } from 'framer-motion';
import {
  Check,
  Copy,
  Crown,
  Gauge,
  type LucideIcon,
  Quote,
  Sparkles,
  Zap
} from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import {
  type Addon,
  liquidColor,
  type Sugar,
  type TeaOrder,
  type TeaType
} from '@/data/tea';
import { orderLine } from '@/i18n/format';
import { useLanguage } from '@/i18n/LanguageProvider';
import { playBell, playClink } from '@/utils/sound';

/** The ahwa's price list, in EGP. */
const BASE_PRICE: Record<TeaType, number> = {
  koshary: 10,
  fatla: 12,
  maghly: 15
};
const SUGAR_PRICE: Record<Sugar, number> = {
  sada: 0,
  riha: 0,
  mazbout: 0,
  zyada: 1
};
const ADDON_PRICE: Record<Addon, number> = {
  none: 0,
  mint: 2,
  milk: 5,
  cloves: 3
};

/** Points each choice adds to a meter; the sums are clamped to 5..100. */
const FOCUS = {
  type: { koshary: 0, fatla: 0, maghly: 20 },
  strength: { khafeef: 25, mazbout: 50, teqeel: 75 },
  sugar: { sada: 0, riha: 5, mazbout: 10, zyada: 20 }
};
const VIBE = {
  type: { koshary: 20, fatla: 0, maghly: 10 },
  sugar: { sada: 10, riha: 35, mazbout: 30, zyada: 15 },
  addon: { none: 10, mint: 40, milk: 30, cloves: 25 }
};
const CRED = {
  type: { koshary: 55, fatla: 10, maghly: 65 },
  strength: { khafeef: -10, mazbout: 5, teqeel: 25 },
  sugar: { sada: 15, riha: 5, mazbout: 0, zyada: -25 },
  addon: { none: 10, mint: 5, milk: -25, cloves: 0 }
};

const clampMeter = (value: number) => Math.min(100, Math.max(5, value));

function moodMeters({ type, strength, sugar, addon }: TeaOrder) {
  return {
    focus: clampMeter(
      FOCUS.type[type] + FOCUS.strength[strength] + FOCUS.sugar[sugar]
    ),
    vibe: clampMeter(VIBE.type[type] + VIBE.sugar[sugar] + VIBE.addon[addon]),
    cred: clampMeter(
      CRED.type[type] +
        CRED.strength[strength] +
        CRED.sugar[sugar] +
        CRED.addon[addon]
    )
  };
}

const METERS = [
  { key: 'focus', Icon: Zap, fill: 'bg-fatla' },
  { key: 'vibe', Icon: Sparkles, fill: 'bg-mint' },
  { key: 'cred', Icon: Crown, fill: 'bg-wood' }
] as const;

/** The zigzag mask clips borders and box-shadows, so the paper is outlined with stacked drop-shadows. */
const PAPER_OUTLINE = ['0 3px', '0 -3px', '3px 0', '-3px 0', '5px 5px']
  .map((offset) => `drop-shadow(${offset} 0 var(--color-espresso))`)
  .join(' ');

/** Bars of uneven widths, repeated along the strip, read as a barcode. */
const BARCODE =
  'repeating-linear-gradient(90deg, var(--color-espresso) 0 2px, transparent 0 4px, var(--color-espresso) 0 5px, transparent 0 8px, var(--color-espresso) 0 11px, transparent 0 12px, var(--color-espresso) 0 13px, transparent 0 16px)';

const RULE = 'my-6 border-espresso border-t-2 border-dashed';
/** Shared by the visible wisdom and the invisible ones that reserve the tallest one's height. */
const WISDOM_TEXT =
  'col-start-1 row-start-1 text-balance font-bold font-display text-lg leading-relaxed sm:text-xl';
const ICON_SWAP =
  'col-start-1 row-start-1 size-5 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)]';
const TOAST_MS = 3000;

interface Toast {
  id: number;
  message: 'copied' | 'copyFailed';
}

export default function AhwaReceipt({ order }: { order: TeaOrder }) {
  const { t, num, percent } = useLanguage();
  const [wisdom, setWisdom] = useState(0);
  const [toast, setToast] = useState<Toast | null>(null);
  const titleId = useId();
  const r = t.receipt;

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const line = orderLine(t, order);
  const price =
    BASE_PRICE[order.type] +
    SUGAR_PRICE[order.sugar] +
    ADDON_PRICE[order.addon];
  const meters = moodMeters(order);
  const copied = toast?.message === 'copied';

  function nextWisdom() {
    // Jump 1..n-1 places so the Ma'allem never repeats himself.
    const step = 1 + Math.floor(Math.random() * (r.wisdoms.length - 1));
    setWisdom((current) => (current + step) % r.wisdoms.length);
    playClink();
  }

  function showToast(message: Toast['message']) {
    setToast((current) => ({ id: (current?.id ?? 0) + 1, message }));
  }

  async function copyReceipt() {
    const amount = `${num(price)} ${r.currency}`;
    const rule = '-'.repeat(24);
    const text = [
      r.shop,
      rule,
      `${num(1)} × ${line}: ${amount}`,
      `${r.total}: ${amount}`,
      rule,
      r.metersTitle,
      ...METERS.map(({ key }) => `• ${r.meters[key]}: ${percent(meters[key])}`),
      rule,
      `${r.wisdomTitle}:`,
      r.wisdoms[wisdom],
      rule,
      r.thanks
    ].join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast('copied');
      playBell();
    } catch {
      showToast('copyFailed');
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div
        className="rotate-[-0.5deg] sm:-rotate-1"
        style={{ filter: PAPER_OUTLINE }}
      >
        <article
          aria-labelledby={titleId}
          className="zigzag relative overflow-clip bg-paper px-5 pt-10 pb-12 sm:px-8"
        >
          {/* The Ma'allem left his glass on the check: a tea ring under the text */}
          <svg
            viewBox="0 0 100 100"
            aria-hidden="true"
            fill="none"
            className="pointer-events-none absolute -inset-e-10 top-4 -z-10 size-32 stroke-caramel opacity-60"
          >
            <circle cx="50" cy="50" r="38" strokeWidth="5" />
            <circle cx="53" cy="48" r="36" strokeWidth="3" />
          </svg>
          <header className="text-center">
            <TeaGlassMark color={liquidColor(order)} />
            <h3
              id={titleId}
              className="mt-3 text-balance font-black font-display text-3xl"
            >
              {r.shop}
            </h3>
            <p className="mt-1 text-balance text-sm">{r.shopTagline}</p>
            <p className="mt-5 flex justify-between gap-4 border-espresso border-y-2 border-dashed py-2 font-bold text-sm">
              <span>
                {r.table} <span className="font-mono">{num(7)}</span>
              </span>
              <span>{r.waiter}</span>
            </p>
          </header>

          <p className="mt-6 flex justify-between gap-4 font-bold text-sm ltr:uppercase ltr:tracking-wider">
            <span>{r.order}</span>
            <span>{r.price}</span>
          </p>
          <p className="mt-2 flex justify-between gap-4">
            <span>
              <span className="font-bold font-mono">{num(1)} ×</span> {line}
            </span>
            <span className="font-bold font-mono tabular-nums">
              {num(price)}
            </span>
          </p>

          <hr className={RULE} />

          <p className="flex items-baseline gap-3 font-black text-2xl">
            {r.total}
            <span
              aria-hidden="true"
              className="flex-1 border-espresso border-b-3 border-dotted"
            />
            <span className="whitespace-nowrap">
              <span className="font-mono tabular-nums">{num(price)}</span>{' '}
              {r.currency}
            </span>
          </p>
          <p className="mt-3 -rotate-2 text-end font-display text-koshary">
            {r.tip}
          </p>

          <hr className={RULE} />

          <h4 className="flex items-center gap-2 font-bold font-display text-xl">
            <Gauge aria-hidden="true" className="size-6 shrink-0" />
            {r.metersTitle}
          </h4>
          <div className="mt-4 space-y-4">
            {METERS.map(({ key, Icon, fill }, index) => (
              <Meter
                key={key}
                label={r.meters[key]}
                value={meters[key]}
                display={percent(meters[key])}
                Icon={Icon}
                fill={fill}
                delay={index * 0.15}
              />
            ))}
          </div>

          <div className="card relative mt-12 rotate-2 bg-caramel p-5 pt-7">
            <span className="absolute -top-5 inset-s-5 grid size-10 place-items-center rounded-full border-3 border-espresso bg-brass-light">
              <Quote aria-hidden="true" className="size-5" />
            </span>
            <h4 className="font-bold text-sm">{r.wisdomTitle}</h4>
            <div aria-live="polite" className="mt-2 grid">
              {r.wisdoms.map((text) => (
                <p
                  key={text}
                  aria-hidden="true"
                  className={`invisible ${WISDOM_TEXT}`}
                >
                  {text}
                </p>
              ))}
              <AnimatePresence initial={false}>
                <m.blockquote
                  key={wisdom}
                  className={`self-center ${WISDOM_TEXT}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12, transition: { duration: 0.2 } }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {r.wisdoms[wisdom]}
                </m.blockquote>
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={nextWisdom}
              className="btn mt-4 bg-paper"
            >
              {r.nextWisdom}
            </button>
          </div>

          <footer className="mt-10 text-center">
            <p className="text-balance font-bold font-display text-lg">
              {r.thanks}
            </p>
            <div
              aria-hidden="true"
              className="mx-auto mt-4 h-14 w-56 max-w-full"
              style={{ backgroundImage: BARCODE }}
            />
            {/* Barcode digits read left to right in both languages */}
            <bdo
              dir="ltr"
              aria-hidden="true"
              className="mt-1 block font-mono text-xs tracking-[0.3em]"
            >
              {num('6 221007 000007')}
            </bdo>
          </footer>
        </article>
      </div>

      <div className="relative mt-10 flex justify-center">
        <div
          aria-live="polite"
          className="pointer-events-none absolute inset-x-0 bottom-full mb-4 grid items-end justify-items-center"
        >
          <AnimatePresence>
            {toast && (
              <m.p
                key={toast.id}
                className={`chip col-start-1 row-start-1 -rotate-2 text-cream ${toast.message === 'copied' ? 'bg-mint' : 'bg-koshary'}`}
                initial={{ opacity: 0, y: 12, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: { type: 'spring', bounce: 0.5, duration: 0.45 }
                }}
                exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              >
                {r[toast.message]}
              </m.p>
            )}
          </AnimatePresence>
        </div>
        <button
          type="button"
          onClick={copyReceipt}
          className="btn w-full bg-brass-light sm:w-auto"
        >
          <span aria-hidden="true" className="grid">
            <Copy
              className={`${ICON_SWAP} ${copied ? 'scale-0 -rotate-90' : ''}`}
            />
            <Check
              className={`${ICON_SWAP} ${copied ? '' : 'scale-0 rotate-90'}`}
            />
          </span>
          {r.copy}
        </button>
      </div>
    </div>
  );
}

interface MeterProps {
  label: string;
  value: number;
  display: string;
  Icon: LucideIcon;
  fill: string;
  delay: number;
}

function Meter({ label, value, display, Icon, fill, delay }: MeterProps) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a native <meter> cannot hold the animated fill and its label
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={display}
    >
      <div className="flex items-center justify-between gap-3 font-bold">
        <span className="flex items-center gap-2">
          <Icon aria-hidden="true" className="size-5 shrink-0" />
          {label}
        </span>
        <span className="font-mono tabular-nums">{display}</span>
      </div>
      <div className="mt-1.5 h-4 overflow-hidden rounded-full border-2 border-espresso bg-cream">
        <m.div
          className={`h-full ${fill} ltr:origin-left rtl:origin-right`}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: value / 100 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ type: 'spring', bounce: 0.35, duration: 0.9, delay }}
        />
      </div>
    </div>
  );
}

/** The ahwa's stamp: a waisted tea glass on a brass tray, filled with the order's colour. */
function TeaGlassMark({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="mx-auto size-14">
      <circle cx="24" cy="24" r="23" className="fill-espresso" />
      <path
        d="M21 10c-1.6-1.5 1.6-3 0-4.5M27 10c-1.6-1.5 1.6-3 0-4.5"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="stroke-cream"
      />
      <path
        d="M14.5 12h19l-3.6 13 2.3 12.5H15.8L18.1 25z"
        className="fill-cream"
      />
      <path
        d="M17.1 17h13.8l-2.2 8 1.9 10.5H17.4l1.9-10.5z"
        style={{ fill: color }}
        className="motion-safe:transition-colors motion-safe:duration-500"
      />
      <ellipse cx="24" cy="39.5" rx="12" ry="2" className="fill-brass-light" />
    </svg>
  );
}
