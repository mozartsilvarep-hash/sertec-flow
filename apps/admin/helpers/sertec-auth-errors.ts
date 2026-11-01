// Backend codes are numeric; keep setup errors visible and actionable.
const codes: Record<string, string> = {
  "5000": "INSTANCE_NOT_CONFIGURED",
  "5150": "ADMIN_ALREADY_EXIST",
  "5155": "REQUIRED_EMAIL_PASSWORD_FIRST_NAME",
  "5160": "INVALID_EMAIL",
  "5165": "INVALID_PASSWORD",
  "5021": "INVALID_PASSWORD",
  "5180": "USER_ALREADY_EXISTS",
  "5900": "RATE_LIMIT_EXCEEDED",
  INSTANCE_NOT_CONFIGURED: "INSTANCE_NOT_CONFIGURED",
  ADMIN_ALREADY_EXIST: "ADMIN_ALREADY_EXIST",
  REQUIRED_ADMIN_EMAIL_PASSWORD_FIRST_NAME: "REQUIRED_EMAIL_PASSWORD_FIRST_NAME",
  INVALID_ADMIN_EMAIL: "INVALID_EMAIL",
  INVALID_ADMIN_PASSWORD: "INVALID_PASSWORD",
  PASSWORD_TOO_WEAK: "INVALID_PASSWORD",
  ADMIN_USER_ALREADY_EXIST: "USER_ALREADY_EXISTS",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
};
const messages: Record<string, string> = {
  INSTANCE_NOT_CONFIGURED: "A instalação ainda não foi registrada. Tente novamente em instantes.",
  ADMIN_ALREADY_EXIST: "A administração já foi cadastrada. Atualize a página para entrar.",
  REQUIRED_EMAIL_PASSWORD_FIRST_NAME: "Preencha nome, e-mail e senha para continuar.",
  INVALID_EMAIL: "Informe um endereço de e-mail válido.",
  INVALID_PASSWORD:
    "A senha foi recusada pelo servidor. Use uma senha exclusiva e longa, sem nomes ou sequências comuns.",
  USER_ALREADY_EXISTS: "Este e-mail já possui uma conta. Entre com ela para continuar.",
  RATE_LIMIT_EXCEEDED: "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
};
export function normalizeAdminAuthError(value: string | null | undefined): string | undefined {
  return value ? codes[value] || value : undefined;
}
export function getAdminAuthErrorMessage(code: string): string {
  return messages[code] || "Não foi possível concluir o cadastro. Confira os dados e tente novamente.";
}
