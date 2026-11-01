/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

// Compatibility export: existing consumers receive the SerTec identity.
export { SertecSymbol as PlaneLogo } from "./sertec-logo";
import type { ComponentPropsWithoutRef } from "react";
export type PlaneLogoProps = ComponentPropsWithoutRef<"svg">;
