import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ColorSchemeContextType {
  colorScheme: string;
  setColorScheme: (scheme: string) => void;
}

const ColorSchemeContext = createContext<ColorSchemeContextType | undefined>(undefined);

export const ColorSchemeProvider = ({ children }: { children: ReactNode }) => {
  const [colorScheme, setColorScheme] = useState('default');

  return (
    <ColorSchemeContext.Provider value={{ colorScheme, setColorScheme }}>
      {children}
    </ColorSchemeContext.Provider>
  );
};

export const useColorScheme = () => {
  const context = useContext(ColorSchemeContext);
  if (context === undefined) {
    throw new Error('useColorScheme must be used within a ColorSchemeProvider');
  }
  return context;
};
