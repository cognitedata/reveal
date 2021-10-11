import React from 'react';

import { Theme } from '@material-ui/core';
import MuiThemeProvider from '@material-ui/styles/ThemeProvider';

export const ThemeProvider: React.FC<{ theme: Theme }> = ({
  children,
  theme,
}) => {
  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
};

export default ThemeProvider;
