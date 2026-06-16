import type { Metadata } from "next";
import {
  Inter,
  Poppins,
  Lato,
  Imperial_Script,
  Quicksand,
  Montserrat,
} from "next/font/google";
import Script from "next/script";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  style: ["normal", "italic"],
});
const lato = Lato({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-lato",
});
const imperialScript = Imperial_Script({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-accent",
});
const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-quicksand",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Groovly",
  description:
    "Groovly lets every guest add, vote, and vibe. Build collaborative playlists for any party, trip, or hangout.",
  icons: {
    icon: "/assets/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable} ${lato.variable} ${imperialScript.variable} ${quicksand.variable} ${montserrat.variable} overflow-x-hidden`}
    >
      <body className="bg-bg text-white font-sans min-h-screen flex flex-col items-stretch overflow-x-hidden">
        <Script
          src="https://www.youtube.com/iframe_api"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/SplitText.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/gsap@3.14.1/dist/ScrollSmoother.min.js"
          strategy="beforeInteractive"
        />
        <div id="smooth-wrapper">
          <div id="smooth-content">
            <div className="flex-1">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}

