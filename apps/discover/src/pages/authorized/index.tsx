import React from 'react';

import { WhiteLoader } from 'components/loading';
import defaultTheme from 'styles/defaultTheme';
import ThemeProvider from 'styles/ThemeProvider';
import { useTheme } from 'styles/useTheme';

const Content = React.lazy(
  () => import(/* webpackChunkName: 'main-content' */ './Content')
);

const AuthorizedApp = () => {
  const theme = useTheme();
  document.body.style.backgroundColor = theme.palette.white;

  return (
    <ThemeProvider theme={defaultTheme}>
      <React.Suspense fallback={<WhiteLoader />}>
        <Content />
      </React.Suspense>
    </ThemeProvider>
  );
};

export default AuthorizedApp;
