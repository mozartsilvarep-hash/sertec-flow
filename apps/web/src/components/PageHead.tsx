import Head from "next/head";

export const PageHead = ({ title }: { title: string }) => {
  return (
    <Head>
      <title>{title.replace(/kan\.bn/gi, "SerTec Flow")}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/brand/sertec-flow-favicon.svg" />
      <link rel="manifest" href="/manifest.json" />
    </Head>
  );
};
