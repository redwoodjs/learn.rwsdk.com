import constants from "@/app/lib/Constants";
export function Footer() {
  return (
    <footer className="bg-orange-light border-t border-orange-dark py-8 sm:py-12 md:py-[20px]">
      <div className="max-w-[1400px] mx-auto py-8 sm:py-12 md:py-[20px] px-4 sm:px-8 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex gap-8 md:gap-20">
          <div>
            <h3 className="text-lg font-noto font-bold text-purple mb-3">
              About
            </h3>
            <ul className="list-none text-md font-chivo space-y-2">
              <li>
                <a
                  href="https://rwsdk.com/personal-software"
                  className="hover:text-baige font-playfair transition-colors"
                >
                  Personal Software
                </a>
              </li>
              <li>
                <a
                  href="https://rwsdk.com/blog"
                  className="hover:text-baige font-playfair transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-noto font-bold text-purple mb-3">
              Resources
            </h3>
            <ul className="list-none text-md font-chivo space-y-2">
              <li>
                <a
                  href={constants.CLOUDFLARE_DOCS_URL}
                  className="hover:text-baige font-playfair transition-colors"
                >
                  Cloudflare RedwoodSDK Docs
                </a>
              </li>
              <li>
                <a
                  href="https://www.youtube.com/watch?v=bj2pL1amHow&ab_channel=Syntax"
                  className="hover:text-baige font-playfair transition-colors"
                >
                  SyntaxFM Podcast
                </a>
              </li>
              <li>
                <a
                  href="https://syntax.fm/show/902/fullstack-cloudflare-with-react-and-vite-redwood-sdk"
                  className="hover:text-baige font-playfair transition-colors"
                >
                  SyntaxFM Interview
                </a>
              </li>
              <li>
                <a
                  href={constants.DOCS_URL}
                  className="hover:text-baige font-playfair transition-colors"
                >
                  Docs
                </a>
              </li>
              <li>
                <a
                  href={constants.QUICK_START_URL}
                  className="hover:text-baige font-playfair transition-colors"
                >
                  Quick Start
                </a>
              </li>
              <li>
                <a
                  href={constants.REDWOODJS_URL}
                  className="hover:text-baige font-playfair transition-colors"
                >
                  RedwoodJS
                </a>
              </li>
              <li>
                <a
                  href={constants.REDWOOD_GRAPHQL_DOCS_URL}
                  className="hover:text-baige font-playfair transition-colors"
                >
                  RedwoodGraphQL Docs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-noto font-bold text-purple mb-3">
              Social
            </h3>
            <ul className="list-none text-md font-chivo space-y-2">
              <li>
                <a
                  href={constants.GITHUB_REPO}
                  className="hover:text-baige flex items-center font-playfair transition-colors"
                >
                  <img
                    src="/images/github.svg"
                    alt="Github"
                    className="w-4 h-4 inline-block mr-2"
                  />{" "}
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href={constants.DISCORD_URL}
                  className="hover:text-baige flex items-center font-noto transition-colors"
                >
                  <img
                    src="/images/discord.svg"
                    alt="Discord"
                    className="w-4 h-4 inline-block mr-2"
                  />{" "}
                  Discord
                </a>
              </li>
              <li>
                <a
                  href={constants.YOUTUBE_URL}
                  className="hover:text-baige flex items-center font-noto transition-colors"
                >
                  <img
                    src="/images/youtube.svg"
                    alt="YouTube"
                    className="w-4 h-4 inline-block mr-2"
                  />{" "}
                  YouTube
                </a>
              </li>
              <li>
                <a
                  href={constants.BLUESKY_URL}
                  className="hover:text-baige flex items-center font-noto transition-colors"
                >
                  <img
                    src="/images/bluesky.svg"
                    alt="BlueSky"
                    className="w-4 h-4 inline-block mr-2"
                  />{" "}
                  Bluesky
                </a>
              </li>
              <li>
                <a
                  href={constants.X_URL}
                  className="hover:text-baige flex items-center font-noto transition-colors"
                >
                  <img
                    src="/images/x.svg"
                    alt="X"
                    className="w-4 h-4 inline-block mr-2"
                  />{" "}
                  X
                </a>
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-4 items-start max-w-[600px]">
            <img src="/images/logo--light.svg" alt="RedwoodSDK" className="h-10" />
            <p className="text-sm font-noto font-light">
              RedwoodSDK is a React framework for Cloudflare. It begins as a
              Vite plugin that unlocks SSR, React Server Components, Server
              Functions, and realtime features. Its standards-based router, with
              support for middleware and interruptors, gives you fine-grained
              control over every request and response. With built-in access to
              Cloudflare Workers, D1 (Database), R2 (Storage), Queues, AI, and
              full local emulation via Miniflare, development feels just like
              production.
            </p>
            <p className="text-[14px] sm:text-[12px] font-chivo">
              Copyright © 2025 RedwoodJS Inc. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}