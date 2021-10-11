import theme from 'styles/defaultTheme';
import ThemeProvider from 'styles/ThemeProvider';

const withThemeProvider = (story) => {
  return <ThemeProvider theme={theme}>{story()}</ThemeProvider>;
};

export default withThemeProvider;
