import { Layout } from "@/components/layout/Layout";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { frenchDepartments, getDepartmentBySlug, getCityBySlug } from "@/lib/french-locations";
import { COMPANY_INFO } from "@/lib/company-info";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

const services = [
  "Broderie personnalisée",
  "Sérigraphie",
  "Flocage textile",
  "Impression DTG",
  "Marquage de vêtements de travail",
  "Personnalisation de textiles publicitaires",
];

const sectors = [
  "Entreprises et PME",
  "Associations sportives",
  "Collectivités locales",
  "Restauration et hôtellerie",
  "BTP et artisanat",
  "Événementiel",
  "Clubs et écoles",
  "Commerces",
];

export default function LocationPage() {
  const { department, city } = useParams<{ department: string; city?: string }>();

  // If we have a city parameter
  if (city && department) {
    const locationData = getCityBySlug(department, city);
    if (!locationData) {
      return <NotFoundLocation />;
    }
    return <CityPage city={locationData.city.name} department={locationData.department.name} departmentCode={locationData.department.code} />;
  }

  // If we only have a department
  if (department) {
    const dept = getDepartmentBySlug(department);
    if (!dept) {
      return <NotFoundLocation />;
    }
    return <DepartmentPage department={dept} />;
  }

  // List all departments
  return <AllDepartmentsPage />;
}

function NotFoundLocation() {
  return (
    <Layout>
      <Helmet>
        <title>Zone non trouvée | {COMPANY_INFO.name}</title>
      </Helmet>
      <div className="container py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Zone non trouvée</h1>
        <p className="text-muted-foreground mb-8">Cette localisation n'existe pas dans notre base de données.</p>
        <Link to="/zones">
          <Button>Voir toutes nos zones d'intervention</Button>
        </Link>
      </div>
    </Layout>
  );
}

function AllDepartmentsPage() {
  const regions = [...new Set(frenchDepartments.map(d => d.region))].sort();

  return (
    <Layout>
      <Helmet>
        <title>Textiles personnalisés dans toute la France | {COMPANY_INFO.name}</title>
        <meta 
          name="description" 
          content="J2LTextiles livre des textiles personnalisés (broderie, sérigraphie, flocage) dans tous les départements français. Demandez votre devis gratuit." 
        />
      </Helmet>

      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            Textiles personnalisés<br />dans toute la France
          </h1>
          <p className="text-xl text-muted-foreground text-center max-w-3xl mx-auto">
            {COMPANY_INFO.name} intervient dans tous les départements français pour vos projets de personnalisation textile : broderie, sérigraphie, flocage et impression.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid gap-8">
          {regions.map((region) => (
            <div key={region}>
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{region}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {frenchDepartments
                  .filter(d => d.region === region)
                  .map((dept) => (
                    <Link
                      key={dept.code}
                      to={`/zones/${dept.slug}`}
                      className="flex items-center gap-2 p-3 rounded-lg border hover:bg-primary/5 hover:border-primary/30 transition-colors"
                    >
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-sm">
                        <span className="font-medium">{dept.name}</span>
                        <span className="text-muted-foreground ml-1">({dept.code})</span>
                      </span>
                    </Link>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <CTASection />
    </Layout>
  );
}

function DepartmentPage({ department }: { department: { code: string; name: string; region: string; slug: string; cities: { name: string; slug: string }[] } }) {
  return (
    <Layout>
      <Helmet>
        <title>Textiles personnalisés en {department.name} ({department.code}) | {COMPANY_INFO.name}</title>
        <meta 
          name="description" 
          content={`Broderie, sérigraphie et flocage textile en ${department.name}. ${COMPANY_INFO.name} personnalise vos vêtements professionnels, sportifs et publicitaires. Devis gratuit.`} 
        />
        <meta name="keywords" content={`textile personnalisé ${department.name}, broderie ${department.name}, sérigraphie ${department.name}, flocage ${department.name}, vêtements personnalisés ${department.code}`} />
      </Helmet>

      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/zones" className="hover:text-primary">France</Link>
            <span>/</span>
            <span>{department.region}</span>
            <span>/</span>
            <span className="text-foreground font-medium">{department.name}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Textiles personnalisés<br />en {department.name} ({department.code})
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            {COMPANY_INFO.name} propose ses services de personnalisation textile (broderie, sérigraphie, flocage) 
            aux entreprises, associations et collectivités du département {department.name} ({department.code}).
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Nos services en {department.name}</h2>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span>{service}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-6">Pour tous les secteurs</h2>
            <ul className="space-y-3">
              {sectors.map((sector) => (
                <li key={sector} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-secondary shrink-0" />
                  <span>{sector}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-12">
        <div className="container">
          <h2 className="text-2xl font-semibold mb-6">Villes desservies en {department.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {department.cities.map((city) => (
              <Link
                key={city.slug}
                to={`/zones/${department.slug}/${city.slug}`}
                className="flex items-center gap-2 p-3 rounded-lg bg-background border hover:bg-primary/5 hover:border-primary/30 transition-colors"
              >
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span className="font-medium">{city.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <ContactInfoSection departmentName={department.name} />
      <CTASection location={department.name} />
    </Layout>
  );
}

function CityPage({ city, department, departmentCode }: { city: string; department: string; departmentCode: string }) {
  const deptData = frenchDepartments.find(d => d.name === department);

  return (
    <Layout>
      <Helmet>
        <title>Textiles personnalisés à {city} ({departmentCode}) | {COMPANY_INFO.name}</title>
        <meta 
          name="description" 
          content={`Broderie, sérigraphie et flocage à ${city} (${department}). ${COMPANY_INFO.name} personnalise vos vêtements de travail, sportifs et publicitaires. Livraison rapide, devis gratuit.`} 
        />
        <meta name="keywords" content={`textile personnalisé ${city}, broderie ${city}, sérigraphie ${city}, flocage ${city}, vêtements personnalisés ${city}, impression textile ${city}`} />
        <link rel="canonical" href={`https://j2ltextiles.fr/zones/${deptData?.slug}/${city.toLowerCase().replace(/\s+/g, '-')}`} />
      </Helmet>

      <section className="bg-gradient-to-br from-primary/10 to-secondary/10 py-16">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 flex-wrap">
            <Link to="/zones" className="hover:text-primary">France</Link>
            <span>/</span>
            <Link to={`/zones/${deptData?.slug}`} className="hover:text-primary">{department}</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{city}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Textiles personnalisés<br />à {city}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl">
            Vous recherchez un spécialiste de la personnalisation textile à {city} et ses environs ? 
            {COMPANY_INFO.name} propose broderie, sérigraphie et flocage pour tous vos projets professionnels.
          </p>
        </div>
      </section>

      <section className="container py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-semibold mb-6">Nos prestations à {city}</h2>
            <div className="space-y-4">
              <p>
                Basés à {COMPANY_INFO.city}, nous intervenons régulièrement à {city} et dans tout le département {department} 
                pour répondre aux besoins des professionnels en matière de personnalisation textile.
              </p>
              <ul className="space-y-3">
                {services.map((service) => (
                  <li key={service} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span>{service}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-6">Pourquoi choisir {COMPANY_INFO.name} ?</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <strong>Devis gratuit sous 24h</strong>
                  <p className="text-muted-foreground text-sm">Réponse rapide à toutes vos demandes</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <strong>Livraison à {city}</strong>
                  <p className="text-muted-foreground text-sm">Expédition rapide dans toute la France</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <strong>Large catalogue</strong>
                  <p className="text-muted-foreground text-sm">T-shirts, polos, sweats, vêtements de travail...</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                <div>
                  <strong>Accompagnement personnalisé</strong>
                  <p className="text-muted-foreground text-sm">Conseils sur les techniques de marquage</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-muted/50 py-12">
        <div className="container">
          <h2 className="text-2xl font-semibold mb-6">Clients à {city} : ils nous font confiance</h2>
          <p className="text-muted-foreground mb-8">
            De nombreuses entreprises, associations et collectivités de {city} et de {department} 
            font appel à nos services pour leurs besoins en textiles personnalisés.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-background rounded-lg p-6 border">
              <h3 className="font-semibold mb-2">Entreprises</h3>
              <p className="text-sm text-muted-foreground">
                Vêtements de travail avec logo brodé, polos corporate, équipements EPI personnalisés.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border">
              <h3 className="font-semibold mb-2">Associations & Clubs</h3>
              <p className="text-sm text-muted-foreground">
                Maillots sportifs, t-shirts événementiels, sweats pour membres.
              </p>
            </div>
            <div className="bg-background rounded-lg p-6 border">
              <h3 className="font-semibold mb-2">Collectivités</h3>
              <p className="text-sm text-muted-foreground">
                Uniformes agents, vêtements haute visibilité, textiles pour événements municipaux.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ContactInfoSection departmentName={department} cityName={city} />
      <CTASection location={city} />
    </Layout>
  );
}

function ContactInfoSection({ departmentName, cityName }: { departmentName: string; cityName?: string }) {
  return (
    <section className="container py-12">
      <div className="bg-primary/5 rounded-2xl p-8">
        <h2 className="text-2xl font-semibold mb-6">
          Contactez {COMPANY_INFO.name} {cityName ? `pour ${cityName}` : `pour le ${departmentName}`}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">Téléphone</div>
              <a href={`tel:${COMPANY_INFO.phoneLink}`} className="text-primary hover:underline">
                {COMPANY_INFO.phone}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">Email</div>
              <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary hover:underline">
                {COMPANY_INFO.email}
              </a>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">Siège social</div>
              <div className="text-muted-foreground text-sm">{COMPANY_INFO.fullAddress}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTASection({ location }: { location?: string }) {
  return (
    <section className="bg-primary text-primary-foreground py-16">
      <div className="container text-center">
        <h2 className="text-3xl font-bold mb-4">
          Besoin de textiles personnalisés{location ? ` à ${location}` : ''} ?
        </h2>
        <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
          Demandez votre devis gratuit en quelques clics. Réponse sous 24h !
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/devis">
            <Button size="lg" variant="secondary" className="gap-2">
              Demander un devis gratuit
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link to="/catalogue">
            <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10">
              Voir le catalogue
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
