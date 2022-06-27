import React from 'react';

export const ThemeContext = React.createContext({
  mode: 'light',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setMode: (_mode: string) => {},
});

export const ThemeProvider: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [mode, setMode] = React.useState('light');
  const value = React.useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
