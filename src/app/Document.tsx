import styles from "./styles.css?url";
const canonicalUrl = "https://rwsdk.com";


export const Document: React.FC<{ children: React.ReactNode, rw?: { nonce: string } }> = ({
  children,
  rw,
}) => {
  const nonce = rw?.nonce || '';
  return (
  <html lang="en">
    <head>
      <title>Learn RedwoodSDK</title>
      
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content="RedwoodSDK offers free courses to learn our platofrm through short and concice video courses and documentation." />
      <meta name="keywords" content="RedwoodSDK, RedwoodJS, beginner course, javascript, cloudflare, Learn, Redwood, SDK" />

      <link rel="canonical" href={canonicalUrl} />
      {/* Icons */}
      <link rel="icon" type="image/svg+xml" href="/images/favicon.svg" />
        <link rel="logo" type="image/svg+xml" href="/images/logo--light.svg" />
        <link
          rel="logo-dark"
          type="image/svg+xml"
          href="/images/logo--dark.svg"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/images/apple-touch-icon.png"
        />
        <link rel="android-chrome-192x192" href="/images/android-chrome.png" />
        <link rel="android-chrome-512x512" href="/images/android-chrome.png" />
        {/* ogTags */}
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        {/* logo */}
        <meta
          property="og:logo"
          content="https://learn.rwsdk.com/images/logo--light.svg"
        />
        {/* locale */}
        <meta property="og:locale" content="en_US" />
        {/* image */}
        {/* Search Engine */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <meta name="yandex" content="index, follow" />
                <meta name="sitemap" content="/sitemap.xml" />
        <meta name="author" content="RedwoodJS" />
      <link rel="stylesheet" href={styles} />
    </head>
    <body>
      <div id="root">{children}</div>
      <script nonce={nonce}>import("/src/client.tsx")</script>
      <script async src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
      <noscript><img src="https://queue.simpleanalyticscdn.com/noscript.gif" alt="" referrerPolicy="no-referrer-when-downgrade"/></noscript>
    </body>
  </html>
  );
};
