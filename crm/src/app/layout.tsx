import "@repo/ui/styles";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@repo/ui/components/providers";
import { QueryProvider } from "@repo/ui/components/providers";
import { AuthProvider } from "@repo/ui/contexts";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "White Label Admin",
  description: "White label admin dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
