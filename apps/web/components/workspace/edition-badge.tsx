/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import Link from "next/link";
export function WorkspaceEditionBadge() {
  return (
    <Link
      href="/assinatura/"
      className="text-12 font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      Minha assinatura SerTec
    </Link>
  );
}
