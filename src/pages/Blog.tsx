import { Helmet } from "react-helmet-async";
import { Layout } from "@/components/layout/Layout";
import { ArticleCard } from "@/components/blog/ArticleCard";
import { usePublishedArticles } from "@/hooks/useBlogArticles";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

export default function Blog() {
  const { data: articles, isLoading, error } = usePublishedArticles();

  return (
    <Layout>
      <Helmet>
        <title>Blog | J2L Textiles - Actualités et conseils vêtements professionnels</title>
        <meta
          name="description"
          content="Découvrez nos articles sur les vêtements professionnels, conseils de personnalisation, tendances textiles et actualités du secteur."
        />
        <link rel="canonical" href="https://j2ltextiles.fr/blog" />
      </Helmet>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Notre Blog</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Actualités, conseils et tendances sur les vêtements professionnels et la personnalisation textile
          </p>
        </div>

        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">Erreur lors du chargement des articles</p>
          </div>
        )}

        {articles && articles.length === 0 && (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Aucun article pour le moment</h2>
            <p className="text-muted-foreground">
              Revenez bientôt pour découvrir nos actualités !
            </p>
          </div>
        )}

        {articles && articles.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
