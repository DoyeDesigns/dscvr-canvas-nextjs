import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>DSCVR Example Canvas - Next.js</title>
        <meta name="description" content="DSCVR Solana Blinks Hub - Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="dscvr:canvas:version" content="vNext" />
        <meta name="og:image" content="https://my-canvas.com/preview-image.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
