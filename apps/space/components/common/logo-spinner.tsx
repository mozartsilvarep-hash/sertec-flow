/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { SertecSymbol } from "@plane/blocks/icons";
export function LogoSpinner() {
  return (
    <div className="sertec-brand-loader" role="status">
      <SertecSymbol aria-hidden="true" />
      <span>Carregando SerTec Flow…</span>
    </div>
  );
}
