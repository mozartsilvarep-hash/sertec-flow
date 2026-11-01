import { useState } from "react";
import useSWR from "swr";
import { Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { BillingShell, BillingError } from "@/components/billing/shell";
import { PageHead } from "@/components/core/page-title";
import { billingService, billingDate, money, planName } from "@/services/billing.service";

export default function SalesPage() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const account = useSWR("SERTEC_BILLING_ACCOUNT", () => billingService.account(), { shouldRetryOnError: false });
  const { data, error, isLoading, mutate } = useSWR(
    account.data?.is_admin ? ["SERTEC_SALES", query, page] : null,
    () => billingService.sales(query, page),
    { shouldRetryOnError: false }
  );
  return (
    <BillingShell sales>
      <PageHead title="Vendas e assinantes — SerTec Flow" />
      <header className="billing-heading">
        <div>
          <h1>Vendas e assinantes</h1>
          <p>Uma visão do seu negócio, com pagamentos confirmados.</p>
        </div>
        <button className="billing-icon-button" aria-label="Atualizar vendas" onClick={() => void mutate()}>
          <RefreshCw size={18} />
        </button>
      </header>
      {account.isLoading ? (
        <p role="status">Verificando acesso…</p>
      ) : account.error ? (
        <BillingError retry={() => void account.mutate()} />
      ) : !account.data?.is_admin ? (
        <div className="billing-empty">
          <h2>Acesso restrito</h2>
          <p>Este painel está disponível apenas para administradores da instância.</p>
        </div>
      ) : isLoading ? (
        <p role="status">Carregando vendas…</p>
      ) : error ? (
        <BillingError retry={() => void mutate()} />
      ) : (
        data && (
          <>
            <dl className="billing-summary">
              <div>
                <dt>Receita bruta neste mês</dt>
                <dd>{money(data.revenue_month)}</dd>
              </div>
              <div>
                <dt>Assinantes com acesso ativo</dt>
                <dd>{data.active_customers}</dd>
              </div>
              <div>
                <dt>Pagamentos aprovados neste mês</dt>
                <dd>{data.payments_month}</dd>
              </div>
            </dl>
            <p className="billing-caption">
              Mês calendário atual. Receita exclui pagamentos com reembolso ou contestação; taxas do Mercado Pago não
              foram descontadas.
            </p>
            <section className="billing-history">
              <div className="billing-section-heading">
                <h2>Assinantes</h2>
                <span>
                  {data.count} {data.count === 1 ? "cadastro" : "cadastros"}
                </span>
              </div>
              <form
                className="billing-search"
                onSubmit={(event) => {
                  event.preventDefault();
                  setQuery(search);
                  setPage(1);
                }}
              >
                <Search size={18} aria-hidden="true" />
                <label className="sr-only" htmlFor="subscriber-search">
                  Buscar por nome ou e-mail
                </label>
                <input
                  id="subscriber-search"
                  type="search"
                  placeholder="Buscar por nome ou e-mail"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  maxLength={120}
                />
                <button className="billing-button secondary" type="submit">
                  Buscar
                </button>
              </form>
              {data.customers.length ? (
                <div className="billing-table-scroll">
                  <table>
                    <caption className="sr-only">Assinantes e situação de acesso</caption>
                    <thead>
                      <tr>
                        <th>Pessoa</th>
                        <th>Plano</th>
                        <th>Pagamento</th>
                        <th>Acesso até</th>
                        <th>Situação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.customers.map((customer) => (
                        <tr key={customer.email}>
                          <td>
                            <strong>{customer.name || "Sem nome informado"}</strong>
                            <small>{customer.email}</small>
                          </td>
                          <td>{planName(customer.plan)}</td>
                          <td>{customer.method ? (customer.method === "pix" ? "Pix" : "Cartão") : "—"}</td>
                          <td>{billingDate(customer.access_until)}</td>
                          <td>
                            <span className={`billing-status ${customer.active ? "active" : ""}`}>
                              {customer.active ? "Ativo" : "Sem acesso ativo"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="billing-empty">
                  <h3>{query ? "Nenhum assinante encontrado" : "Sua primeira venda começa aqui"}</h3>
                  <p>
                    {query
                      ? "Tente buscar por outro nome ou e-mail."
                      : "Quando alguém iniciar uma contratação, o cadastro aparecerá neste painel."}
                  </p>
                </div>
              )}
              <div className="billing-pagination">
                <span>
                  Página {page} de {Math.max(1, Math.ceil(data.count / 25))}
                </span>
                <button aria-label="Página anterior" disabled={page === 1} onClick={() => setPage(page - 1)}>
                  <ChevronLeft size={18} />
                </button>
                <button
                  aria-label="Próxima página"
                  disabled={page * 25 >= data.count}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </section>
          </>
        )
      )}
    </BillingShell>
  );
}
