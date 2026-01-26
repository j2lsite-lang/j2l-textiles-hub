import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useArticleBySlug } from "@/hooks/useBlogArticles";
import { ShareButtons } from "@/components/share/ShareButtons";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = useArticleBySlug(slug || "");

  const articleUrl = `https://j2ltextiles.fr/blog/${slug}`;
  
  // Build absolute image URL for OG/Twitter (1200x630 recommended)
  const getAbsoluteImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return "https://j2ltextiles.fr/og-image.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `https://j2ltextiles.fr${imagePath.startsWith("/") ? "" : "/"}${imagePath}`;
  };

  const ogImageUrl = article ? getAbsoluteImageUrl(article.cover_image) : "https://j2ltextiles.fr/og-image.jpg";
  const metaTitle = article?.meta_title || article?.title || "Article | J2L Textiles";
  const metaDescription = article?.meta_description || article?.excerpt || "Découvrez nos articles sur la personnalisation textile.";

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="aspect-video w-full mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <p className="text-muted-foreground mb-8">
            L'article que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au blog
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{metaTitle} | J2L Textiles</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={articleUrl} />
        
        {/* Open Graph */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={articleUrl} />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={article.title} />
        <meta property="og:site_name" content="J2L Textiles" />
        <meta property="og:locale" content="fr_FR" />
        {article.published_at && (
          <meta property="article:published_time" content={article.published_at} />
        )}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        <meta name="twitter:image:alt" content={article.title} />
      </Helmet>

      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <Button variant="ghost" asChild className="mb-8">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au blog
          </Link>
        </Button>

        {article.cover_image && (
          <div className="aspect-video overflow-hidden rounded-lg mb-8">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {article.author_name}
            </span>
            {article.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(article.published_at), "d MMMM yyyy", { locale: fr })}
              </span>
            )}
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="border-t pt-4">
            <ShareButtons
              title={article.title}
              url={articleUrl}
              description={article.excerpt || undefined}
              image={ogImageUrl}
            />
          </div>
        </header>

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        <footer className="mt-12 pt-8 border-t">
          <ShareButtons
            title={article.title}
            url={articleUrl}
            description={article.excerpt || undefined}
            image={ogImageUrl}
          />
        </footer>
      </article>
    </Layout>
  );
}
