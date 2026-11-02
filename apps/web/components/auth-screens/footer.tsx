/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
import Link from "next/link";
export function AuthFooter() {
  return (
    <footer className="sertec-auth-footer">
      <span>SerTec Flow · Organização para o seu dia a dia.</span>
      <Link href="/planos/">Conheça os planos</Link>
      <a
        href="https://github.com/mozartsilvarep-hash/sertec-flow"
        target="_blank"
        rel="noopener noreferrer"
        title="Derivado do Plane, sob AGPL-3.0"
      >
        Código-fonte e licenças
      </a>
    </footer>
  );
}
