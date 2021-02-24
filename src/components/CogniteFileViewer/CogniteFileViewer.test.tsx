/* eslint-disable import/first */
jest.mock('sdk-singleton', () => {
  return {
    __esModule: true,
    default: {
      assets: {
        retrieve: jest.fn().mockResolvedValue([]),
      },
    },
    getAuthState: () => ({
      username: 'someone@cognite.com',
    }),
  };
});

import { Map } from 'immutable';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { mount } from 'enzyme';
import { mockStore } from 'utils/mockStore';
import { CogniteFileViewer } from './CogniteFileViewer';

describe('CogniteFileViewer', () => {
  beforeEach(() => {
    // @ts-ignore
    HTMLCanvasElement.prototype.getContext = () => {
      // return whatever getContext has to return
    };
  });

  it('Renders without crashing', () => {
    const storeState = {
      assets: {
        items: {
          items: Map(),
          getById: {},
        },
      },
      login: {
        user: 'email',
      },
      files: {
        items: {
          items: Map(),
          getById: {},
        },
      },
      fileContextualization: { similarObjectJobs: {} },
      annotations: { byFileId: {} },
    };

    // @ts-ignore
    const store = mockStore(storeState);
    expect(() => {
      mount(
        <Provider store={store}>
          <MemoryRouter>
            <CogniteFileViewer fileId={123} />
          </MemoryRouter>
        </Provider>
      );
    }).not.toThrow();
  });
});
