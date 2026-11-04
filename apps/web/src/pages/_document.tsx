import { Html, Head, Main, NextScript } from "next/document";

import Script from "next/script";

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <Script src="/__ENV.js" strategy="beforeInteractive" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
