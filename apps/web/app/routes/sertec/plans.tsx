import Link from "next/link";
import { SertecLogo } from "@plane/blocks/icons";
import "./plans.css";
export default function PlansPage() {
  return (
    <main className="sertec-plans">
      <header>
        <Link href="/">
          <SertecLogo width={200} height={40} />
        </Link>
        <Link href="/sign-in/">Entrar na minha conta</Link>
      </header>
      <section className="plans-intro">
        <p className="plans-eyebrow">PLANOS SERTEC FLOW</p>
        <h1>
          Seu trabalho, em fluxo.
          <br />
          Seu espaço, só seu.
        </h1>
        <p>Organize projetos e tarefas em um espaço individual. Escolha o período que combina com você.</p>
      </section>
      <section className="plans-options" aria-label="Plano Individual">
        {[
          { name: "Mensal", price: "39,90", period: "por mês", detail: "Flexibilidade para renovar a cada mês." },
          {
            name: "Anual",
            price: "399,90",
            period: "por ano",
            detail: "Economize R$ 78,90 em relação a 12 mensalidades.",
          },
        ].map((plan) => (
          <article key={plan.name}>
            <p>Plano Individual</p>
            <h2>{plan.name}</h2>
            <p className="plans-price">
              R$ {plan.price}
              <span>{plan.period}</span>
            </p>
            <p>{plan.detail}</p>
            <ul>
              <li>Espaço privado individual</li>
              <li>Organização de projetos e tarefas</li>
              <li>Histórico de pagamentos</li>
            </ul>
            <Link className="plans-cta" href="/assinatura/">
              Escolher na minha assinatura
            </Link>
          </article>
        ))}
      </section>
      <section className="plans-payment">
        <h2>Como funciona o pagamento?</h2>
        <p>
          Cartão com renovação automática ou Pix com renovação manual a cada período. Entre na sua conta para escolher o
          plano e concluir o pagamento pelo Mercado Pago.
        </p>
        <Link href="/sign-up/">Ainda não tem conta? Cadastre-se</Link>
      </section>
      <footer>
        <span>Uma empresa SerTec Solutions</span>
        <a href="https://github.com/mozartsilvarep-hash/sertec-flow">Código-fonte e licenças</a>
      </footer>
    </main>
  );
}
