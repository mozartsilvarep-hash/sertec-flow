/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { EAuthModes } from "@plane/constants";

export function TermsAndConditions({ authType = EAuthModes.SIGN_IN }: { authType?: EAuthModes }) {
  return (
    <p className="text-center text-13 text-tertiary">
      {authType === EAuthModes.SIGN_UP ? "Sua conta é individual." : "Seu acesso é pessoal."} Gerencie seu plano na área
      de assinatura após entrar.
    </p>
  );
}
