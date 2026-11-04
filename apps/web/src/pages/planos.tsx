import Link from "next/link";
import { t } from "@lingui/core/macro";
import { PageHead } from "~/components/PageHead";
import SertecLogo from "~/components/SertecLogo";

export default function Plans() {
  return (
    <div className="sf-public">
      <PageHead title="Planos | SerTec Flow" />
      <header className="sf-header">
        <Link href="/">
          <SertecLogo />
        </Link>
        <Link href="/login">{t`Entrar`}</Link>
      </header>
      <main className="sf-plans">
        <h1>{t`Seu próximo projeto começa aqui.`}</h1>
        <p>{t`Plano Individual SerTec Flow. Escolha o período que combina com você.`}</p>
        <div className="sf-plan-grid">
          <section>
            <h2>{t`Mensal`}</h2>
            <p className="sf-price">
              R$ 39,90 <small>{t`por mês`}</small>
            </p>
            <p>{t`Pagamento a cada mês.`}</p>
          </section>
          <section>
            <h2>{t`Anual`}</h2>
            <p className="sf-price">
              R$ 399,90 <small>{t`por ano`}</small>
            </p>
            <p>{t`Economize R$ 78,90 em relação a 12 mensalidades.`}</p>
          </section>
        </div>
        <p className="sf-notice">{t`As contratações ainda não estão disponíveis nesta nova versão. A integração de pagamentos está em preparação.`}</p>
        <Link
          href="/login"
          className="sf-button"
        >{t`Entrar na minha conta`}</Link>
      </main>
      <footer className="sf-footer">
        <span>Uma empresa SerTec Solutions</span>
        <Link href="/sobre">{t`Sobre e código-fonte`}</Link>
      </footer>
    </div>
  );
}
