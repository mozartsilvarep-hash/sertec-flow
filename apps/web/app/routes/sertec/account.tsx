import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowUpRight, Check, RefreshCw, ShieldCheck } from "lucide-react";
import { BillingShell, BillingError } from "@/components/billing/shell";
import { PageHead } from "@/components/core/page-title";
import { billingService, billingDate, money, planName, paymentStatus } from "@/services/billing.service";
import type { PaymentMethod, PlanId } from "@/services/billing.service";

export default function SubscriptionPage() {
  const {
    data,
    error: accountError,
    isLoading,
    mutate,
  } = useSWR("SERTEC_BILLING_ACCOUNT", () => billingService.account(), {
    shouldRetryOnError: false,
    refreshInterval: 30000,
  });
  const [plan, setPlan] = useState<PlanId>("monthly");
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState(false);
  async function checkout() {
    setBusy(true);
    setMessage("");
    try {
      window.location.assign(await billingService.checkout(plan, method));
    } catch (error) {
      setMessage(errorMessage(error));
      setBusy(false);
    }
  }
  async function cancel() {
    setBusy(true);
    setMessage("");
    try {
      await billingService.cancel();
      setCancelConfirm(false);
      await mutate();
      setMessage("Renovação automática cancelada. Seu período já pago continua disponível.");
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <BillingShell>
      <PageHead title="Minha assinatura — SerTec Flow" />
      <header className="billing-heading">
        <div>
          <h1>Minha assinatura</h1>
          <p>Seu plano, seus pagamentos e o próximo passo.</p>
        </div>
        <button className="billing-icon-button" aria-label="Atualizar assinatura" onClick={() => void mutate()}>
          <RefreshCw size={18} />
        </button>
      </header>
      {isLoading ? (
        <p role="status">Carregando sua assinatura…</p>
      ) : accountError ? (
        <BillingError retry={() => void mutate()} />
      ) : (
        data && (
          <>
            <section className="billing-current" aria-labelledby="access-heading">
              <div>
                <span className={`billing-status ${data.active ? "active" : ""}`}>
                  {data.active ? "Acesso ativo" : "Acesso não ativo"}
                </span>
                <h2 id="access-heading">
                  {data.active ? "Tudo pronto para trabalhar." : "Um espaço para o que você quer realizar."}
                </h2>
                <p>
                  {data.active
                    ? `Seu período pago está disponível até ${billingDate(data.access_until)}.`
                    : "Escolha o período e a forma de pagamento para começar."}
                </p>
              </div>
              {data.active && data.workspace_slug && (
                <Link href={`/${data.workspace_slug}/`} className="billing-button">
                  Abrir meu espaço
                  <ArrowUpRight size={18} />
                </Link>
              )}
            </section>
            {message && (
              <p className="billing-notice" role="status">
                {message}
              </p>
            )}
            {!data.checkout_ready && (
              <p className="billing-notice" role="status">
                As contratações ainda não estão disponíveis. A configuração do Mercado Pago está pendente.
              </p>
            )}
            <div className="billing-purchase">
              <section aria-labelledby="plan-heading">
                <h2 id="plan-heading">Plano Individual</h2>
                <p>Projetos e tarefas em um espaço só seu.</p>
                <fieldset className="billing-plans">
                  <legend className="sr-only">Período do plano</legend>
                  {(["monthly", "annual"] as PlanId[]).map((value) => (
                    <label key={value} className={`billing-plan ${plan === value ? "selected" : ""}`}>
                      <input
                        type="radio"
                        name="plan"
                        value={value}
                        checked={plan === value}
                        onChange={() => setPlan(value)}
                      />
                      <span>
                        {value === "monthly" ? "Mensal" : "Anual"}
                        <strong>{money(value === "monthly" ? "39.90" : "399.90")}</strong>
                        <small>{value === "monthly" ? "por mês" : "por ano · economia de R$ 78,90"}</small>
                      </span>
                    </label>
                  ))}
                </fieldset>
                <ul className="billing-features">
                  <li>
                    <Check size={16} />
                    Espaço privado individual
                  </li>
                  <li>
                    <Check size={16} />
                    Organização de projetos e tarefas
                  </li>
                  <li>
                    <Check size={16} />
                    Histórico dos seus pagamentos
                  </li>
                </ul>
              </section>
              <section className="billing-payment" aria-labelledby="payment-heading">
                <h2 id="payment-heading">Como prefere pagar?</h2>
                <fieldset>
                  <legend className="sr-only">Forma de pagamento</legend>
                  <label>
                    <input type="radio" name="method" checked={method === "card"} onChange={() => setMethod("card")} />
                    <span>
                      Cartão<strong>Renovação automática</strong>
                    </span>
                  </label>
                  <label>
                    <input type="radio" name="method" checked={method === "pix"} onChange={() => setMethod("pix")} />
                    <span>
                      Pix<strong>Renovação manual a cada período</strong>
                    </span>
                  </label>
                </fieldset>
                <p>
                  {method === "card"
                    ? "O Mercado Pago gerencia o cartão e as próximas cobranças. Você pode cancelar a renovação por aqui."
                    : "Você paga pelo período escolhido. Para continuar após o vencimento, faça um novo pagamento."}
                </p>
                <button
                  className="billing-button"
                  disabled={busy || !data.checkout_ready || Boolean(data.recurring)}
                  onClick={() => void checkout()}
                >
                  {busy ? "Aguarde…" : `Continuar com ${method === "card" ? "cartão" : "Pix"}`}
                  <ArrowUpRight size={17} />
                </button>
                <small className="billing-secure">
                  <ShieldCheck size={15} />
                  Pagamento no ambiente do Mercado Pago.
                </small>
              </section>
            </div>
            {data.recurring && (
              <section className="billing-renewal">
                <div>
                  <h2>Renovação no cartão</h2>
                  <p>
                    {planName(data.recurring.plan)} ·{" "}
                    {data.recurring.status === "authorized"
                      ? "Automática"
                      : data.recurring.status === "paused"
                        ? "Pausada"
                        : "Aguardando contratação"}
                  </p>
                  {data.recurring.status === "pending" && (
                    <a className="billing-text-link" href={data.recurring.checkout_url}>
                      Retomar contratação no Mercado Pago
                    </a>
                  )}
                </div>
                {cancelConfirm ? (
                  <div>
                    <p>Cancelar as próximas cobranças? Seu período pago será mantido.</p>
                    <div className="billing-actions">
                      <button
                        className="billing-button secondary"
                        disabled={busy}
                        onClick={() => setCancelConfirm(false)}
                      >
                        Manter renovação
                      </button>
                      <button className="billing-button danger" disabled={busy} onClick={() => void cancel()}>
                        Confirmar cancelamento
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="billing-button secondary" onClick={() => setCancelConfirm(true)}>
                    Cancelar renovação
                  </button>
                )}
              </section>
            )}
            <section className="billing-history">
              <h2>Histórico de pagamentos</h2>
              <p>A liberação do acesso acontece após a confirmação do pagamento.</p>
              {data.payments.length ? (
                <div className="billing-table-scroll">
                  <table>
                    <caption className="sr-only">Últimos pagamentos da sua conta</caption>
                    <thead>
                      <tr>
                        <th>Plano</th>
                        <th>Pagamento</th>
                        <th>Valor</th>
                        <th>Data</th>
                        <th>Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.payments.map((p) => (
                        <tr key={p.id}>
                          <td>{planName(p.plan)}</td>
                          <td>{p.method === "pix" ? "Pix" : "Cartão"}</td>
                          <td>{money(p.amount)}</td>
                          <td>{billingDate(p.paid_at)}</td>
                          <td>
                            {paymentStatus(p.status)}
                            {Number(p.refunded_amount) > 0 && ` · ${money(p.refunded_amount)} devolvidos`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="billing-empty">
                  <h3>Seus pagamentos aparecerão aqui</h3>
                  <p>Após a primeira contratação, acompanhe valores e confirmações neste histórico.</p>
                </div>
              )}
            </section>
          </>
        )
      )}
    </BillingShell>
  );
}
function errorMessage(error: unknown): string {
  const value = error as { response?: { data?: { detail?: unknown } } };
  return typeof value.response?.data?.detail === "string"
    ? value.response.data.detail
    : "Não foi possível concluir a solicitação. Tente novamente.";
}
