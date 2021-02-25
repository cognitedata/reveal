import { Map } from 'immutable';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { SearchStore } from 'modules/search';
import { DataSetStore } from 'modules/datasets';
import { mockStore } from 'utils/mockStore';
import SearchPage from '../SearchPage';
import FileSearchBar from '../FileSearchBar';

const onButtonClicked = jest.fn();

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
  } as Partial<DataSetStore>,
  files: {
    items: {
      items: Map([
        [
          4448195087284397,
          {
            id: 4448195087284397,
            name: 'Asset Select Correct',
          },
        ],
        [
          1,
          {
            id: 1,
            name: 'Test',
          },
        ],
      ]),
    },
    search: {
      '{"limit":100,"search":{},"filter":{"root":true}}': {
        fetching: false,
        error: false,
        ids: [4448195087284397],
      },
      '{"filter":{},"limit":1000}': {
        fetching: false,
        error: false,
        ids: [4448195087284397, 1],
      },
    },
    list: {
      '{"filter":{},"limit":1000,"all":false}': {
        '1/1': {
          fetching: false,
          error: false,
          done: true,
          ids: [4448195087284397, 1],
        },
      },
    },
    count: {
      '{"filter":{"mimeType":"application/pdf"}}': {
        count: 12,
      },
    },
  },
  assets: {
    items: {
      items: Map([
        [
          4448195087284397,
          {
            id: 4448195087284397,
            name: 'Asset Select Correct',
          },
        ],
        [
          1,
          {
            id: 1,
            name: 'Test',
          },
        ],
      ]),
    },
    search: {
      '{"limit":100,"search":{},"filter":{"root":true}}': {
        fetching: false,
        error: false,
        ids: [4448195087284397],
      },
      '{"limit":100,"filter":{}}': {
        fetching: false,
        error: false,
        ids: [4448195087284397, 1],
      },
    },
    list: {
      '{"filter":{},"all":false}': {
        '1/1': {
          fetching: false,
          error: false,
          ids: [4448195087284397, 1],
        },
      },
    },
    count: {
      '{"filter":{}}': {
        count: 100,
      },
    },
  },
  search: {
    assets: { filter: {} },
    files: { filter: {} },
    timeseries: { filter: {} },
  } as Partial<SearchStore>,
  app: {
    groups: {},
  },
};

const store = mockStore(initialStoreState);

describe('Search Bar', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('show all timeseries', () => {
    const container = mount(
      <Provider store={store}>
        <MemoryRouter>
          <SearchPage type="timeseries" onNextClicked={onButtonClicked} />
        </MemoryRouter>
      </Provider>
    );

    expect(container.find('#count-text').text()).toContain('12 results.');
    expect(container.find('#count-text').text()).toContain('0 selected.');
    expect(
      container.find('.ant-table-row.ant-table-row-level-0 td').at(1).text()
    ).toContain('TS');

    // rendered correct search bar
    container.find(FileSearchBar).exists();
  });

  it('show all files', () => {
    const container = mount(
      <Provider store={store}>
        <MemoryRouter>
          <SearchPage
            type="files"
            defaultFilters={{
              files: {
                filter: {
                  mimeType: 'application/pdf',
                },
              },
            }}
            onNextClicked={onButtonClicked}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(container.find('#count-text').text()).toContain('12 results.');
    expect(container.find('#count-text').text()).toContain('0 selected.');

    // rendered correct search bar
    container.find(FileSearchBar).exists();
  });

  it('can select all, and deselect is disabled', () => {
    const container = mount(
      <Provider store={store}>
        <MemoryRouter>
          <SearchPage type="assets" onNextClicked={onButtonClicked} />
        </MemoryRouter>
      </Provider>
    );

    expect(container.find('#count-text').text()).toContain('100 results.');
    expect(container.find('#count-text').text()).toContain('0 selected.');

    // select all
    container
      .find('.ant-table-header-column input.ant-checkbox-input')
      .first()
      .simulate('change', { target: { checked: true } });

    expect(container.find('#count-text').text()).toContain('100 results.');
    expect(container.find('#count-text').text()).toContain('100 selected.');

    // make sure the options are disabled
    expect(container.find('.ant-checkbox-disabled').length).toEqual(2);
  });

  it('disable select all when querying', () => {
    const newStore = mockStore({
      ...initialStoreState,
      search: {
        assets: { filter: {} },
        files: { filter: {}, search: { name: '123' } },
      } as Partial<SearchStore>,
    });
    const container = mount(
      <Provider store={newStore}>
        <MemoryRouter>
          <SearchPage
            type="files"
            defaultFilters={{
              files: {
                filter: {
                  mimeType: 'application/pdf',
                },
              },
            }}
            onNextClicked={onButtonClicked}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(container.find('#count-text').text()).toContain('12 results.');
    expect(container.find('#count-text').text()).toContain('0 selected.');

    // make sure the options are disabled
    expect(container.find('.cogs-btn[disabled]').length).toBeGreaterThan(0);
  });

  it('can select one and deselect', () => {
    const container = mount(
      <Provider store={store}>
        <MemoryRouter>
          <SearchPage type="assets" onNextClicked={onButtonClicked} />
        </MemoryRouter>
      </Provider>
    );

    expect(
      container.find('.ant-table-row input.ant-checkbox-input').length
    ).toEqual(2);

    expect(container.find('#count-text').text()).toContain('0 selected.');

    // select 1 option
    container
      .find('.ant-table-row input.ant-checkbox-input')
      .first()
      .simulate('change', { target: { checked: true } });

    expect(container.find('#count-text').text()).toContain('1 selected.');

    // deselect 1 option
    container
      .find('.ant-table-row input.ant-checkbox-input')
      .first()
      .simulate('change', { target: { checked: false } });

    expect(container.find('#count-text').text()).toContain('0 selected.');
  });

  it('can change page size', () => {
    const container = mount(
      <Provider store={store}>
        <MemoryRouter>
          <SearchPage type="assets" onNextClicked={onButtonClicked} />
        </MemoryRouter>
      </Provider>
    );

    container
      .find('.ant-select-selection.ant-select-selection--single')
      .last()
      .simulate('click');

    // select 1 option
    container
      .find('li.ant-select-dropdown-menu-item')
      .first()
      .simulate('click');

    expect(
      container.find('.ant-select-selection-selected-value').text()
    ).toContain('10');
  });
});
