import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout/Layout";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { useCreateArticle, useUpdateArticle, BlogArticle } from "@/hooks/useBlogArticles";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ArrowLeft, Loader2, Save } from "lucide-react";

const articleSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(200),
  slug: z.string().min(1, "Le slug est requis").max(200)
    .regex(/^[a-z0-9-]+$/, "Le slug ne doit contenir que des lettres minuscules, chiffres et tirets"),
  excerpt: z.string().max(500).optional(),
  content: z.string().min(1, "Le contenu est requis"),
  cover_image: z.string().url("URL invalide").optional().or(z.literal("")),
  author_name: z.string().min(1, "L'auteur est requis").max(100),
  published: z.boolean(),
  meta_title: z.string().max(70).optional(),
  meta_description: z.string().max(160).optional(),
  tags: z.string().optional(),
});

type ArticleFormData = z.infer<typeof articleSchema>;

export default function AdminBlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const [loading, setLoading] = useState(!!id);
  const [authChecked, setAuthChecked] = useState(false);

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      cover_image: "",
      author_name: "Admin",
      published: false,
      meta_title: "",
      meta_description: "",
      tags: "",
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/admin/login");
        return;
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (authChecked && !adminLoading && !isAdmin) {
      navigate("/");
    }
  }, [authChecked, adminLoading, isAdmin, navigate]);

  useEffect(() => {
    if (id && authChecked && isAdmin) {
      const fetchArticle = async () => {
        const { data, error } = await supabase
          .from("blog_articles")
          .select("*")
          .eq("id", id)
          .single();

        if (error || !data) {
          navigate("/admin/blog");
          return;
        }

        const article = data as BlogArticle;
        form.reset({
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || "",
          content: article.content,
          cover_image: article.cover_image || "",
          author_name: article.author_name,
          published: article.published,
          meta_title: article.meta_title || "",
          meta_description: article.meta_description || "",
          tags: article.tags?.join(", ") || "",
        });
        setLoading(false);
      };
      fetchArticle();
    } else if (!id) {
      setLoading(false);
    }
  }, [id, authChecked, isAdmin, form, navigate]);

  // Auto-generate slug from title
  const handleTitleChange = (title: string) => {
    if (!id) {
      const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      form.setValue("slug", slug);
    }
  };

  const onSubmit = async (data: ArticleFormData) => {
    const tags = data.tags
      ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [];

    const articleData = {
      title: data.title,
      slug: data.slug,
      excerpt: data.excerpt || undefined,
      content: data.content,
      cover_image: data.cover_image || undefined,
      author_name: data.author_name,
      published: data.published,
      meta_title: data.meta_title || undefined,
      meta_description: data.meta_description || undefined,
      tags,
    };

    if (id) {
      await updateArticle.mutateAsync({ id, ...articleData });
    } else {
      await createArticle.mutateAsync(articleData);
    }
    navigate("/admin/blog");
  };

  if (!authChecked || adminLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <Layout>
      <Helmet>
        <title>{id ? "Modifier" : "Nouvel"} Article | Admin J2L Textiles</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate("/admin/blog")} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{id ? "Modifier l'article" : "Nouvel article"}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleTitleChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug URL *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        URL: /blog/{field.value || "mon-article"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Extrait</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Résumé court de l'article..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contenu * (HTML supporté)</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={15} placeholder="<p>Votre contenu...</p>" />
                      </FormControl>
                      <FormDescription>
                        Vous pouvez utiliser du HTML: &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;img&gt;, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cover_image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image de couverture (URL)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="author_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Auteur *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="vêtements, personnalisation, tendances" />
                      </FormControl>
                      <FormDescription>Séparez les tags par des virgules</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-6">
                  <h3 className="font-semibold mb-4">SEO</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="meta_title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Title</FormLabel>
                          <FormControl>
                            <Input {...field} maxLength={70} />
                          </FormControl>
                          <FormDescription>{field.value?.length || 0}/70 caractères</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meta_description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Meta Description</FormLabel>
                          <FormControl>
                            <Textarea {...field} rows={2} maxLength={160} />
                          </FormControl>
                          <FormDescription>{field.value?.length || 0}/160 caractères</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="published"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4 border rounded-lg p-4">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div>
                        <FormLabel className="text-base">Publier l'article</FormLabel>
                        <FormDescription>
                          {field.value
                            ? "L'article sera visible publiquement"
                            : "L'article restera en brouillon"}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createArticle.isPending || updateArticle.isPending}
                  >
                    {(createArticle.isPending || updateArticle.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    <Save className="mr-2 h-4 w-4" />
                    {id ? "Enregistrer" : "Créer l'article"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate("/admin/blog")}>
                    Annuler
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
