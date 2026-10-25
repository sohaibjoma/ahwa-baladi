'use client';

import { m } from 'framer-motion';
import {
  Check,
  Leaf,
  type LucideIcon,
  Megaphone,
  Pause,
  Play,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Dictionary } from '@/i18n/dictionary';
import { useLanguage } from '@/i18n/LanguageProvider';
import { playPlop } from '@/utils/sound';

type Party = 'koshary' | 'fatla';

const PARTIES: readonly Party[] = ['koshary', 'fatla'];

const PARTY: Record<
  Party,
  {
    fill: string;
    Icon: LucideIcon;
    label: 'voteKoshary' | 'voteFatla';
    /** Points the speech bubble at the party's vote button. */
    tail: string;
  }
> = {
  koshary: {
    fill: 'bg-koshary text-cream',
    Icon: Leaf,
    label: 'voteKoshary',
    tail: 'start-[calc(25%-0.5rem)]'
  },
  // Paper rather than cream keeps small text on fatla above 4.5:1.
  fatla: {
    fill: 'bg-fatla text-paper',
    Icon: Zap,
    label: 'voteFatla',
    tail: 'end-[calc(25%-0.5rem)]'
  }
};

/** A Ma'allem's word weighs as much as 25 voices from the street. */
const MAALLEM_VOTES = 25;

/** Outline and hard shadow that stay visible on the espresso band. */
const ON_DARK = 'border-cream shadow-brutal shadow-brass-light';

interface Pop {
  party: Party;
  amount: number;
  /** Re-keys the "+n" pop so every new ballot replays it. */
  id: number;
}

interface Street {
  votes: Record<Party, number>;
  pop: Pop | null;
}

const OPENING_STREET: Street = {
  votes: { koshary: 680, fatla: 320 },
  pop: null
};

function nextPop(street: Street, party: Party, amount: number): Pop {
  return { party, amount, id: (street.pop?.id ?? 0) + 1 };
}

/** One street ballot; the odds pull Koshary back whenever it leaves its usual 60-75% lead. */
function streetBallot(street: Street, roll: number, amount: number): Street {
  const { koshary, fatla } = street.votes;
  const share = koshary / (koshary + fatla);
  const kosharyOdds = share < 0.6 ? 0.9 : share > 0.75 ? 0.4 : 0.68;
  const party: Party = roll < kosharyOdds ? 'koshary' : 'fatla';
  return {
    votes: { ...street.votes, [party]: street.votes[party] + amount },
    pop: nextPop(street, party, amount)
  };
}

function Score({
  name,
  value,
  className
}: {
  name: string;
  value: string;
  className: string;
}) {
  return (
    <p
      className={`min-w-0 flex-1 rounded-2xl border-3 px-3 py-1.5 sm:py-2 ${ON_DARK} ${className}`}
    >
      <span className="block font-bold text-sm">{name}</span>
      <span className="block font-black font-display text-3xl tabular-nums leading-tight sm:text-5xl">
        {value}
      </span>
    </p>
  );
}

/** Both parties' trash talk, interleaved and led by the shouting party's sticker. */
function TalkList({
  poll,
  hidden = false
}: {
  poll: Dictionary['poll'];
  hidden?: boolean;
}) {
  const lines = poll.talk.koshary.flatMap((line, i) => [
    { party: 'koshary' as const, line },
    { party: 'fatla' as const, line: poll.talk.fatla[i] }
  ]);

  return (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0">
      {lines.map(({ party, line }) => (
        <li
          key={line}
          className="flex items-center gap-2.5 whitespace-nowrap px-5 py-1.5 sm:py-2"
        >
          <span className={`chip ${PARTY[party].fill}`}>{poll[party]}</span>
          <span className="font-bold">{line}</span>
        </li>
      ))}
    </ul>
  );
}

export default function StreetPoll() {
  const { t, num, percent } = useLanguage();
  const [street, setStreet] = useState(OPENING_STREET);
  const [vote, setVote] = useState<Party | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const roll = Math.random();
      const amount = 1 + Math.floor(Math.random() * 3);
      setStreet((current) => streetBallot(current, roll, amount));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const tally = (party: Party) =>
    street.votes[party] + (vote === party ? MAALLEM_VOTES : 0);
  const kosharyShare = tally('koshary') / (tally('koshary') + tally('fatla'));
  const kosharyPercent = Math.round(kosharyShare * 100);

  function castVote(party: Party) {
    if (party === vote) return;
    setVote(party);
    setStreet((current) => ({
      ...current,
      pop: nextPop(current, party, MAALLEM_VOTES)
    }));
    playPlop();
  }

  return (
    <section
      aria-labelledby="poll-title"
      className="overflow-hidden border-espresso border-b-3 bg-espresso text-cream"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-x-12 gap-y-5 px-4 py-5 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <h2
              id="poll-title"
              className="flex items-center gap-2 font-bold font-display text-xl sm:text-3xl"
            >
              <Megaphone
                aria-hidden="true"
                className="size-6 shrink-0 -rotate-12 text-brass-light sm:size-7 rtl:-scale-x-100 rtl:rotate-12"
              />
              {t.poll.title}
            </h2>
            <p className="chip bg-cream text-espresso">
              <span aria-hidden="true" className="relative flex size-2.5">
                <span className="absolute inset-0 rounded-full bg-fatla motion-safe:animate-ping" />
                <span className="relative size-2.5 rounded-full bg-fatla" />
              </span>
              {t.poll.live}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2 sm:mt-5 sm:gap-4">
            <Score
              name={t.poll.koshary}
              value={percent(kosharyPercent)}
              className="-rotate-2 bg-koshary text-cream"
            />
            <span className="grid size-12 shrink-0 -rotate-12 place-items-center rounded-full border-3 border-cream bg-brass-light font-black font-display text-espresso text-lg">
              VS
            </span>
            <Score
              name={t.poll.fatla}
              value={percent(100 - kosharyPercent)}
              className="rotate-2 bg-fatla text-end text-paper"
            />
          </div>

          <div
            aria-hidden="true"
            className={`relative mt-5 h-5 overflow-hidden rounded-full border-3 bg-fatla sm:mt-6 sm:h-6 ${ON_DARK}`}
          >
            <m.div
              className="absolute inset-0 bg-koshary ltr:origin-left rtl:origin-right"
              initial={{ scaleX: 0.5 }}
              animate={{ scaleX: kosharyShare }}
              transition={{ type: 'spring', stiffness: 60, damping: 12 }}
            />
            <span className="absolute inset-0 mx-auto w-0.75 bg-cream" />
          </div>

          <div className="mt-2 flex justify-between font-bold text-sm tabular-nums">
            {PARTIES.map((party) => (
              <p key={party} className="relative">
                {num(tally(party))} {t.poll.votes}
                {street.pop?.party === party && (
                  <m.span
                    key={street.pop.id}
                    aria-hidden="true"
                    className={`absolute top-0 font-black text-brass-light ${
                      party === 'koshary'
                        ? 'inset-s-full ms-2'
                        : 'inset-e-full me-2'
                    }`}
                    initial={{ opacity: 1, y: 0 }}
                    animate={{ opacity: 0, y: -14 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  >
                    +{num(street.pop.amount)}
                  </m.span>
                )}
              </p>
            ))}
          </div>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-3">
            {PARTIES.map((party) => {
              const chosen = vote === party;
              const { fill, Icon, label } = PARTY[party];
              const Mark = chosen ? Check : Icon;
              return (
                <button
                  key={party}
                  type="button"
                  aria-pressed={chosen}
                  onClick={() => castVote(party)}
                  className={`btn text-balance px-3 text-sm hover:shadow-brutal-sm active:shadow-none sm:text-base ${ON_DARK} ${
                    chosen ? fill : 'bg-cream text-espresso'
                  }`}
                >
                  <Mark aria-hidden="true" className="size-5 shrink-0" />
                  {t.poll[label]}
                </button>
              );
            })}
          </div>

          <div className="relative mt-4 sm:mt-5">
            <div
              className={`grid rounded-2xl border-3 bg-paper px-4 py-2.5 font-bold text-espresso text-sm sm:py-3 sm:text-base ${ON_DARK}`}
            >
              {/* Every message sits in the same cell, so the bubble keeps the tallest height. */}
              {[t.poll.hint, t.poll.welcome.koshary, t.poll.welcome.fatla].map(
                (text) => (
                  <span key={text} className="invisible [grid-area:1/1]">
                    {text}
                  </span>
                )
              )}
              <p aria-live="polite" className="[grid-area:1/1]">
                <m.span
                  key={vote ?? 'hint'}
                  className="block"
                  initial={vote ? { opacity: 0, scale: 0.85 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 20 }}
                >
                  {vote ? t.poll.welcome[vote] : t.poll.hint}
                </m.span>
              </p>
            </div>
            <span
              aria-hidden="true"
              className={`absolute -top-2 size-4 rotate-45 border-cream border-t-3 border-l-3 bg-paper ${
                vote ? PARTY[vote].tail : 'inset-x-0 mx-auto'
              }`}
            />
          </div>
        </div>
      </div>

      <div className="group flex border-espresso border-t-3 bg-brass-light text-espresso">
        <button
          type="button"
          onClick={() => setPaused(!paused)}
          aria-label={paused ? t.poll.play : t.poll.pause}
          className="grid w-12 shrink-0 cursor-pointer place-items-center border-espresso border-e-3 bg-cream transition-colors hover:bg-paper motion-reduce:hidden"
        >
          {paused ? (
            <Play aria-hidden="true" className="size-5" />
          ) : (
            <Pause aria-hidden="true" className="size-5" />
          )}
        </button>
        <div className="min-w-0 flex-1 overflow-hidden motion-reduce:overflow-x-auto">
          <div
            className={`marquee [animation-duration:80s] group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] ${
              paused ? '[animation-play-state:paused]' : ''
            }`}
          >
            <TalkList poll={t.poll} />
            <TalkList poll={t.poll} hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
