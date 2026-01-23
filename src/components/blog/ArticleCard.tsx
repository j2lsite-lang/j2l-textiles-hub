import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image: string | null;
    author_name: string;
    published_at: string | null;
    tags: string[] | null;
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
      <Link to={`/blog/${article.slug}`} className="flex-1 flex flex-col">
        {article.cover_image && (
          <div className="aspect-video overflow-hidden">
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <CardHeader className="pb-2">
          <h2 className="text-xl font-semibold line-clamp-2 hover:text-primary transition-colors">
            {article.title}
          </h2>
        </CardHeader>
        <CardContent className="flex-1">
          {article.excerpt && (
            <p className="text-muted-foreground line-clamp-3">{article.excerpt}</p>
          )}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {article.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <User className="h-4 w-4" />
              {article.author_name}
            </span>
            {article.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(article.published_at), "d MMM yyyy", { locale: fr })}
              </span>
            )}
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
