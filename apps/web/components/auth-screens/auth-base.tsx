/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
import { AuthRoot } from "@/components/account/auth-forms/auth-root";
import type { EAuthModes } from "@/helpers/authentication.helper";
import { AuthFooter } from "./footer";
import { AuthHeader } from "./header";
import { SertecAuthFrame } from "./sertec-auth-frame";
export function AuthBase({ authType }: { authType: EAuthModes }) {
  return (
    <SertecAuthFrame header={<AuthHeader type={authType} />} footer={<AuthFooter />}>
      <AuthRoot authMode={authType} />
    </SertecAuthFrame>
  );
}
