import { withStyles as withStylesWithoutDefault } from '@material-ui/styles';

import theme from './defaultTheme';

export const withStyles = (stylesOrCreator: any, options: any = {}) => {
  return withStylesWithoutDefault(stylesOrCreator, {
    theme,
    ...options,
  });
};

export default withStyles;
