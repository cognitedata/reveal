import { StrictMode } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import antDStyles from 'antd/dist/antd.css?inline';
import * as ReactDOM from 'react-dom/client';

import cogsLabStyles from '@cognite/cogs-lab/dist/cogs-lab.css?inline';
import otherStyles from '@cognite/cogs.js/dist/cogs.css?inline';

import { STYLE_SCOPE } from './app/utils/constants';
import { AppWrapper } from './AppWrapper';

import './single-spa';
import './styles.css';

// 'global' has to be defined on the window in order to make the 'onboarding guide' work for FDX.
window.global ||= window;

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <StrictMode>
    <HelmetProvider>
      <Helmet>
        <style>{antDStyles}</style>
        <style>{otherStyles}</style>
        <style>{cogsLabStyles}</style>
      </Helmet>
      <div className={STYLE_SCOPE}>
        <AppWrapper />
      </div>
    </HelmetProvider>
  </StrictMode>
);
