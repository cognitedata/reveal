import { Map } from 'immutable';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { SearchStore } from 'modules/search';
import * as DataSetModule from 'modules/datasets';
import { mockStore } from 'utils/mockStore';
import TimeseriesSearchBar from '../TimeseriesSearchBar';

jest.mock('utils/Metrics');

const initialStoreState: any = {
  dataSets: {
    items: {
      4448195087284397: {
        externalId: '693ad162-df1f-408b-87c7-e0ffdaa5e7cf',
        name: 'Entity Matcher Output',
        description: 'Made in Data Studio 693ad162-df1f-408b-87c7-e0ffdaa5e7cf',
        metadata: {
          COGNITE__SOURCE: 'data-studio',
        },
        writeProtected: false,
        id: 4448195087284397,
        createdTime: 1576745394155,
        lastUpdatedTime: 1576745394155,
      },
      4610653613010508: {
        externalId: '4223e48f-57f7-4823-aec1-9a6647512101',
        name: 'Entity Matcher Output',
        description: 'Made in Data Studio 4223e48f-57f7-4823-aec1-9a6647512101',
        metadata: {
          COGNITE__SOURCE: 'data-studio',
        },
        writeProtected: false,
        id: 4610653613010508,
        createdTime: 1576745154021,
        lastUpdatedTime: 1576745154021,
      },
    },
  } as Partial<DataSetModule.DataSetStore>,
  assets: {
    items: Map([
      [
        4448195087284397,
        {
          item: {
            id: 4448195087284397,
            name: 'Asset Select Correct',
          },
        },
      ],
    ]),
    search: {
      '{"limit":100,"search":{},"filter":{"root":true}}': {
        fetching: false,
        error: false,
        ids: [4448195087284397],
      },
    },
    count: jest.fn().mockReturnValue(2),
  },
  search: {
    timeseries: {
      filter: {},
    },
  } as Partial<SearchStore>,
  app: {
    groups: {
      groupsAcl: ['LIST', 'READ', 'CREATE', 'UPDATE', 'DELETE'],
      datasetsAcl: ['READ', 'WRITE'],
      eventsAcl: ['READ', 'WRITE'],
      filesAcl: ['READ', 'WRITE'],
    },
  },
  timeseries: {
    count: jest.fn().mockReturnValue(1),
  },
  files: {
    count: jest.fn().mockReturnValue(1),
  },
};

const store = mockStore(initialStoreState);

describe('Timeseries Search Bar', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  jest.spyOn(DataSetModule, 'dataSetCounts').mockReturnValue({
    4448195087284397: { timeseries: 1, files: 0, assets: 0 },
    4610653613010508: { timeseries: 1, files: 0, assets: 0 },
  });

  it('simple search', () => {
    const updateFilter = jest.fn();
    const container = mount(
      <Provider store={store}>
        <MemoryRouter>
          <TimeseriesSearchBar
            filter={{ filter: {} }}
            updateFilter={updateFilter}
          />
        </MemoryRouter>
      </Provider>
    );

    container
      .find('input')
      .last()
      .simulate('change', { target: { value: 'Hello' } });

    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toHaveBeenCalledWith({
      filter: {},
      search: { query: 'Hello' },
    });
  });
});
