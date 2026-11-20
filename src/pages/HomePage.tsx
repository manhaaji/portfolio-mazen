import { Fragment, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Hero } from '../sections/Hero';
import { About } from '../sections/About';
import { Portfolio } from '../sections/Portfolio';
import { Services } from '../sections/Services';
import { Testimonials } from '../sections/Testimonials';
import { Contact } from '../sections/Contact';
import { CustomSectionView } from '../sections/Custom';
import { Footer } from '../components/Footer';
import { SITE } from '../data/site';
import { content, isCustom } from '../data/content';

const BUILT_IN: Record<string, () => ReactNode> = {
  hero: () => <Hero />,
  about: () => <About />,
  portfolio: () => <Portfolio />,
  services: () => <Services />,
  testimonials: () => (SITE.showTestimonials ? <Testimonials /> : null),
  contact: () => <Contact />,
};

/** The home page is the list of sections from the CMS, in its order. */
export function HomePage() {
  const visible = content.sections.filter(s => s.visible);
  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      {visible.map((s, i) => (
        <Fragment key={s.id}>{isCustom(s) ? <CustomSectionView section={s} index={i} /> : BUILT_IN[s.type]?.()}</Fragment>
      ))}
      <Footer />
    </motion.main>
  );
}
