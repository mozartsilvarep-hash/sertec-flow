/**
 * Copyright (c) 2023-present Plane Software, Inc. and contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 * See the LICENSE file for details.
 */

import { Dialog, DialogBody, DialogContent, DialogMain } from "@makeplane/propel/components/dialog";
import { Button } from "@makeplane/propel/components/button";
export type PaidPlanUpgradeModalProps = { isOpen: boolean; handleClose: () => void };
export function PaidPlanUpgradeModal({ isOpen, handleClose }: PaidPlanUpgradeModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent aria-labelledby="sertec-feature-title" aria-describedby="sertec-feature-description">
        <DialogMain>
          <DialogBody>
            <h2 id="sertec-feature-title" className="text-h4-semibold">
              Recurso indisponível nesta instalação
            </h2>
            <p id="sertec-feature-description" className="mt-3 text-body-sm-regular text-secondary">
              Continue utilizando os recursos disponíveis do seu SerTec Flow. Esta opção ainda não está habilitada.
            </p>
            <div className="mt-6">
              <Button variant="primary" onClick={handleClose} label="Entendi" />
            </div>
          </DialogBody>
        </DialogMain>
      </DialogContent>
    </Dialog>
  );
}
