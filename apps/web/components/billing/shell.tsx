import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, ChartNoAxesCombined } from "lucide-react";
import useSWR from "swr";
import { billingService } from "@/services/billing.service";
// oxlint-disable-next-line import/no-unassigned-import -- Load the scoped surface stylesheet.
import "./styles.css";

export function BillingShell({ children, sales = false }: { children: ReactNode; sales?: boolean }) {
  const { data } = useSWR("SERTEC_BILLING_ACCOUNT", () => billingService.account(), { shouldRetryOnError: false });
  return (
    <div className="sertec-billing">
      <aside className="billing-sidebar">
        <Link href="/assinatura/" className="sertec-wordmark">
          Sertec<span>Flow</span>
        </Link>
        <nav aria-label="Assinaturas">
          <Link href="/assinatura/" aria-current={!sales ? "page" : undefined}>
            <CreditCard size={18} />
            Minha assinatura
          </Link>
          {data?.is_admin && (
            <Link href="/vendas/" aria-current={sales ? "page" : undefined}>
              <ChartNoAxesCombined size={18} />
              Vendas e assinantes
            </Link>
          )}
        </nav>
        <Link href={data?.workspace_slug ? `/${data.workspace_slug}/` : "/"} className="billing-back">
          <ArrowLeft size={16} />
          Voltar ao trabalho
        </Link>
        <p>
          Seu trabalho.
          <br />
          No seu ritmo.
        </p>
      </aside>
      <main className="billing-main" id="billing-content">
        {children}
      </main>
    </div>
  );
}

export function BillingError({ retry }: { retry: () => void }) {
  return (
    <div className="billing-notice" role="alert">
      <h2>Não foi possível carregar os dados</h2>
      <p>Verifique sua conexão e tente novamente.</p>
      <button className="billing-button secondary" onClick={retry}>
        Tentar novamente
      </button>
    </div>
  );
}
