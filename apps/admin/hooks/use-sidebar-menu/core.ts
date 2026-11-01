/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { BrainCog } from "lucide-react";
// plane imports
import { ImageOutline, LockOutline, MailOutline, SettingsOutline, WorkspaceOutline } from "@makeplane/propel/icons";
// types
import type { TSidebarMenuItem } from "./types";

export type TCoreSidebarMenuKey = "general" | "email" | "workspace" | "authentication" | "ai" | "image";

export const coreSidebarMenuLinks: Record<TCoreSidebarMenuKey, TSidebarMenuItem> = {
  general: {
    Icon: SettingsOutline,
    name: "Geral",
    description: "Nome e informações da sua instalação.",
    href: `/general/`,
  },
  email: {
    Icon: MailOutline,
    name: "E-mail",
    description: "Configure o envio de e-mails.",
    href: `/email/`,
  },
  workspace: {
    Icon: WorkspaceOutline,
    name: "Espaços de trabalho",
    description: "Gerencie os espaços de trabalho.",
    href: `/workspace/`,
  },
  authentication: {
    Icon: LockOutline,
    name: "Autenticação",
    description: "Escolha como as pessoas podem entrar.",
    href: `/authentication/`,
  },
  ai: {
    Icon: BrainCog,
    name: "Inteligência artificial",
    description: "Configure o provedor de inteligência artificial.",
    href: `/ai/`,
  },
  image: {
    Icon: ImageOutline,
    name: "Biblioteca de imagens",
    description: "Configure as bibliotecas de imagens.",
    href: `/image/`,
  },
};
