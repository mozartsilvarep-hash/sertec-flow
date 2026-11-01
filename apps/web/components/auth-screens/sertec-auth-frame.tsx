import type { ReactNode } from "react";
import { FolderKanban, ListChecks, LockKeyhole } from "lucide-react";
import { SertecSymbol } from "@plane/blocks/icons";
// oxlint-disable-next-line import/no-unassigned-import -- Scoped authentication surface styles.
import "./sertec-auth.css";
export function SertecAuthFrame({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="sertec-auth">
      {header}
      <div className="sertec-auth-body">
        <section className="sertec-auth-story" aria-labelledby="sertec-welcome">
          <h1 id="sertec-welcome">
            Seu trabalho,
            <br />
            em fluxo.
          </h1>
          <p>Organize projetos, conecte prioridades e acompanhe cada entrega com o SerTec Flow.</p>
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
          <div className="sertec-auth-signature">
            <SertecSymbol aria-hidden="true" />
            <span>Uma empresa SerTec Solutions</span>
          </div>
        </section>
        <div className="sertec-auth-form">{children}</div>
      </div>
      {footer}
    </div>
  );
}
