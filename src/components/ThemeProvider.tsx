"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Follows the visitor's OS setting on first load, then remembers whatever they
 * toggle to. next-themes injects a blocking script so there's no flash of the
 * wrong theme before hydration.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
