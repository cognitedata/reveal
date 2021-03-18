import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import * as DataSetSelectors from 'modules/datasets/selectors';
import { mockStore } from 'utils/mockStore';
import AssetSelect from 'components/AssetSelect';
import AssetSearchBar from '../AssetSearchBar';

const initialStoreState: any = {
  datasets: {
    items: {
      1444819508728439: {
        externalId: '693ad162-df1f-408b-87c7-e0ffdaa5e7cf',
        name: 'Entity Matcher Output',
        description: 'Made in Data Studio 693ad162-df1f-408b-87c7-e0ffdaa5e7cf',
        metadata: {
          COGNITE__SOURCE: 'data-studio',
        },
        writeProtected: false,
        id: 1444819508728439,
        createdTime: 1576745394155,
        lastUpdatedTime: 1576745394155,
      },
      1461065361301050: {
        externalId: '4223e48f-57f7-4823-aec1-9a6647512101',
        name: 'Entity Matcher Output',
        description: 'Made in Data Studio 4223e48f-57f7-4823-aec1-9a6647512101',
        metadata: {
          COGNITE__SOURCE: 'data-studio',
        },
        writeProtected: false,
        id: 1461065361301050,
        createdTime: 1576745154021,
        lastUpdatedTime: 1576745154021,
      },
    },
  },
  assets: {
    items: {
      list: {
        4448195087284397: {
          id: 4448195087284397,
          name: 'Asset Select Correct',
        },
      },
    },
    search: {
      '{"limit":100,"search":{},"filter":{"root":true}}': {
        fetching: false,
        error: false,
        ids: [4448195087284397],
      },
    },
    count: jest.fn().mockReturnValue(1),
  },
  search: {
    assets: {
      filter: {},
    },
  },
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

describe('Asset Search Bar', () => {
  jest.spyOn(DataSetSelectors, 'dataSetCounts').mockReturnValue({
    1444819508728439: { files: 0, assets: 1 },
    1461065361301050: { files: 0, assets: 1 },
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('simple search', () => {
    const updateFilter = jest.fn();

    const container = mount(
      <Provider store={store}>
        <MemoryRouter>
          <AssetSearchBar
            filter={{ filter: {}, search: undefined }}
            updateFilter={updateFilter}
          />
        </MemoryRouter>
      </Provider>
    );

    container
      .find('input')
      .at(1)
      .simulate('change', { target: { value: 'Hello' } });

    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toBeCalledWith({
      filter: {},
      search: { query: 'Hello' },
    });
  });

  it('source filter', () => {
    const updateFilter = jest.fn();

    const container = mount(
      <Provider store={store}>
        <MemoryRouter>
          <AssetSearchBar filter={{ filter: {} }} updateFilter={updateFilter} />
        </MemoryRouter>
      </Provider>
    );

    container
      .find('input#source')
      .last()
      .simulate('change', { target: { value: 'Hello' } });

    expect(updateFilter).toHaveBeenCalledTimes(1);
    expect(updateFilter).toBeCalledWith({ filter: { source: 'Hello' } });
  });

  it('assetId filter', () => {
    const updateFilter = jest.fn();
    const container = mount(
      <Provider store={store}>
        <MemoryRouter>
          <AssetSearchBar filter={{ filter: {} }} updateFilter={updateFilter} />
        </MemoryRouter>
      </Provider>
    );

    container.find(AssetSelect).simulate('click');

    container.find('.ant-select-dropdown-menu-item').first().simulate('click');

    expect(container.find(AssetSelect).text()).toContain(
      'Asset Select Correct'
    );
  });
});
