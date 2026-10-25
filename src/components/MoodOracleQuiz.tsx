'use client';

import { AnimatePresence, m, useIsPresent, type Variants } from 'framer-motion';
import {
  ArrowDown,
  ArrowLeft,
  BatteryLow,
  CircleCheck,
  CookingPot,
  Croissant,
  EighthNotes,
  Gavel,
  Laptop,
  type LucideIcon,
  Megaphone,
  MoonStar,
  RotateCcw,
  Snowflake,
  Timer,
  WandSparkles,
  Wind,
  X
} from 'lucide-react';
import { type MouseEvent, type ReactNode, useId, useState } from 'react';
import {
  DEFAULT_ORDER,
  liquidColor,
  QUIZ,
  QUIZ_EFFECTS,
  type QuizAnswer,
  type QuizQuestion,
  type TeaOrder
} from '@/data/tea';
import { orderLine } from '@/i18n/format';
import { useLanguage } from '@/i18n/LanguageProvider';
import { playClink, playPlop } from '@/utils/sound';

const QUESTIONS = Object.keys(QUIZ) as QuizQuestion[];
const ANSWER_ICONS: Record<QuizAnswer, LucideIcon> = {
  headache: BatteryLow,
  chill: EighthNotes,
  rushed: Timer,
  heavy: CookingPot,
  breakfast: Croissant,
  empty: Wind,
  balcony: MoonStar,
  office: Laptop,
  blanket: Snowflake
};
const ICON_BADGES = [
  'bg-brass-light',
  'bg-mint text-cream',
  'bg-fatla text-cream'
];
/** The Ma'allem cocks his head a different way at every question. */
const HEAD_TILT = [-5, 5, -5];
/** His portrait frame; the head is drawn outside its clip so the tarboosh pops out over the top. */
const FRAME = { x: 14, y: 40, width: 212, height: 198, rx: 30 };
const SPARKLES = [
  [30, 40, 13],
  [208, 28, 10],
  [226, 112, 8]
];

const slide: Variants = {
  enter: (dx: number) => ({ x: 48 * dx, opacity: 0 }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 32,
      staggerChildren: 0.05
    }
  },
  exit: (dx: number) => ({
    x: -48 * dx,
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' }
  })
};
const rise: Variants = {
  enter: { opacity: 0, y: 14 },
  center: { opacity: 1, y: 0 }
};

/** The house glass, tweaked by every answer in order. */
function brew(answers: readonly QuizAnswer[]): TeaOrder {
  return Object.assign(
    { ...DEFAULT_ORDER },
    ...answers.map((answer) => QUIZ_EFFECTS[answer])
  );
}

/** Moves focus to each new heading so keyboard and screen-reader users follow the flow. */
function focusOnMount(node: HTMLElement | null) {
  node?.focus();
}

/** A four-point pop-art sparkle centred on (x, y). */
function sparkle(x: number, y: number, r: number) {
  const k = r / 4;
  return `M${x} ${y - r}L${x + k} ${y - k}L${x + r} ${y}L${x + k} ${y + k}L${x} ${y + r}L${x - k} ${y + k}L${x - r} ${y}L${x - k} ${y - k}Z`;
}

interface MaallemProps {
  title: string;
  tea: string;
  tilt: number;
  approving: boolean;
}

/** The Ma'allem in his tarboosh, holding a glass of whatever the quiz has brewed so far. */
function Maallem({ title, tea, tilt, approving }: MaallemProps) {
  const frameId = useId();

  return (
    <svg
      viewBox="0 0 240 250"
      role="img"
      className="h-auto w-full overflow-visible"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>{title}</title>
      <defs>
        <clipPath id={frameId}>
          <rect {...FRAME} />
        </clipPath>
      </defs>
      <rect {...FRAME} x={20} y={46} className="fill-espresso" />
      <rect {...FRAME} className="fill-brass-light" />
      <g
        clipPath={`url(#${frameId})`}
        className="stroke-espresso"
        strokeWidth="3"
      >
        <m.circle
          cx="120"
          cy="110"
          r="80"
          className="fill-none stroke-brass opacity-55"
          strokeWidth="160"
          strokeDasharray="12.566 12.566"
          strokeLinecap="butt"
          animate={{ rotate: approving ? 360 : 0 }}
          transition={
            approving
              ? { duration: 40, ease: 'linear', repeat: Infinity }
              : { duration: 0.6 }
          }
        />
        <path
          d="M26 250C28 200 62 178 100 168H140C178 178 212 200 214 250Z"
          className="fill-wood"
          strokeWidth="3.5"
        />
        <path
          d="M38 204C48 188 66 178 86 176L82 250H42Z"
          className="fill-paper"
        />
        <path
          d="M41 212L84 207M41 221L83 216"
          className="stroke-fatla"
          strokeWidth="4"
        />
        <path d="M102 146V170L120 194L138 170V146Z" className="fill-caramel" />
        <circle
          cx="120"
          cy="208"
          r="3"
          className="fill-paper"
          strokeWidth="2"
        />
        <circle
          cx="120"
          cy="222"
          r="3"
          className="fill-paper"
          strokeWidth="2"
        />
        <m.g
          animate={approving ? { rotate: 10, y: -16 } : { rotate: 0, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 15 }}
          style={{ originY: 1 }}
        >
          <path
            d="M152 262C154 244 160 230 168 220H196C200 236 200 250 198 262Z"
            className="fill-wood"
            strokeWidth="3.5"
          />
          <m.path
            d="M161.5 177H190.5C189 184 184 189 184 195C184 203 191 208 191 222H161C161 208 168 203 168 195C168 189 163 184 161.5 177Z"
            stroke="none"
            animate={{ fill: tea }}
            transition={{ duration: 0.6 }}
          />
          <path
            d="M160 170H192C191 184 184 189 184 195C184 203 191 208 191 222H161C161 208 168 203 168 195C168 189 161 184 160 170Z"
            className="fill-none"
          />
          <path
            d="M165 176Q167 186 170 190"
            className="fill-none stroke-paper opacity-80"
            strokeWidth="2.5"
          />
          <rect
            x="155"
            y="204"
            width="42"
            height="21"
            rx="10.5"
            className="fill-caramel"
          />
          <path d="M166 206V215M176 206V215M186 206V215" strokeWidth="2" />
          {[171, 182].map((x, i) => (
            <m.path
              key={x}
              d={`M${x} 162q-4-4 0-8q4-4 0-8`}
              className="fill-none"
              strokeWidth="2.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0], y: [2, -8] }}
              transition={{
                duration: 2.4,
                delay: i * 1.2,
                repeat: Infinity,
                ease: 'easeOut'
              }}
            />
          ))}
        </m.g>
      </g>
      <rect
        {...FRAME}
        className="fill-none stroke-espresso"
        strokeWidth="3.5"
      />
      <m.g
        className="stroke-espresso"
        strokeWidth="3"
        animate={{ rotate: tilt }}
        transition={{ type: 'spring', stiffness: 220, damping: 12 }}
        style={{ originY: 1 }}
      >
        <ellipse cx="79" cy="112" rx="8" ry="12" className="fill-caramel" />
        <ellipse cx="161" cy="112" rx="8" ry="12" className="fill-caramel" />
        <ellipse
          cx="120"
          cy="110"
          rx="42"
          ry="46"
          className="fill-caramel"
          strokeWidth="3.5"
        />
        <circle
          cx="95"
          cy="124"
          r="8"
          stroke="none"
          className="fill-fatla opacity-35"
        />
        <circle
          cx="145"
          cy="124"
          r="8"
          stroke="none"
          className="fill-fatla opacity-35"
        />
        <m.path
          d="M92 98Q103 90 114 97M126 97Q137 90 148 98"
          className="fill-none"
          strokeWidth="6"
          animate={{ y: approving ? -4 : 0 }}
        />
        {approving ? (
          <path
            d="M98 109Q105 100 112 109M128 109Q135 100 142 109"
            className="fill-none"
            strokeWidth="4"
          />
        ) : (
          <m.g
            stroke="none"
            animate={{ scaleY: [1, 0.1, 1] }}
            transition={{ duration: 0.22, repeat: Infinity, repeatDelay: 4 }}
          >
            <ellipse
              cx="105"
              cy="107"
              rx="4.5"
              ry="6"
              className="fill-espresso"
            />
            <ellipse
              cx="135"
              cy="107"
              rx="4.5"
              ry="6"
              className="fill-espresso"
            />
            <circle cx="106.5" cy="105" r="1.6" className="fill-paper" />
            <circle cx="136.5" cy="105" r="1.6" className="fill-paper" />
          </m.g>
        )}
        <ellipse cx="120" cy="123" rx="10" ry="8.5" className="fill-caramel" />
        {approving ? (
          <path d="M107 149Q120 170 133 149Z" className="fill-koshary" />
        ) : (
          <path d="M110 153Q120 159 130 153" className="fill-none" />
        )}
        <path
          d="M120 134C128 128 145 128 154 136C160 141 167 140 169 132C170 146 158 154 145 150C135 148 128 147 120 150C112 147 105 148 95 150C82 154 70 146 71 132C73 140 80 141 86 136C95 128 112 128 120 134Z"
          stroke="none"
          className="fill-espresso"
        />
        <g transform="rotate(-6 120 80)">
          <path
            d="M80 82L91 30H149L160 82Q120 92 80 82Z"
            className="fill-fatla"
            strokeWidth="3.5"
          />
          <path
            d="M82 75Q120 85 158 75"
            className="fill-none stroke-koshary"
            strokeWidth="5"
          />
          <ellipse cx="120" cy="30" rx="29" ry="6" className="fill-koshary" />
          <path d="M120 30Q142 26 150 42" className="fill-none" />
          {/* The tassel hangs loose, so it swings back whenever the head tilts */}
          <m.path
            d="M146 42H154L158 70Q150 76 142 70Z"
            stroke="none"
            className="fill-espresso"
            animate={{ rotate: -tilt * 2 }}
            transition={{ type: 'spring', stiffness: 120, damping: 5 }}
            style={{ originY: 0 }}
          />
        </g>
      </m.g>
      {approving &&
        SPARKLES.map(([x, y, r], i) => (
          <m.path
            key={x}
            d={sparkle(x, y, r)}
            className="fill-paper stroke-espresso"
            strokeWidth="2.5"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 12,
              delay: 0.3 + i * 0.12
            }}
          />
        ))}
    </svg>
  );
}

/** One step of the flow; it goes inert while sliding out so a double click can't answer twice. */
function Slide({ dx, children }: { dx: number; children: ReactNode }) {
  const isPresent = useIsPresent();
  return (
    <m.div
      custom={dx}
      variants={slide}
      initial="enter"
      animate="center"
      exit="exit"
      inert={!isPresent}
    >
      {children}
    </m.div>
  );
}

interface QuestionProps {
  question: QuizQuestion;
  chosen?: QuizAnswer;
  progressId: string;
  onChoose: (answer: QuizAnswer) => void;
}

function Question({ question, chosen, progressId, onChoose }: QuestionProps) {
  const { t } = useLanguage();
  const answers: readonly QuizAnswer[] = QUIZ[question];

  return (
    <>
      <h3
        ref={focusOnMount}
        tabIndex={-1}
        aria-describedby={progressId}
        className="text-balance font-bold font-display text-2xl sm:text-3xl"
      >
        {t.quiz.questions[question]}
      </h3>
      <ul className="mt-5 grid gap-3 sm:grid-cols-3">
        {answers.map((answer, a) => {
          const Icon = ANSWER_ICONS[answer];
          return (
            <m.li key={answer} variants={rise}>
              <button
                type="button"
                aria-pressed={chosen === answer}
                onClick={() => onChoose(answer)}
                className="card press group flex size-full items-center gap-3 bg-cream p-3 text-start font-bold aria-pressed:bg-caramel sm:flex-col sm:items-start sm:p-4 sm:text-lg"
              >
                <span
                  className={`grid size-11 shrink-0 -rotate-3 place-items-center rounded-xl border-3 border-espresso motion-safe:transition-transform group-hover:rotate-3 ${ICON_BADGES[a]}`}
                >
                  <Icon aria-hidden="true" className="size-6" />
                </span>
                {t.quiz.answers[answer].label}
              </button>
            </m.li>
          );
        })}
      </ul>
    </>
  );
}

interface VerdictProps {
  order: TeaOrder;
  answers: readonly QuizAnswer[];
  onRetry: () => void;
}

function Verdict({ order, answers, onRetry }: VerdictProps) {
  const { t, num } = useLanguage();

  return (
    <>
      <h3
        ref={focusOnMount}
        tabIndex={-1}
        className="text-balance font-black font-display text-3xl sm:text-4xl"
      >
        {t.quiz.verdicts[order.type]}
      </h3>
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <m.div variants={rise} className="relative self-start">
          <div className="-rotate-1 drop-shadow-[4px_4px_0_var(--color-espresso)]">
            <div className="zigzag bg-brass-light px-5 py-7">
              <p className="flex items-center gap-2 font-bold text-sm">
                <Megaphone aria-hidden="true" className="size-4 shrink-0" />
                {t.quiz.shout}
              </p>
              <p className="mt-2 font-bold font-display text-lg leading-relaxed">
                {orderLine(t, order)}
              </p>
            </div>
          </div>
          <m.p
            className="absolute -bottom-3 inset-e-4 -rotate-6 rounded-lg border-3 border-koshary bg-paper px-2.5 py-0.5 font-black font-display text-koshary text-sm uppercase"
            initial={{ scale: 2.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 520,
              damping: 20,
              delay: 0.4
            }}
          >
            {t.quiz.stamp}
          </m.p>
        </m.div>
        <m.div variants={rise}>
          <h4 className="flex items-center gap-2 font-bold text-lg">
            <Gavel aria-hidden="true" className="size-5" />
            {t.quiz.reasons}
          </h4>
          <ol className="mt-3 space-y-2.5">
            {answers.map((answer, i) => (
              <li key={answer} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-7 shrink-0 place-items-center rounded-full bg-espresso font-bold text-cream text-sm tabular-nums"
                >
                  {num(i + 1)}
                </span>
                {t.quiz.answers[answer].quip}
              </li>
            ))}
          </ol>
        </m.div>
      </div>
      <m.p variants={rise} className="mt-8 flex items-center gap-2 font-bold">
        <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-mint" />
        {t.quiz.applied}
      </m.p>
      <m.div variants={rise} className="mt-4 flex flex-wrap gap-3">
        <a href="#studio" className="btn grow bg-brass-light sm:grow-0">
          {t.quiz.seeGlass}
          <ArrowDown aria-hidden="true" className="size-5" />
        </a>
        <button
          type="button"
          onClick={onRetry}
          className="btn grow bg-paper sm:grow-0"
        >
          <RotateCcw aria-hidden="true" className="size-5" />
          {t.quiz.retry}
        </button>
      </m.div>
    </>
  );
}

export default function MoodOracleQuiz({
  onVerdict
}: {
  onVerdict: (order: TeaOrder) => void;
}) {
  const { dir, t, num } = useLanguage();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [direction, setDirection] = useState(1);
  const panelId = useId();
  const progressId = useId();

  const done = step === QUESTIONS.length;
  const order = brew(answers.slice(0, step));
  // Forward moves toward the inline end, which is the left in RTL.
  const dx = direction * (dir === 'rtl' ? -1 : 1);
  const reaction =
    step > 0 ? t.quiz.answers[answers[step - 1]].quip : t.quiz.listening;
  const bubble = open ? (done ? t.quiz.final : reaction) : t.quiz.greeting;

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    // Safari doesn't focus clicked buttons, so closing would otherwise drop focus from the unmounted panel to <body>
    event.currentTarget.focus();
    setOpen(!open);
    setDirection(1);
  }

  function choose(answer: QuizAnswer) {
    const next = [...answers];
    next[step] = answer;
    setAnswers(next);
    setDirection(1);
    setStep(step + 1);
    playPlop();
    if (step + 1 === QUESTIONS.length) {
      onVerdict(brew(next));
      window.setTimeout(playClink, 250);
    }
  }

  function goBack() {
    setDirection(-1);
    setStep(step - 1);
  }

  function retry() {
    setDirection(-1);
    setAnswers([]);
    setStep(0);
  }

  return (
    <div className="card relative grid grid-cols-[6.5rem_minmax(0,1fr)] items-start gap-x-4 gap-y-6 bg-paper p-4 pt-7 sm:grid-cols-[10rem_minmax(0,1fr)] sm:p-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-x-10 lg:p-8">
      <p className="chip absolute -top-4 inset-e-5 rotate-3 bg-mint text-cream">
        {t.quiz.badge}
      </p>
      {/* On wide screens his running commentary moves under him once the quiz is open */}
      <div
        className={open ? 'contents lg:flex lg:flex-col lg:gap-6' : 'contents'}
      >
        <div className={open ? undefined : 'lg:row-span-2'}>
          <Maallem
            title={t.quiz.maallem}
            tea={liquidColor(order)}
            tilt={open && !done ? HEAD_TILT[step] : 0}
            approving={open && done}
          />
        </div>
        <div
          aria-live="polite"
          className={`relative flex items-center self-center rounded-2xl border-3 border-espresso bg-cream px-4 py-3 font-bold text-sm shadow-brutal-sm sm:min-h-0 sm:text-base lg:px-5 ${open ? 'min-h-33 lg:min-h-38 lg:self-stretch' : 'min-h-27 lg:w-fit lg:self-end lg:text-lg'}`}
        >
          <span
            aria-hidden="true"
            className={`absolute top-1/2 -inset-s-2.75 size-4 -translate-y-1/2 rotate-45 border-espresso border-s-3 border-b-3 bg-cream rtl:-rotate-45 ${open ? 'lg:inset-x-0 lg:-top-2.75 lg:mx-auto lg:translate-y-0 lg:border-t-3 lg:border-b-0' : ''}`}
          />
          <AnimatePresence initial={false} mode="wait">
            <m.p
              key={open ? step : 'closed'}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-pretty"
            >
              {bubble}
            </m.p>
          </AnimatePresence>
        </div>
      </div>
      <div
        className={`col-span-2 flex flex-col lg:col-span-1 lg:col-start-2 ${open ? 'lg:self-stretch' : ''}`}
      >
        {!open && (
          <p className="max-w-prose text-pretty text-lg">{t.quiz.teaser}</p>
        )}
        <div id={panelId} hidden={!open}>
          {open && (
            <>
              <div className="flex min-h-11 items-center gap-3">
                {step > 0 && !done && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="btn bg-paper px-3 text-sm"
                  >
                    <ArrowLeft
                      aria-hidden="true"
                      className="size-4 rtl:-scale-x-100"
                    />
                    {t.quiz.back}
                  </button>
                )}
                <p
                  id={progressId}
                  className={
                    done
                      ? 'chip -rotate-2 bg-mint text-cream'
                      : 'font-bold text-sm tabular-nums'
                  }
                >
                  {done
                    ? t.quiz.verdictKicker
                    : `${t.quiz.step} ${num(step + 1)} ${t.quiz.of} ${num(QUESTIONS.length)}`}
                </p>
                <div aria-hidden="true" className="flex flex-1 gap-1.5">
                  {QUESTIONS.map((question, i) => (
                    <span
                      key={question}
                      className="h-3 flex-1 overflow-hidden rounded-full border-2 border-espresso bg-cream"
                    >
                      <m.span
                        className={`block h-full transition-colors ${i < step ? 'bg-fatla' : 'bg-brass-light'}`}
                        initial={false}
                        animate={{ scaleX: i <= step ? 1 : 0 }}
                        style={{ originX: dir === 'rtl' ? 1 : 0 }}
                      />
                    </span>
                  ))}
                </div>
              </div>
              {/* Tall enough for the longest question, so the card keeps its height between steps */}
              <div className="mt-5 min-h-86 sm:min-h-66">
                <AnimatePresence mode="wait" custom={dx}>
                  {done ? (
                    <Slide key="verdict" dx={dx}>
                      <Verdict
                        order={order}
                        answers={answers}
                        onRetry={retry}
                      />
                    </Slide>
                  ) : (
                    <Slide key={step} dx={dx}>
                      <Question
                        question={QUESTIONS[step]}
                        chosen={answers[step]}
                        progressId={progressId}
                        onChoose={choose}
                      />
                    </Slide>
                  )}
                </AnimatePresence>
              </div>
            </>
          )}
        </div>
        <div className="mt-auto flex pt-6">
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={toggle}
            className={
              open
                ? 'btn ms-auto bg-paper text-sm'
                : 'btn bg-brass-light text-lg'
            }
          >
            {open ? (
              <X aria-hidden="true" className="size-5" />
            ) : (
              <WandSparkles aria-hidden="true" className="size-5" />
            )}
            {open ? t.quiz.hide : t.quiz.start}
          </button>
        </div>
      </div>
    </div>
  );
}
