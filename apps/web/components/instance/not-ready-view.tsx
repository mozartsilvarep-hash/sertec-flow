/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */
import { GOD_MODE_URL } from "@plane/constants";
import { SertecLogo, SertecSymbol } from "@plane/blocks/icons";
import { Button } from "@makeplane/propel/components/button";
import DefaultLayout from "@/layouts/default-layout";
export function InstanceNotReady() {
  return (
    <DefaultLayout>
      <div className="flex min-h-screen flex-col px-6 py-8">
        <header>
          <SertecLogo width={220} height={44} />
        </header>
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-7 py-12 text-center">
          <SertecSymbol width={88} height={88} />
          <h1 className="text-h2-semibold text-primary">Vamos preparar seu SerTec Flow</h1>
          <p className="text-body-md-regular text-secondary">
            Configure a administração da sua instalação para começar a organizar projetos e tarefas.
          </p>
          <Button
            variant="primary"
            size="lg"
            nativeButton={false}
            render={<a href={GOD_MODE_URL}>Configurar SerTec Flow</a>}
            label="Configurar SerTec Flow"
          />
        </main>
        <footer className="text-center text-12 text-tertiary">
          Seu trabalho, em fluxo. · Uma empresa SerTec Solutions
        </footer>
      </div>
    </DefaultLayout>
  );
}
