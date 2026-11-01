/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
import Link from "next/link";
export function AuthFooter() {
  return (
    <footer className="sertec-auth-footer">
      <span>Sertec Flow · Organização para o seu dia a dia.</span>
      <Link href="/assinatura/">Planos e minha assinatura</Link>
      <span>Baseado em Plane · Software sob AGPL-3.0</span>
    </footer>
  );
}
