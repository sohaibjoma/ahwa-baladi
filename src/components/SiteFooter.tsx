'use client';

import Khayamiya from '@/components/Khayamiya';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="mt-12">
      <Khayamiya />
      <div className="bg-espresso px-4 py-10 text-center text-cream">
        <p className="font-bold font-display text-2xl">{t.nav.brand}</p>
        <p className="mt-2">{t.footer.made}</p>
        <p className="mt-1 text-sm">{t.footer.sounds}</p>
      </div>
    </footer>
  );
}
