import { StrictMode } from 'react';

import ReactDOMClient from 'react-dom/client';

import { AppWrapper } from './AppWrapper';
import './single-spa';

const root = ReactDOMClient.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>
);
