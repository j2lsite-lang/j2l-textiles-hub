import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author_id: string | null;
  author_name: string;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  meta_title: string | null;
  meta_description: string | null;
  tags: string[] | null;
}

export interface ArticleInput {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image?: string;
  author_name?: string;
  published?: boolean;
  meta_title?: string;
  meta_description?: string;
  tags?: string[];
}

// Fetch all published articles (public)
export function usePublishedArticles() {
  return useQuery({
    queryKey: ["blog-articles", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data as BlogArticle[];
    },
  });
}

// Fetch single article by slug (public)
export function useArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ["blog-article", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) throw error;
      return data as BlogArticle;
    },
    enabled: !!slug,
  });
}

// Admin: Fetch all articles (including unpublished)
export function useAllArticles() {
  return useQuery({
    queryKey: ["blog-articles", "all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_articles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as BlogArticle[];
    },
  });
}

// Admin: Create article
export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (article: ArticleInput) => {
      const { data: userData } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("blog_articles")
        .insert({
          ...article,
          author_id: userData.user?.id,
          published_at: article.published ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-articles"] });
      toast.success("Article créé avec succès !");
    },
    onError: (error) => {
      console.error("Error creating article:", error);
      toast.error("Erreur lors de la création de l'article");
    },
  });
}

// Admin: Update article
export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...article }: ArticleInput & { id: string }) => {
      const updateData: Record<string, unknown> = { ...article };
      
      // Set published_at when publishing for the first time
      if (article.published) {
        const { data: existing } = await supabase
          .from("blog_articles")
          .select("published_at")
          .eq("id", id)
          .single();
        
        if (!existing?.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      }

      const { data, error } = await supabase
        .from("blog_articles")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-articles"] });
      queryClient.invalidateQueries({ queryKey: ["blog-article"] });
      toast.success("Article mis à jour !");
    },
    onError: (error) => {
      console.error("Error updating article:", error);
      toast.error("Erreur lors de la mise à jour");
    },
  });
}

// Admin: Delete article
export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("blog_articles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blog-articles"] });
      toast.success("Article supprimé !");
    },
    onError: (error) => {
      console.error("Error deleting article:", error);
      toast.error("Erreur lors de la suppression");
    },
  });
}
