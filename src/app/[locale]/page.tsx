import Hero from '@/components/Hero';
import Khayamiya from '@/components/Khayamiya';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import StreetPoll from '@/components/StreetPoll';
import TeaStudio from '@/components/TeaStudio';

export default function Home() {
  return (
    <>
      <Khayamiya />
      <SiteHeader />
      <StreetPoll />
      <main id="main" className="mx-auto max-w-6xl px-4 sm:px-6">
        <Hero />
        <TeaStudio />
      </main>
      <SiteFooter />
    </>
  );
}
