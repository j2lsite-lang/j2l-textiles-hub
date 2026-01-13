import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { Categories } from '@/components/home/Categories';
import { Services } from '@/components/home/Services';
import { CTA } from '@/components/home/CTA';
import { FAQ } from '@/components/home/FAQ';
import { SEOContent } from '@/components/home/SEOContent';
import { HomeSEO } from '@/components/seo/HomeSEO';

const Index = () => {
  return (
    <Layout>
      <HomeSEO />
      <Hero />
      <Categories />
      <Services />
      <CTA />
      <FAQ />
      <SEOContent />
    </Layout>
  );
};

export default Index;
