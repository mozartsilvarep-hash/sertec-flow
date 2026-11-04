import Link from "next/link";
import { t } from "@lingui/core/macro";
import { PageHead } from "~/components/PageHead";
import SertecLogo from "~/components/SertecLogo";

export default function Home() {
  return (
    <div className="sf-public">
      <PageHead title="SerTec Flow | Seu trabalho, em fluxo." />
      <header className="sf-header">
        <Link href="/">
          <SertecLogo />
        </Link>
        <nav>
          <Link href="/planos">{t`Planos`}</Link>
          <Link href="/login" className="sf-button">{t`Entrar`}</Link>
        </nav>
      </header>
      <main className="sf-home">
        <section>
          <h1>{t`Menos tarefas soltas. Mais trabalho feito.`}</h1>
          <p>{t`Um lugar para organizar ideias, definir prioridades e acompanhar suas entregas. Do primeiro cartão ao último detalhe.`}</p>
          <Link
            className="sf-button"
            href="/boards"
          >{t`Abrir meus quadros`}</Link>
        </section>
        <section
          className="sf-demo"
          aria-label={t`Exemplo de organização de um projeto`}
        >
          <header>
            <h2>{t`Um projeto, em movimento`}</h2>
            <span>{t`Exemplo de quadro`}</span>
          </header>
          <div className="sf-columns">
            <div>
              <h3>{t`A fazer`}</h3>
              <article>
                <small>{t`Planejamento`}</small>
                <h4>{t`Organizar as ideias`}</h4>
                <p>{t`Reúna as referências e defina o que vem primeiro.`}</p>
              </article>
              <article>
                <h4>{t`Definir as prioridades`}</h4>
              </article>
            </div>
            <div>
              <h3>{t`Em andamento`}</h3>
              <article>
                <small>{t`Criação`}</small>
                <h4>{t`Dar forma ao projeto`}</h4>
                <p>{t`Um passo por vez, com tudo à vista.`}</p>
              </article>
            </div>
            <div>
              <h3>{t`Concluído`}</h3>
              <article>
                <small>{t`Entrega`}</small>
                <h4>{t`Alinhar o objetivo`}</h4>
              </article>
            </div>
          </div>
        </section>
      </main>
      <footer className="sf-footer">
        <span>Uma empresa SerTec Solutions</span>
        <Link href="/sobre">{t`Sobre e código-fonte`}</Link>
      </footer>
    </div>
  );
}
