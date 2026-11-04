import type { ReactNode } from "react";
import Link from "next/link";
import { t } from "@lingui/core/macro";
import SertecLogo from "./SertecLogo";

export default function SertecAuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="sf-auth">
      <header className="sf-header">
        <Link href="/" aria-label="SerTec Flow">
          <SertecLogo />
        </Link>
        <Link href="/planos">{t`Planos`}</Link>
      </header>
      <main className="sf-auth-grid">
        <section className="sf-story">
          <h1>{t`Seu trabalho, em fluxo.`}</h1>
          <p>{t`Da primeira ideia à última entrega. Organize suas tarefas em quadros, listas e cartões.`}</p>
          <ol className="sf-workflow">
            <li>{t`Organize as ideias`}</li>
            <li>{t`Defina o próximo passo`}</li>
            <li>{t`Acompanhe cada entrega`}</li>
          </ol>
          <p className="sf-signature">Uma empresa SerTec Solutions</p>
        </section>
        <section className="sf-auth-form">{children}</section>
      </main>
      <footer className="sf-footer">
        <span>SerTec Flow</span>
        <Link href="/sobre">{t`Sobre e código-fonte`}</Link>
      </footer>
    </div>
  );
}
