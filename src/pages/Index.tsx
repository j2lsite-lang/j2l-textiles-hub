import { Layout } from '@/components/layout/Layout';
import { Hero } from '@/components/home/Hero';
import { Categories } from '@/components/home/Categories';
import { Services } from '@/components/home/Services';
import { CTA } from '@/components/home/CTA';
import { FAQ } from '@/components/home/FAQ';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Categories />
      <Services />
      <CTA />
      <FAQ />
    </Layout>
  );
};

export default Index;
