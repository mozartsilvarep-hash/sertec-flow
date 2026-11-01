import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeAdminAuthError, getAdminAuthErrorMessage } from "../helpers/sertec-auth-errors.ts";

test("a senha recusada no servidor produz uma mensagem visível em português", () => {
  const code = normalizeAdminAuthError("5021");
  assert.equal(code, "INVALID_PASSWORD");
  assert.match(getAdminAuthErrorMessage(code), /senha.*recusada/i);
  assert.doesNotMatch(getAdminAuthErrorMessage(code), /PASSWORD_TOO_WEAK/);
});

test("os redirecionamentos administrativos numéricos são reconhecidos", () => {
  for (const [value, expected] of [
    ["5000", "INSTANCE_NOT_CONFIGURED"],
    ["5150", "ADMIN_ALREADY_EXIST"],
    ["5155", "REQUIRED_EMAIL_PASSWORD_FIRST_NAME"],
    ["5160", "INVALID_EMAIL"],
    ["5165", "INVALID_PASSWORD"],
    ["5180", "USER_ALREADY_EXISTS"],
    ["5900", "RATE_LIMIT_EXCEEDED"],
  ]) {
    assert.equal(normalizeAdminAuthError(value), expected);
    assert.ok(getAdminAuthErrorMessage(expected).length > 20);
  }
});

test("formatos simbólicos antigos continuam aceitos", () => {
  assert.equal(normalizeAdminAuthError("PASSWORD_TOO_WEAK"), "INVALID_PASSWORD");
  assert.equal(normalizeAdminAuthError("ADMIN_USER_ALREADY_EXIST"), "USER_ALREADY_EXISTS");
  assert.equal(normalizeAdminAuthError("INVALID_PASSWORD"), "INVALID_PASSWORD");
});

test("ausência de erro não cria alerta e erro desconhecido tem recuperação", () => {
  assert.equal(normalizeAdminAuthError(null), undefined);
  assert.equal(normalizeAdminAuthError(undefined), undefined);
  assert.equal(normalizeAdminAuthError(""), undefined);
  assert.match(getAdminAuthErrorMessage("5999"), /Confira os dados/);
});
