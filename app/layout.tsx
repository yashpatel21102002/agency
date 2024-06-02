import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/providers/theme-provider";
import {dark} from '@clerk/themes'

const font = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agency",
  description: "All in one Agency Solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{baseTheme:dark}}>
      <html lang="en" suppressHydrationWarning>
        <body className={font.className}>
          {/* wrapping the application inside the themeProvider ( @shadcnui ) */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
