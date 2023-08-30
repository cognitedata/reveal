import { StrictMode } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import * as ReactDOM from 'react-dom/client';

import otherStyles from '@cognite/cogs.js/dist/cogs.css?inline';

import { STYLE_SCOPE } from './app/utils/constants';
import { AppWrapper } from './AppWrapper';

import './single-spa';
import './styles.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <HelmetProvider>
      <Helmet>
        <style>{otherStyles}</style>
      </Helmet>
      <div className={STYLE_SCOPE}>
        <AppWrapper />
      </div>
    </HelmetProvider>
  </StrictMode>
);
