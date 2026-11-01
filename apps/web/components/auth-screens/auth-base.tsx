/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
import { FolderKanban, ListChecks, LockKeyhole } from "lucide-react";
import { AuthRoot } from "@/components/account/auth-forms/auth-root";
import type { EAuthModes } from "@/helpers/authentication.helper";
import { AuthFooter } from "./footer";
import { AuthHeader } from "./header";
// oxlint-disable-next-line import/no-unassigned-import -- Load the scoped surface stylesheet.
import "./sertec-auth.css";

export function AuthBase({ authType }: { authType: EAuthModes }) {
  return (
    <div className="sertec-auth">
      <AuthHeader type={authType} />
      <div className="sertec-auth-body">
        <section className="sertec-auth-story" aria-labelledby="sertec-welcome">
          <h1 id="sertec-welcome">Dê espaço ao seu próximo projeto.</h1>
          <p>Reúna tarefas, organize prioridades e acompanhe o que importa no Sertec Flow.</p>
          <ul>
            <li>
              <FolderKanban size={19} />
              Projetos em um só lugar
            </li>
            <li>
              <ListChecks size={19} />
              Clareza para o próximo passo
            </li>
            <li>
              <LockKeyhole size={19} />
              Um espaço individual para trabalhar
            </li>
          </ul>
        </section>
        <div className="sertec-auth-form">
          <AuthRoot authMode={authType} />
        </div>
      </div>
      <AuthFooter />
    </div>
  );
}
