'use client';

import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { Droplets, Pause, Play, RotateCcw, Timer } from 'lucide-react';
import {
  type CSSProperties,
  memo,
  type ReactNode,
  useEffect,
  useEffectEvent,
  useId,
  useState
} from 'react';
import { liquidColor, type Strength, type TeaType } from '@/data/tea';
import { useLanguage } from '@/i18n/LanguageProvider';
import { playBell, playPour } from '@/utils/sound';

/** Steeping seconds per brew, scaled by how heavy the glass is ordered. */
const BREW_SECONDS: Record<TeaType, number> = {
  koshary: 180,
  fatla: 120,
  maghly: 300
};
const STRENGTH_FACTOR: Record<Strength, number> = {
  khafeef: 0.75,
  mazbout: 1,
  teqeel: 1.3
};
const FAST_FORWARD = 10;
/** Brewed milliseconds per re-render: the clock stays exact without rendering every frame. */
const TICK_MS = 100;

type Status = 'idle' | 'running' | 'paused' | 'done';

const pad = (value: number) => String(value).padStart(2, '0');
const formatClock = (seconds: number) =>
  `${pad(Math.floor(seconds / 60))}:${pad(seconds % 60)}`;

export default function SteepingTimer({
  type,
  strength
}: {
  type: TeaType;
  strength: Strength;
}) {
  const { t, num } = useLanguage();
  const [brew, setBrew] = useState({ type, strength });
  const [status, setStatus] = useState<Status>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [fast, setFast] = useState(false);

  // A different order is a fresh glass: back to idle.
  if (brew.type !== type || brew.strength !== strength) {
    setBrew({ type, strength });
    setStatus('idle');
    setElapsed(0);
  }

  const totalSeconds = Math.round(
    BREW_SECONDS[type] * STRENGTH_FACTOR[strength]
  );
  const totalMs = totalSeconds * 1000;
  const progress = elapsed / totalMs;

  const readElapsed = useEffectEvent(() => elapsed);
  const onFrame = useEffectEvent((next: number) => {
    if (Math.floor(next / TICK_MS) !== Math.floor(elapsed / TICK_MS)) {
      setElapsed(next);
    }
  });
  const finish = useEffectEvent(() => {
    setElapsed(totalMs);
    setStatus('done');
    playBell();
  });

  useEffect(() => {
    if (status !== 'running') return;
    const from = readElapsed();
    const startedAt = performance.now();
    const speed = fast ? FAST_FORWARD : 1;
    // Frames drive the display; the timeout still rings the bell in a background tab.
    const timeout = setTimeout(() => finish(), (totalMs - from) / speed);
    let frame = requestAnimationFrame(function tick() {
      onFrame(
        Math.min(totalMs, from + (performance.now() - startedAt) * speed)
      );
      frame = requestAnimationFrame(tick);
    });
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [status, fast, totalMs]);

  function start() {
    playPour();
    setElapsed(0);
    setStatus('running');
  }

  function reset() {
    setElapsed(0);
    setStatus('idle');
  }

  const done = status === 'done';
  const tips = t.timer.tips[type];
  const tipIndex = Math.min(
    tips.length - 1,
    Math.floor(progress * tips.length)
  );
  const message =
    status === 'idle'
      ? t.timer.idle
      : done
        ? t.timer.done[type]
        : tips[tipIndex];
  const primary =
    status === 'running'
      ? {
          label: t.timer.pause,
          Icon: Pause,
          tone: 'bg-brass-light text-espresso',
          onClick: () => setStatus('paused')
        }
      : status === 'paused'
        ? {
            label: t.timer.resume,
            Icon: Play,
            tone: 'bg-mint text-cream',
            onClick: () => setStatus('running')
          }
        : {
            label: t.timer.start,
            Icon: Droplets,
            tone: 'bg-koshary text-cream',
            onClick: start
          };
  const bubbleTone = done ? 'bg-mint text-cream' : 'bg-cream';

  return (
    <div className="@container card isolate overflow-clip bg-paper p-5 sm:p-7">
      <p className="chip mx-auto flex w-fit -rotate-1 bg-caramel @2xl:mx-0">
        <Timer aria-hidden="true" className="size-4" />
        {t.options.type[type].short} • {t.options.strength[strength].short} •{' '}
        <span className="tabular-nums">{num(formatClock(totalSeconds))}</span>
      </p>

      <div className="mt-7 grid items-center gap-8 @2xl:grid-cols-[auto_minmax(0,1fr)] @2xl:gap-10">
        <Dial
          type={type}
          strength={strength}
          status={status}
          fast={fast}
          progress={progress}
          clock={num(formatClock(Math.ceil((totalMs - elapsed) / 1000)))}
          label={t.timer.remaining}
          stamp={t.timer.doneTitle}
        />

        <div className="@container/controls mx-auto grid w-full max-w-md gap-6 @2xl:max-w-none">
          <div className="flex items-start gap-3">
            <MaallemBadge />
            <div
              className={`relative min-w-0 flex-1 rounded-2xl border-3 border-espresso px-4 pt-6 pb-4 shadow-brutal-sm transition-colors duration-300 ${bubbleTone}`}
            >
              <span
                aria-hidden="true"
                className={`absolute -inset-s-2.5 top-3.5 size-4 rotate-45 border-s-3 border-b-3 border-espresso transition-colors duration-300 rtl:-rotate-45 ${bubbleTone}`}
              />
              <p className="chip absolute -top-4 inset-s-4 rotate-1 bg-brass-light text-espresso">
                {t.timer.coach}
              </p>
              {/* Every line is laid out invisibly so the bubble never changes height. */}
              <div
                aria-live="polite"
                className="grid items-center text-pretty font-bold leading-relaxed @lg/controls:text-lg"
              >
                {[t.timer.idle, ...tips, t.timer.done[type]].map((line) => (
                  <span
                    key={line}
                    className="invisible col-start-1 row-start-1"
                  >
                    {line}
                  </span>
                ))}
                <AnimatePresence initial={false}>
                  <m.p
                    key={done || status === 'idle' ? status : tipIndex}
                    className="col-start-1 row-start-1"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    {done && (
                      <span className="sr-only">{t.timer.doneTitle} </span>
                    )}
                    {message}
                  </m.p>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            <button
              type="button"
              onClick={primary.onClick}
              className={`btn min-h-14 font-display text-lg ${primary.tone}`}
            >
              <primary.Icon aria-hidden="true" className="size-5 shrink-0" />
              {primary.label}
            </button>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
              <button
                type="button"
                aria-pressed={fast}
                onClick={() => setFast(!fast)}
                className="group btn min-h-14 justify-between text-balance bg-cream text-start text-sm leading-snug @sm/controls:text-base aria-pressed:translate-x-1 aria-pressed:translate-y-1 aria-pressed:bg-brass-light aria-pressed:shadow-none"
              >
                {t.timer.fastForward}
                <span
                  aria-hidden="true"
                  className="shrink-0 rounded-full border-2 border-espresso px-2 text-sm tabular-nums group-aria-pressed:bg-espresso group-aria-pressed:text-cream"
                >
                  {num(FAST_FORWARD)}×
                </span>
              </button>
              <button
                type="button"
                onClick={reset}
                disabled={status === 'idle'}
                title={t.timer.reset}
                className="btn min-h-14 w-14 bg-cream px-0 @lg/controls:w-auto @lg/controls:px-5"
              >
                <RotateCcw
                  aria-hidden="true"
                  className="size-5 shrink-0 rtl:-scale-x-100"
                />
                <span className="sr-only @lg/controls:not-sr-only">
                  {t.timer.reset}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dial geometry, in a 256 viewBox whose centre leaves room for the hard shadow.
const C = 124;
const TRACK = 101;
/** Hour ticks, leaving 12 and 6 o'clock clear for the art and the label. */
const TICKS = [30, 60, 90, 120, 150, 210, 240, 270, 300, 330];
/** Sunburst rays every 20 degrees. */
const RAYS = Array.from({ length: 18 }, (_, ray) => ray * 20);
const SPARKLES = [
  { deg: 20, tone: 'fill-brass-light' },
  { deg: 65, tone: 'fill-mint' },
  { deg: 110, tone: 'fill-fatla' },
  { deg: 155, tone: 'fill-wood' },
  { deg: 200, tone: 'fill-brass-light' },
  { deg: 245, tone: 'fill-mint' },
  { deg: 290, tone: 'fill-fatla' },
  { deg: 335, tone: 'fill-wood' }
];
const STAR =
  'M0-11C1.2-3.2 3.2-1.2 11 0 3.2 1.2 1.2 3.2 0 11-1.2 3.2-3.2 1.2-11 0-3.2-1.2-1.2-3.2 0-11Z';
const POP = [1, 1.06, 0.97, 1];
const ORIGIN = {
  center: { transformBox: 'fill-box', transformOrigin: '50% 50%' },
  top: { transformBox: 'fill-box', transformOrigin: '50% 0%' },
  bottom: { transformBox: 'fill-box', transformOrigin: '50% 100%' }
} as const;

function Dial({
  type,
  strength,
  status,
  fast,
  progress,
  clock,
  label,
  stamp
}: {
  type: TeaType;
  strength: Strength;
  status: Status;
  fast: boolean;
  progress: number;
  clock: string;
  label: string;
  stamp: string;
}) {
  const labelId = useId();
  const dotsId = useId();
  const raysId = useId();
  const done = status === 'done';

  return (
    <div
      className="@container relative mx-auto aspect-square w-full max-w-72 @2xl:w-64"
      style={{ '--steep': progress } as CSSProperties}
    >
      {/* Pop-art sunburst that turns only while the tea brews (pausing never snaps it back). */}
      <svg
        viewBox="-100 -100 200 200"
        aria-hidden="true"
        className="absolute inset-[-24%] -z-10 motion-safe:animate-spin"
        style={{
          animationDuration: '72s',
          animationPlayState: status === 'running' ? 'running' : 'paused'
        }}
      >
        <radialGradient
          id={raysId}
          gradientUnits="userSpaceOnUse"
          cx={0}
          cy={0}
          r={100}
        >
          <stop
            offset={0.5}
            style={{ stopColor: 'var(--color-brass-light)', stopOpacity: 0.45 }}
          />
          <stop
            offset={1}
            style={{ stopColor: 'var(--color-brass-light)', stopOpacity: 0 }}
          />
        </radialGradient>
        <g fill={`url(#${raysId})`}>
          {RAYS.map((deg) => (
            <path key={deg} d="M0 0L-10-100H10Z" transform={`rotate(${deg})`} />
          ))}
        </g>
      </svg>

      <m.div
        className="absolute inset-0"
        animate={{ scale: done ? POP : 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <svg
          viewBox="0 0 256 256"
          aria-hidden="true"
          className="absolute inset-0 size-full overflow-visible stroke-espresso"
          fill="none"
        >
          <pattern
            id={dotsId}
            width={7}
            height={7}
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx={3.5}
              cy={3.5}
              r={1.2}
              stroke="none"
              className="fill-caramel"
            />
          </pattern>
          <circle cx={C + 6} cy={C + 6} r={120} className="fill-espresso" />
          <circle
            cx={C}
            cy={C}
            r={118.5}
            strokeWidth={3}
            className="fill-caramel"
          />
          <circle cx={C} cy={C} r={TRACK} strokeWidth={22} />
          <circle
            cx={C}
            cy={C}
            r={TRACK}
            strokeWidth={13}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${progress} 1`}
            transform={`rotate(-90 ${C} ${C})`}
            className={
              status === 'paused' ? 'stroke-brass' : 'stroke-brass-light'
            }
          />
          <circle cx={C} cy={C} r={90} stroke="none" className="fill-paper" />
          <circle cx={C} cy={C} r={90} stroke="none" fill={`url(#${dotsId})`} />
          <g strokeLinecap="round">
            {TICKS.map((deg) => (
              <line
                key={deg}
                x1={C}
                x2={C}
                y1={C - 84}
                y2={C - (deg % 90 ? 78 : 72)}
                strokeWidth={deg % 90 ? 2 : 3}
                transform={`rotate(${deg} ${C} ${C})`}
              />
            ))}
          </g>
          <circle
            cx={C}
            cy={C - TRACK}
            r={9}
            strokeWidth={2.5}
            transform={`rotate(${progress * 360} ${C} ${C})`}
            className="fill-koshary stroke-paper"
          />
          {done &&
            SPARKLES.map(({ deg, tone }, i) => (
              <g
                key={deg}
                transform={`rotate(${deg} ${C} ${C}) translate(${C} ${C - 134})`}
              >
                <m.path
                  d={STAR}
                  strokeWidth={2}
                  className={tone}
                  style={ORIGIN.center}
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.25, 0], rotate: 90 }}
                  transition={{
                    duration: 0.9,
                    delay: i * 0.05,
                    repeat: 1,
                    repeatDelay: 0.2
                  }}
                />
              </g>
            ))}
        </svg>

        <div className="absolute inset-[17%] flex flex-col items-center justify-center">
          <BrewArt
            type={type}
            strength={strength}
            status={status}
            fast={fast}
          />
          <span
            role="timer"
            aria-labelledby={labelId}
            className={`font-black text-[18cqi] leading-none tabular-nums ${status === 'paused' ? 'motion-safe:animate-pulse' : ''}`}
          >
            {clock}
          </span>
          <span
            id={labelId}
            className="mt-[1.5cqi] font-bold text-[max(0.75rem,5cqi)] ltr:uppercase ltr:tracking-wider"
          >
            {label}
          </span>
        </div>
      </m.div>

      <AnimatePresence>
        {done && (
          <m.p
            key="stamp"
            aria-hidden="true"
            className="absolute inset-x-0 bottom-[3%] mx-auto w-max rounded-full border-3 border-espresso bg-mint px-4 py-1 font-bold font-display text-cream text-xl shadow-brutal-sm"
            initial={{ opacity: 0, scale: 1.8, rotate: -16 }}
            animate={{ opacity: 1, scale: 1, rotate: -7 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 16 }}
          >
            {stamp}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ArtProps {
  active: boolean;
  done: boolean;
  speed: number;
}

const HOP = [0, -10, 0, -4, 0];
const SETTLE = { type: 'spring', stiffness: 300, damping: 20 } as const;
const loop = (seconds: number, speed: number) =>
  ({ duration: seconds / speed, repeat: Infinity, ease: 'easeInOut' }) as const;

/** Memoized: the dial re-renders on every clock tick while the tea brews. */
const BrewArt = memo(function BrewArt({
  type,
  strength,
  status,
  fast
}: {
  type: TeaType;
  strength: Strength;
  status: Status;
  fast: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const art: ArtProps = {
    active: status === 'running' && !reduceMotion,
    done: status === 'done',
    speed: fast ? 3 : 1
  };
  const tea = liquidColor({ type, strength, sugar: 'sada', addon: 'none' });

  return (
    <m.svg
      viewBox="0 0 80 80"
      aria-hidden="true"
      className="w-1/2 overflow-visible stroke-espresso"
      fill="none"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ y: art.done ? HOP : 0 }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      {/* Re-keyed on speed so the running loops restart at the new tempo. */}
      <g key={art.speed} style={{ '--tea': tea } as CSSProperties}>
        {type === 'fatla' ? (
          <FatlaArt {...art} />
        ) : type === 'koshary' ? (
          <KosharyArt {...art} />
        ) : (
          <MaghlyArt {...art} />
        )}
      </g>
    </m.svg>
  );
});

const GLASS =
  'M23 16C23 27 29 31 29 40C29 48 24 52 24 60C24 67 28 71 33 71H47C52 71 56 67 56 60C56 52 51 48 51 40C51 31 57 27 57 16Z';
/** Pale gold hot water deepening into the full brew as the dial fills. */
const TEA_FILL = {
  fill: 'color-mix(in srgb, var(--tea) calc(25% + var(--steep) * 75%), color-mix(in srgb, var(--color-brass-light) 55%, var(--color-paper)))'
};

/** The waisted ahwa glass on its saucer; children are clipped inside the glass. */
function Glass({ children }: { children: ReactNode }) {
  const clipId = useId();
  return (
    <>
      <ellipse
        cx={40}
        cy={72.5}
        rx={19}
        ry={3.5}
        className="fill-brass-light"
      />
      <path d={GLASS} className="fill-paper" />
      <clipPath id={clipId}>
        <path d={GLASS} />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <rect
          y={26}
          width={80}
          height={54}
          strokeWidth={1.5}
          style={TEA_FILL}
        />
        {children}
      </g>
      <path d={GLASS} strokeWidth={3} />
      <path
        d="M27.5 21C27.5 26 29 29.5 31 33M28.5 56C28 60 28.5 63 30.5 65.5"
        className="stroke-paper opacity-80"
      />
    </>
  );
}

function Steam({
  wisps,
  y,
  speed
}: {
  wisps: number[];
  y: number;
  speed: number;
}) {
  return wisps.map((x, i) => (
    <m.path
      key={x}
      d={`M${x} ${y}c-2.5-2.5 2.5-5.5 0-9`}
      strokeWidth={2}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.55, 0], y: [2, -5] }}
      transition={{
        duration: 1.6 / speed,
        delay: (i * 0.5) / speed,
        repeat: Infinity,
        ease: 'easeOut'
      }}
    />
  ));
}

/** A tea bag dunking on its string while the yellow tag bobs outside the glass. */
function FatlaArt({ active, done, speed }: ArtProps) {
  const motion = active ? loop(1.8, speed) : SETTLE;
  return (
    <>
      <Glass>
        <m.g
          animate={{ y: active ? [0, -20, 0] : done ? -28 : 0 }}
          transition={motion}
        >
          <rect
            x={34}
            y={45}
            width={12}
            height={14}
            rx={2}
            strokeWidth={2}
            className="fill-caramel"
          />
          <path d="M36.5 49H43.5" strokeWidth={1.5} />
        </m.g>
      </Glass>
      <g strokeWidth={1.5}>
        <m.line
          x1={40}
          x2={55.5}
          y2={16}
          initial={{ y1: 45 }}
          animate={{ y1: active ? [45, 25, 45] : done ? 17 : 45 }}
          transition={motion}
        />
        <m.line
          x1={56}
          y1={16}
          x2={62.5}
          initial={{ y2: 29 }}
          animate={{ y2: active ? [29, 37, 29] : done ? 39 : 29 }}
          transition={motion}
        />
      </g>
      <m.g
        style={ORIGIN.top}
        animate={{
          y: active ? [0, 8, 0] : done ? 10 : 0,
          rotate: active ? [-6, 6, -6] : 0
        }}
        transition={motion}
      >
        <rect
          x={57.5}
          y={29}
          width={10}
          height={12}
          rx={1.5}
          strokeWidth={2}
          className="fill-brass-light"
        />
        <path d="M60 34H65" strokeWidth={1.5} />
      </m.g>
      {active && <Steam wisps={[33, 40, 47]} y={12} speed={speed} />}
    </>
  );
}

/** Loose leaves that sink one by one as the brew progresses (driven by --steep). */
const LEAVES = [
  { x: 32.5, y: 29, turn: 25, rate: 1.15, fall: 38 },
  { x: 36.5, y: 33, turn: -35, rate: 2.6, fall: 34 },
  { x: 40.5, y: 28, turn: 70, rate: 1.6, fall: 40 },
  { x: 44.5, y: 32, turn: -15, rate: 3.4, fall: 35 },
  { x: 48, y: 29, turn: 40, rate: 1.3, fall: 37 },
  { x: 38.5, y: 36, turn: -60, rate: 2.1, fall: 31 }
];

function KosharyArt({ active, speed }: ArtProps) {
  return (
    <>
      <Glass>
        {LEAVES.map(({ x, y, turn, rate, fall }, i) => (
          <g
            key={x}
            style={{
              translate: `0 calc(min(1, var(--steep) * ${rate}) * ${fall}px)`
            }}
          >
            <m.ellipse
              cx={x}
              cy={y}
              rx={3.2}
              ry={1.6}
              strokeWidth={0.8}
              className="fill-espresso stroke-paper"
              style={ORIGIN.center}
              initial={{ rotate: turn }}
              animate={
                active
                  ? { rotate: [turn, turn + 50, turn], x: [0, 1.2, 0] }
                  : { rotate: turn, x: 0 }
              }
              transition={active ? loop(2 + i * 0.35, speed) : SETTLE}
            />
          </g>
        ))}
      </Glass>
      {active && <Steam wisps={[33, 40, 47]} y={12} speed={speed} />}
    </>
  );
}

/** A blue enamel teapot boiling on a brass sabertaya with a flickering flame. */
function MaghlyArt({ active, done, speed }: ArtProps) {
  const lowFlame = done
    ? { scaleX: 0.7, scaleY: 0.55 }
    : { scaleX: 0.8, scaleY: 0.7 };
  return (
    <>
      <path d="M24 48L28.5 63M56 48L51.5 63" />
      <path
        d="M23 66C23 62.5 30 61 40 61S57 62.5 57 66V70.5C57 74 50 76 40 76S23 74 23 70.5Z"
        className="fill-brass-light"
      />
      <path d="M23 66C23 69.5 30 71 40 71S57 69.5 57 66" strokeWidth={2} />
      <rect
        x={35.5}
        y={56}
        width={9}
        height={6}
        rx={1.5}
        strokeWidth={2}
        className="fill-brass"
      />
      <m.g
        style={ORIGIN.bottom}
        initial={{ scaleX: 0.8, scaleY: 0.7 }}
        animate={
          active
            ? { scaleX: [1, 0.9, 1.08, 0.94, 1], scaleY: [1, 1.3, 0.9, 1.2, 1] }
            : lowFlame
        }
        transition={active ? loop(0.7, speed) : SETTLE}
      >
        <path
          d="M40 57.5C35 57.5 34 52.5 36.5 49C37.5 51 39.2 51.2 39.2 49.2C39.2 46.2 41 44 42.6 42.5C43.2 46.5 46.5 48.5 45.6 52.6C45 55.8 42.8 57.5 40 57.5Z"
          strokeWidth={1.8}
          className="fill-fatla"
        />
        <path
          d="M40 56.5C37.8 56.5 37.4 54.3 38.6 52.7C39.3 53.6 40.3 53.4 40.3 52.2C41.8 53.3 42.6 54.6 42.1 55.6C41.7 56.2 41 56.5 40 56.5Z"
          stroke="none"
          className="fill-brass-light"
        />
      </m.g>
      <path d="M21 48H59" strokeWidth={3} />
      <path d="M27 31C17 30 15.5 44 25.5 44.5" strokeWidth={3.2} />
      <path
        d="M54 41C58 39 61 35 63 30L66.5 25.5C67.5 24.5 69.5 25.5 69 27L66 33C64 38 60 42.5 55.5 45Z"
        strokeWidth={2.2}
        className="fill-wood"
      />
      <path
        d="M24.5 46.5C21 41 22 32 29.5 28.5H50.5C58 32 59 41 55.5 46.5Z"
        className="fill-wood"
      />
      <path d="M28 41C27.5 37.5 28.5 34 31 32" className="stroke-paper" />
      <m.g
        style={ORIGIN.bottom}
        strokeWidth={2.2}
        animate={
          active
            ? { y: [0, -2.5, 0, -1.5, 0], rotate: [0, -6, 0, 4, 0] }
            : { y: 0, rotate: 0 }
        }
        transition={
          active ? { ...loop(0.55, speed), repeatDelay: 0.5 / speed } : SETTLE
        }
      >
        <path
          d="M31.5 28.5C31.5 24 35 21.5 40 21.5S48.5 24 48.5 28.5Z"
          className="fill-wood"
        />
        <circle
          cx={40}
          cy={19.5}
          r={2.6}
          strokeWidth={1.8}
          className="fill-brass-light"
        />
      </m.g>
      {active && <Steam wisps={[66, 71]} y={21} speed={speed} />}
    </>
  );
}

/** The Ma'allem himself: tarboosh, eyebrows and a mustache that means business. */
function MaallemBadge() {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="size-12 shrink-0 -rotate-3 rounded-full border-3 border-espresso bg-wood stroke-espresso shadow-brutal-sm"
      fill="none"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M7 48C9 40.5 16 38 24 38S39 40.5 41 48Z"
        className="fill-paper"
      />
      <circle cx={24} cy={28} r={13} className="fill-caramel" />
      <path
        d="M14.5 19L16.5 6.5Q24 4.5 31.5 6.5L33.5 19Q24 21 14.5 19Z"
        className="fill-fatla"
      />
      <path d="M24 6C29 5 33 8 34 13" strokeWidth={1.8} />
      <path d="M34 13L35.5 18.5" strokeWidth={3} />
      <path d="M17.5 23.5L21.5 22.5M26.5 22.5L30.5 23.5" />
      <g stroke="none" className="fill-espresso">
        <circle cx={19.5} cy={26.5} r={1.5} />
        <circle cx={28.5} cy={26.5} r={1.5} />
        <path d="M15.5 34C18 31 21.5 31.5 24 33C26.5 31.5 30 31 32.5 34C29.5 33.6 27 35.2 24 35.2S18.5 33.6 15.5 34Z" />
      </g>
      <path d="M21 37.6Q24 39 27 37.6" strokeWidth={1.6} />
    </svg>
  );
}
