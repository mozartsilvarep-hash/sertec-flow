/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import Link from "next/link";
import { SettingsHeading } from "@/components/settings/heading";

export function BillingRoot() {
  return (
    <section className="size-full overflow-y-auto">
      <SettingsHeading
        title="Minha assinatura"
        description="Consulte seu plano individual, pagamentos e renovação no Sertec Flow."
      />
      <div className="mt-6 space-y-4">
        <p className="text-14 text-secondary">
          Individual mensal: R$ 39,90. Individual anual: R$ 399,90. Cartão com renovação automática ou Pix com renovação
          manual.
        </p>
        <Link
          href="/assinatura/"
          className="inline-flex rounded-md bg-accent-primary px-4 py-3 text-14 font-medium text-on-color focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Gerenciar minha assinatura
        </Link>
      </div>
    </section>
  );
}
