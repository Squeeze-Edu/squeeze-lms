import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/toaster";
import { ClientNavigation } from "@/components/navigation/ClientNavigation";

export const metadata: Metadata = {
  title: "Squeeze LMS",
  description: "Learning Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 현재 URL 경로를 서버 컴포넌트에서는 직접 확인할 수 없으므로
  // 클라이언트 컴포넌트에서 처리하도록 수정
  return (
    <html lang="ko" data-theme="light" style={{ colorScheme: "light" }}>
      <body>
        <Providers>
          <ClientNavigation />
          <div className="container">{children}</div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
