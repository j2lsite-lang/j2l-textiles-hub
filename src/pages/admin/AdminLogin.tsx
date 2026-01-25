import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { KeyRound, Loader2, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const resetSchema = z.object({
  email: z.string().email("Email invalide"),
});

type ResetFormData = z.infer<typeof resetSchema>;

const updatePasswordSchema = z
  .object({
    password: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
    confirmPassword: z.string().min(6, "Le mot de passe doit faire au moins 6 caractères"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Les mots de passe ne correspondent pas",
  });

type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

type AuthMode = "login" | "signup" | "reset" | "updatePassword";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  });

  const updatePasswordForm = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    // Handle password recovery links: they usually come back with #type=recovery in the URL
    if (typeof window !== "undefined" && window.location.hash?.includes("type=recovery")) {
      setMode("updatePassword");
    }
  }, []);

  useEffect(() => {
    if (!adminLoading && isAdmin) {
      navigate("/admin/blog");
    }
  }, [adminLoading, isAdmin, navigate]);

  const checkAndGoAdmin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: hasRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin",
    });

    if (hasRole) {
      toast.success("Connexion réussie !");
      navigate("/admin/blog");
      return;
    }

    await supabase.auth.signOut();
    toast.error("Accès non autorisé");
  };

  const onLogin = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        toast.error("Identifiants incorrects");
        return;
      }

      await checkAndGoAdmin();
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        toast.error(error.message || "Impossible de créer le compte");
        return;
      }

      // On force la déconnexion: le compte existe, mais l'accès admin dépend du rôle.
      await supabase.auth.signOut();
      toast.success(
        "Compte créé. Dites-moi quand c'est fait et je vous active les droits admin."
      );
      setMode("login");
      loginForm.reset({ email: data.email, password: "" });
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("Erreur lors de la création du compte");
    } finally {
      setLoading(false);
    }
  };

  const onResetPassword = async (data: ResetFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/admin/login`,
      });

      if (error) {
        toast.error(error.message || "Impossible d'envoyer l'email");
        return;
      }

      toast.success("Email envoyé. Ouvrez le lien pour définir un nouveau mot de passe.");
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error("Erreur lors de l'envoi de l'email");
    } finally {
      setLoading(false);
    }
  };

  const onUpdatePassword = async (data: UpdatePasswordFormData) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        toast.error(error.message || "Impossible de mettre à jour le mot de passe");
        return;
      }

      // Nettoie le hash recovery
      if (typeof window !== "undefined") {
        window.history.replaceState(null, "", window.location.pathname);
      }

      await supabase.auth.signOut();
      toast.success("Mot de passe mis à jour. Vous pouvez vous reconnecter.");
      setMode("login");
    } catch (err) {
      console.error("Update password error:", err);
      toast.error("Erreur lors de la mise à jour du mot de passe");
    } finally {
      setLoading(false);
    }
  };

  if (adminLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>Accès Admin | J2L Textiles</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Administration</CardTitle>
            <CardDescription>
              {mode === "login" && "Connectez-vous pour gérer le blog"}
              {mode === "signup" && "Créez votre compte (droits admin à activer ensuite)"}
              {mode === "reset" && "Recevez un lien pour réinitialiser votre mot de passe"}
              {mode === "updatePassword" && "Définissez un nouveau mot de passe"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {mode === "login" && (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" autoComplete="current-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <LogIn className="mr-2 h-4 w-4" />
                    )}
                    Se connecter
                  </Button>

                  <div className="flex flex-col items-center gap-1">
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => {
                        setMode("reset");
                        resetForm.reset({ email: loginForm.getValues("email") || "" });
                      }}
                    >
                      Mot de passe oublié ?
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => {
                        setMode("signup");
                        signupForm.reset({ email: loginForm.getValues("email") || "", password: "" });
                      }}
                    >
                      Créer un compte
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {mode === "signup" && (
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <UserPlus className="mr-2 h-4 w-4" />
                    )}
                    Créer le compte
                  </Button>

                  <div className="flex flex-col items-center gap-1">
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => setMode("login")}
                    >
                      Retour à la connexion
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {mode === "reset" && (
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onResetPassword)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" autoComplete="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="mr-2 h-4 w-4" />
                    )}
                    Envoyer le lien
                  </Button>

                  <div className="flex flex-col items-center gap-1">
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => setMode("login")}
                    >
                      Retour à la connexion
                    </Button>
                  </div>
                </form>
              </Form>
            )}

            {mode === "updatePassword" && (
              <Form {...updatePasswordForm}>
                <form onSubmit={updatePasswordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
                  <FormField
                    control={updatePasswordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nouveau mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={updatePasswordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <Input type="password" autoComplete="new-password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="mr-2 h-4 w-4" />
                    )}
                    Mettre à jour le mot de passe
                  </Button>

                  <div className="flex flex-col items-center gap-1">
                    <Button
                      type="button"
                      variant="link"
                      className="h-auto p-0"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        if (typeof window !== "undefined") {
                          window.history.replaceState(null, "", window.location.pathname);
                        }
                        setMode("login");
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
