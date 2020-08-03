/* eslint-disable import/first */
jest.mock('mixpanel-browser', () => {
  return {
    datastudio: {
      add_group: jest.fn(),
      identify: jest.fn(),
    },
  };
});
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import configureStore from 'redux-mock-store';
import { shallow } from 'enzyme';
import thunk from 'redux-thunk';

import App from './App';

const middlewares = [thunk]; // add your middlewares like `redux-thunk`
const mockStore = configureStore(middlewares);

jest.mock('modules/files');

const initialStoreState = {
  app: {},
  router: { location: { pathname: 'foo' } },
  login: {},
  annotations: { byAssetId: {} },
};
const store = mockStore(initialStoreState);

describe('App', () => {
  it('renders with warnings but without crashing', () => {
    expect(() => {
      const div = document.createElement('div');
      shallow(
        <Provider store={store}>
          <MemoryRouter>
            <App />
          </MemoryRouter>
        </Provider>,
        div
      );
    }).not.toThrow();
  });
});
