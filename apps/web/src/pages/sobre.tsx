import Link from "next/link";
import { t } from "@lingui/core/macro";
import { PageHead } from "~/components/PageHead";
import SertecLogo from "~/components/SertecLogo";

export default function About() {
  return (
    <div className="sf-public">
      <PageHead title="Sobre | SerTec Flow" />
      <header className="sf-header">
        <Link href="/">
          <SertecLogo />
        </Link>
        <Link href="/login">{t`Entrar`}</Link>
      </header>
      <main className="sf-plans">
        <h1>{t`Sobre o SerTec Flow`}</h1>
        <p>{t`Uma experiência de organização de projetos da SerTec Solutions, construída a partir do Kan.`}</p>
        <p>{t`Esta versão preserva a licença AGPL-3.0 e os avisos de autoria do projeto original.`}</p>
        <a
          href="https://github.com/kanbn/kan"
          className="sf-text-link"
        >{t`Conhecer o projeto Kan`}</a>
        <p>
          <a
            href="/source/sertec-flow-source.zip"
            className="sf-text-link"
          >{t`Baixar o código-fonte desta versão`}</a>
        </p>
      </main>
    </div>
  );
}
