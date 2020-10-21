/* eslint-disable import/first */
jest.mock('mixpanel-browser', () => {
  return {
    'data-exploration': {
      add_group: jest.fn(),
      identify: jest.fn(),
    },
  };
});

import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router';
import { SDKProvider } from '@cognite/sdk-provider';
import { CogniteClient } from '@cognite/sdk';
import App from './App';

describe('App', () => {
  it('renders with warnings but without crashing', () => {
    expect(() => {
      const div = document.createElement('div');
      ReactDOM.render(
        <SDKProvider sdk={new CogniteClient({ appId: 'invalid' })}>
          <MemoryRouter>
            <App />
          </MemoryRouter>
        </SDKProvider>,
        div
      );
      ReactDOM.unmountComponentAtNode(div);
    }).not.toThrow();
  });
});
