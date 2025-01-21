"use client"

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';
import { ColorSchemeProvider } from '@/components/ui/context/ColorSchemeContex';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props} themes={['dark', 'light', 'custom', 'light-blue', 'light-yellow', 'light-red','light-green','light-orange','light-violet', 'dark-blue', 'dark-yellow','dark-green','dark-violet','dark-orange', 'dark-red']}>
      <ColorSchemeProvider>
        {children}
      </ColorSchemeProvider>
    </NextThemesProvider>
  );
}