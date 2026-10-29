import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { siteUrl, SITE_NAME } from "@/lib/site";
import { ConsentBanner } from "@/components/ConsentBanner";
import { SiteHeader } from "@/components/SiteHeader";
import { Insights } from "@/components/Insights";

/*
 * 書体は slides と同じ組み合わせ。
 *   Space Grotesk ... 英数字。本文も見出しも数字もこれ 1 つで通す
 *   Murecho 900   ... 見出しの日本語。和文だけ重い（murecho.css で自前配布）
 *   Geist Mono    ... 日付やコード
 * 和文の本文は端末の Hiragino に落とす（slides と同じ）。
 */
const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/*
 * フッターの本文書体。portfolio とフッターを同じものにするために要る。
 * 本文（--font-sans）は Space Grotesk のままで、使うのはフッターだけ。
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

/*
 * metadataBase を置くと、各ページの openGraph.images に相対パスを書ける。
 * これが無いと Next が絶対 URL を組めず OGP の画像が出ない。
 */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: "blog", template: "%s | blog" },
  description: "書いたものの置き場",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ja_JP",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ja"
      className={`${spaceGrotesk.variable} ${geistMono.variable} ${geistSans.variable} h-full antialiased`}
    >
      {/* 縦の flex。各ページの本文に grow を付けてフッターを一番下に着ける */}
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {children}
        {/* cookie の断り。返事をするまで何も置かない */}
        <ConsentBanner />
        {/* Vercel 側の計測（速さは常時・閲覧は同意後） */}
        <Insights />
      </body>
    </html>
  );
}
