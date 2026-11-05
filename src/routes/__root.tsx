import { ConsentBanner } from '@/components/pizzeria/consent-banner';
import { getLicenseStatus } from '@/lib/license.functions';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  redirect,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import { CartProvider } from "@/components/pizzeria/cart-context";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Eita...</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tropeçamos nos cabos de internet e não conseguimos encontrar a página que você estava procuando.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Clica aqui e vamos recomeçar.
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Eita...
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Algo deu errado por nossa conta. Você pode tentar recarregar a página ou voltar para a página inicial.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Quer tentar de novo?
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Larga isso e vamos recomeçar.
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ location }) => {
    if (['/auth','/reset-password','/assinatura','/manutencao','/termos','/privacidade'].includes(location.pathname) || location.pathname.startsWith('/api/')) return;
    const status = await getLicenseStatus();
    if (status.blocked) throw redirect({ to: location.pathname === '/gestao' || location.pathname === '/cozinha' ? '/assinatura' : '/manutencao' });
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FH Foods" },
      { name: "description", content: "Pizza artesanal, feita para compartilhar." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "FH Foods" },
      { property: "og:description", content: "Pizza artesanal, feita para compartilhar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      
    ],
    links: [
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Serif+Display:ital@0;1&display=swap" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  useEffect(() => { const { data: { subscription } } = supabase.auth.onAuthStateChange(event => { if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return; router.invalidate(); if (event !== "SIGNED_OUT") queryClient.invalidateQueries(); }); return () => subscription.unsubscribe(); }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider><LicenseWatcher/><Outlet /><ConsentBanner /><Toaster /></CartProvider>
    </QueryClientProvider>
  );
}

function LicenseWatcher() {
  const fetchStatus = useServerFn(getLicenseStatus), router = useRouter();
  const { data } = useQuery({ queryKey: ['license-status'], queryFn: () => fetchStatus(), refetchInterval: 30000, retry: false });
  useEffect(() => {
    const path = router.state.location.pathname;
    if (!data?.blocked || ['/auth','/reset-password','/assinatura','/manutencao','/termos','/privacidade'].includes(path)) return;
    router.navigate({ to: path === '/gestao' || path === '/cozinha' ? '/assinatura' : '/manutencao', replace: true });
  }, [data, router]);
  return null;
}
