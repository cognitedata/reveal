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
import { MemoryRouter } from 'react-router';
import { shallow } from 'enzyme';

import App from './App';

describe('App', () => {
  it('renders with warnings but without crashing', () => {
    expect(() => {
      const div = document.createElement('div');
      shallow(
        <MemoryRouter>
          <App />
        </MemoryRouter>,
        div
      );
    }).not.toThrow();
  });
});
