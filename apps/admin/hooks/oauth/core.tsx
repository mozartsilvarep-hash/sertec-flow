/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { KeyOutline, MailOutline } from "@makeplane/propel/icons";
// types
import type {
  TCoreInstanceAuthenticationModeKeys,
  TGetBaseAuthenticationModeProps,
  TInstanceAuthenticationModes,
} from "@plane/types";
// assets
import giteaLogo from "@/app/assets/logos/gitea-logo.svg?url";
import githubLightModeImage from "@/app/assets/logos/github-black.png?url";
import githubDarkModeImage from "@/app/assets/logos/github-white.png?url";
import gitlabLogo from "@/app/assets/logos/gitlab-logo.svg?url";
import googleLogo from "@/app/assets/logos/google-logo.svg?url";
// components
import { EmailCodesConfiguration } from "@/components/authentication/email-config-switch";
import { GiteaConfiguration } from "@/components/authentication/gitea-config";
import { GithubConfiguration } from "@/components/authentication/github-config";
import { GitlabConfiguration } from "@/components/authentication/gitlab-config";
import { GoogleConfiguration } from "@/components/authentication/google-config";
import { PasswordLoginConfiguration } from "@/components/authentication/password-config-switch";

// Authentication methods
export const getCoreAuthenticationModesMap: (
  props: TGetBaseAuthenticationModeProps
) => Record<TCoreInstanceAuthenticationModeKeys, TInstanceAuthenticationModes> = ({
  disabled,
  updateConfig,
  resolvedTheme,
}) => ({
  "unique-codes": {
    key: "unique-codes",
    name: "Código por e-mail",
    description: "Envie um código de acesso por e-mail. Configure o envio de e-mails antes de ativar esta opção.",
    icon: <MailOutline className="h-6 w-6 p-0.5 text-tertiary" />,
    config: <EmailCodesConfiguration disabled={disabled} updateConfig={updateConfig} />,
    enabledConfigKey: "ENABLE_MAGIC_LINK_LOGIN",
  },
  "passwords-login": {
    key: "passwords-login",
    name: "E-mail e senha",
    description: "Seus clientes entram usando o e-mail e a senha cadastrados.",
    icon: <KeyOutline className="h-6 w-6 p-0.5 text-tertiary" />,
    config: <PasswordLoginConfiguration disabled={disabled} updateConfig={updateConfig} />,
    enabledConfigKey: "ENABLE_EMAIL_PASSWORD",
  },
  google: {
    key: "google",
    name: "Google",
    description: "Permita entrar com uma conta Google.",
    icon: <img src={googleLogo} height={20} width={20} alt="Google Logo" />,
    config: <GoogleConfiguration disabled={disabled} updateConfig={updateConfig} />,
    enabledConfigKey: "IS_GOOGLE_ENABLED",
  },
  github: {
    key: "github",
    name: "GitHub",
    description: "Permita entrar com uma conta GitHub.",
    icon: (
      <img
        src={resolvedTheme === "dark" ? githubDarkModeImage : githubLightModeImage}
        height={20}
        width={20}
        alt="GitHub Logo"
      />
    ),
    config: <GithubConfiguration disabled={disabled} updateConfig={updateConfig} />,
    enabledConfigKey: "IS_GITHUB_ENABLED",
  },
  gitlab: {
    key: "gitlab",
    name: "GitLab",
    description: "Permita entrar com uma conta GitLab.",
    icon: <img src={gitlabLogo} height={20} width={20} alt="GitLab Logo" />,
    config: <GitlabConfiguration disabled={disabled} updateConfig={updateConfig} />,
    enabledConfigKey: "IS_GITLAB_ENABLED",
  },
  gitea: {
    key: "gitea",
    name: "Gitea",
    description: "Permita entrar com uma conta Gitea.",
    icon: <img src={giteaLogo} height={20} width={20} alt="Gitea Logo" />,
    config: <GiteaConfiguration disabled={disabled} updateConfig={updateConfig} />,
    enabledConfigKey: "IS_GITEA_ENABLED",
  },
});
