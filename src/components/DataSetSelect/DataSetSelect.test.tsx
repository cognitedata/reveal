import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import { Select, Popover } from 'antd';
import * as DataSetSelectors from 'modules/datasets/selectors';
import DataSetSelect from './DataSetSelect';

const initialStoreState: any = {
  datasets: {
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
        name: 'Entity Matcher Output Number 2',
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
  },
  app: {
    groups: {
      groupsAcl: ['LIST', 'READ', 'CREATE', 'UPDATE', 'DELETE'],
      datasetsAcl: ['READ', 'WRITE'],
    },
  },
};

const store = configureStore([thunk])(initialStoreState);
describe('Data set Select', () => {
  jest.spyOn(DataSetSelectors, 'dataSetCounts').mockReturnValue({
    4448195087284397: { files: 0, assets: 1 },
    4610653613010508: { files: 0, assets: 1 },
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('can select option', () => {
    // Test first render and effect
    const mockFunction = jest.fn();
    const container = mount(
      <Provider store={store}>
        <MemoryRouter>
          <DataSetSelect
            onDataSetSelected={mockFunction}
            resourceType="assets"
          />
        </MemoryRouter>
      </Provider>
    );
    const wrapper = container.find(Select);

    // Test second render and effect
    expect(container.find('li[role="option"]').length).toBe(0);

    wrapper.simulate('click');
    const options = container.find('li[role="option"]');
    expect(options.length).toBe(2);

    expect(options.at(0).text()).toEqual('Entity Matcher Output');

    options.at(0).simulate('click');
    expect(mockFunction).toBeCalled();
  });

  it('can select multiple option', () => {
    // Test first render and effect
    let selectedIds: number[] = [];
    const callback = (ids: number[]) => {
      selectedIds = ids;
    };
    const container = mount(
      <Provider store={store}>
        <MemoryRouter>
          <DataSetSelect
            multiple
            onDataSetSelected={callback}
            resourceType="assets"
          />
        </MemoryRouter>
      </Provider>
    );
    const wrapper = container.find(Select);

    // Test second render and effect
    wrapper.simulate('click');
    container.find('li[role="option"]').at(0).simulate('click');
    wrapper.simulate('click');
    container.find('li[role="option"]').at(1).simulate('click');
    expect(selectedIds.length).toEqual(2);
  });

  it('if datasetsAcl is missing', () => {
    // should be disabled
    const missingAclStore = configureStore([thunk])({
      ...initialStoreState,
      app: {
        groups: {
          groupsAcl: ['LIST', 'READ', 'CREATE', 'UPDATE', 'DELETE'],
        },
      },
    });
    // Test first render and effect
    const mockFunction = jest.fn();
    const container = mount(
      <Provider store={missingAclStore}>
        <MemoryRouter>
          <DataSetSelect
            onDataSetSelected={mockFunction}
            resourceType="assets"
          />
        </MemoryRouter>
      </Provider>
    );
    const wrapper = container.find(Select);

    // Test second render and effect
    wrapper.simulate('click');
    const options = container.find(Popover);
    expect(options.text()).toBeDefined();
  });

  it('if disabled', () => {
    const missingAclStore = configureStore([thunk])({
      ...initialStoreState,
      app: {
        groups: {
          groupsAcl: ['LIST', 'READ', 'CREATE', 'UPDATE', 'DELETE'],
          datasetsAcl: ['READ'],
        },
      },
    });
    // Test first render and effect
    const mockFunction = jest.fn();
    const container = mount(
      <Provider store={missingAclStore}>
        <MemoryRouter>
          <DataSetSelect
            disabled
            onDataSetSelected={mockFunction}
            resourceType="assets"
          />
        </MemoryRouter>
      </Provider>
    );
    expect(container.find(Popover).exists()).toEqual(false);
    expect(container.find('li[role="option"]').exists()).toEqual(false);
  });
});
