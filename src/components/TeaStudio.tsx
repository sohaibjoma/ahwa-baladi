'use client';

import { type ReactNode, useState } from 'react';
import AhwaReceipt from '@/components/AhwaReceipt';
import MoodOracleQuiz from '@/components/MoodOracleQuiz';
import SteepingTimer from '@/components/SteepingTimer';
import TeaCustomizer from '@/components/TeaCustomizer';
import TeaGlassSVG from '@/components/TeaGlassSVG';
import { DEFAULT_ORDER, type TeaOrder } from '@/data/tea';
import { useLanguage } from '@/i18n/LanguageProvider';

interface SectionProps {
  id: string;
  copy: { kicker: string; title: string; subtitle: string };
  children: ReactNode;
}

function Section({ id, copy, children }: SectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="py-12 sm:py-16">
      <p className="chip -rotate-2 bg-brass-light">{copy.kicker}</p>
      <h2
        id={`${id}-title`}
        className="mt-4 text-balance font-bold font-display text-3xl sm:text-5xl"
      >
        {copy.title}
      </h2>
      <p className="mt-3 max-w-2xl text-pretty text-lg">{copy.subtitle}</p>
      <div className="mt-8">{children}</div>
    </section>
  );
}

/** The client island that owns the tea order shared by the quiz, tray, timer and receipt. */
export default function TeaStudio() {
  const { t } = useLanguage();
  const [order, setOrder] = useState<TeaOrder>(DEFAULT_ORDER);

  return (
    <>
      <Section id="quiz" copy={t.quiz}>
        <MoodOracleQuiz onVerdict={setOrder} />
      </Section>
      <Section id="studio" copy={t.studio}>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="lg:sticky lg:top-24">
            <TeaGlassSVG order={order} />
          </div>
          <TeaCustomizer order={order} onChange={setOrder} />
        </div>
      </Section>
      <div className="grid gap-x-10 lg:grid-cols-2">
        <Section id="timer" copy={t.timer}>
          <SteepingTimer type={order.type} strength={order.strength} />
        </Section>
        <Section id="receipt" copy={t.receipt}>
          <AhwaReceipt order={order} />
        </Section>
      </div>
    </>
  );
}
