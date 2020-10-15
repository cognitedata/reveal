/* eslint-disable import/first */
jest.mock('mixpanel-browser', () => {
  return {
    'data-exploration': {
      add_group: jest.fn(),
      identify: jest.fn(),
    },
  };
});

jest.mock('utils/SDK');

import React from 'react';
import ReactDOM from 'react-dom';
import { CogniteResourceProvider } from '@cognite/cdf-resources-store';
import { MemoryRouter } from 'react-router';
import { getSDK } from 'utils/SDK';
import { mockStore } from 'utils/mockStore';
import { SDKProvider } from 'context/sdk';
import App from './App';

const initialStoreState = {
  app: {},
  router: { location: { pathname: 'foo' } },
  login: {},
  annotations: { byAssetId: {} },
  files: { items: {} },
  timeseries: { items: {} },
  assets: { items: {} },
  events: { items: {} },
};

const store = mockStore(initialStoreState);

describe('App', () => {
  it('renders with warnings but without crashing', () => {
    expect(() => {
      const div = document.createElement('div');
      ReactDOM.render(
        <SDKProvider sdk={getSDK()}>
          <CogniteResourceProvider sdk={getSDK()} store={store}>
            <MemoryRouter>
              <App />
            </MemoryRouter>
          </CogniteResourceProvider>
        </SDKProvider>,
        div
      );
      ReactDOM.unmountComponentAtNode(div);
    }).not.toThrow();
  });
});
