import { useTheme as useThemeWithoutDefault } from '@material-ui/styles';

import theme from './defaultTheme';
import { Theme } from './types';

export function useTheme(): Theme {
  return useThemeWithoutDefault() || theme;
}

export default useTheme;

// to make usage of this easier, eg:
// import { useTheme, Theme } from 'styles/useTheme';
export type { Theme };
