import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { t } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { env } from "next-runtime-env";
import { useState } from "react";

import { authClient } from "@kan/auth/client";

import { Auth } from "~/components/AuthForm";
import { PageHead } from "~/components/PageHead";
import SertecAuthLayout from "~/components/SertecAuthLayout";

export default function LoginPage() {
  const router = useRouter();
  const isSignUpDisabled = env("NEXT_PUBLIC_DISABLE_SIGN_UP") === "true";
  const [isMagicLinkSent, setIsMagicLinkSent] = useState<boolean>(false);
  const [magicLinkRecipient, setMagicLinkRecipient] = useState<string>("");

  const redirect = useSearchParams().get("next");

  const handleMagicLinkSent = (value: boolean, recipient: string) => {
    setIsMagicLinkSent(value);
    setMagicLinkRecipient(recipient);
  };

  const { data } = authClient.useSession();

  if (data?.user.id) router.push(redirect ?? "/boards");

  return (
    <>
      <PageHead title={t`Login | SerTec Flow`} />
      <SertecAuthLayout>
        <div className="flex w-full flex-col items-center">
          <div className="z-10 flex w-full flex-col items-center">
            <p className="mb-10 text-3xl font-bold tracking-tight text-light-1000 dark:text-dark-1000">
              {isMagicLinkSent ? t`Check your inbox` : t`Welcome back`}
            </p>
            {isMagicLinkSent ? (
              <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <p className="text-md mt-2 text-center text-light-1000 dark:text-dark-1000">
                  <Trans>
                    Click on the link we've sent to {magicLinkRecipient} to sign
                    in.
                  </Trans>
                </p>
              </div>
            ) : (
              <div className="w-full">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                  <Auth setIsMagicLinkSent={handleMagicLinkSent} />
                </div>
              </div>
            )}
            {(!isSignUpDisabled || redirect?.startsWith("/invite/")) && (
              <p className="mt-4 text-sm text-light-1000 dark:text-dark-1000">
                <Trans>
                  Don't have an account?{" "}
                  <span className="underline">
                    <Link
                      href={redirect ? `/signup?next=${redirect}` : "/signup"}
                    >
                      Sign up
                    </Link>
                  </span>
                </Trans>
              </p>
            )}
          </div>
        </div>
      </SertecAuthLayout>
    </>
  );
}
