import { API_BASE_URL } from "@plane/constants";
import { APIService } from "@/services/api.service";

export type PlanId = "monthly" | "annual";
export type PaymentMethod = "card" | "pix";
export type BillingPayment = {
  id: string;
  plan: PlanId;
  method: PaymentMethod;
  amount: string;
  refunded_amount: string;
  status: string;
  paid_at: string | null;
  access_until: string | null;
};
export type BillingAccount = {
  active: boolean;
  access_until: string | null;
  workspace_slug: string | null;
  checkout_ready: boolean;
  require_subscription: boolean;
  is_admin: boolean;
  payments: BillingPayment[];
  recurring: { id: string; plan: PlanId; status: string; checkout_url: string } | null;
};
export type SalesData = {
  count: number;
  page: number;
  active_customers: number;
  revenue_month: string;
  payments_month: number;
  customers: {
    email: string;
    name: string;
    active: boolean;
    access_until: string | null;
    plan: PlanId | null;
    method: PaymentMethod | null;
  }[];
  recent_payments: BillingPayment[];
};
class BillingService extends APIService {
  constructor() {
    super(API_BASE_URL);
  }
  async account(): Promise<BillingAccount> {
    return (await this.get("/api/billing/me/")).data;
  }
  async sales(query: string, page: number): Promise<SalesData> {
    return (await this.get("/api/billing/sales/", { params: { q: query, page } })).data;
  }
  async checkout(plan: PlanId, method: PaymentMethod): Promise<string> {
    return (await this.post("/api/billing/checkout/", { plan, method })).data.url;
  }
  async cancel(): Promise<void> {
    await this.post("/api/billing/cancel/");
  }
}
export const billingService = new BillingService();
export const money = (value: string | number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value));
export const billingDate = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeZone: "America/Bahia" }).format(new Date(value))
    : "—";
export const planName = (value: PlanId | null) =>
  value === "annual" ? "Individual anual" : value === "monthly" ? "Individual mensal" : "Sem plano";
export const paymentStatus = (value: string) =>
  ({
    approved: "Aprovado",
    pending: "Pendente",
    in_process: "Em análise",
    rejected: "Recusado",
    refunded: "Reembolsado",
    charged_back: "Contestado",
    cancelled: "Cancelado",
  })[value] || "Em processamento";
