import { Map } from 'immutable';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { Function, Schedule, Call } from 'types/Types';
import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import CallFunctionModal from 'components/FunctionModals/CallFunctionModal';
import UploadFunctionModal from 'components/FunctionModals/UploadFunctionModal';
import { Collapse } from 'antd';
import sdk from 'sdk-singleton';
import Functions from './Functions';

const middlewares = [thunk]; // add your middlewares like `redux-thunk`
const mockStore = configureStore(middlewares);

const mockFunctionId = 2;
const mockFunctionExternalId = 'externalid';
const mockFunction = {
  fileId: 1,
  name: 'testFunc',
  id: mockFunctionId,
  createdTime: new Date(),
  owner: 'somebody@cognite.com',
  description: 'some description',
  status: 'Ready',
  externalId: mockFunctionExternalId,
} as Function;
const mockCall = {
  id: 100,
  startTime: new Date(),
  endTime: new Date(),
  status: 'Completed',
} as Call;
const mockSchedule = {
  id: 6,
  createdTime: new Date(),
  name: 'mock schedule',
  description: 'mock Schedule description',
  functionExternalId: mockFunctionExternalId,
  cronExpression: '* * * * *',
  data: {},
} as Schedule;

sdk.get.mockReturnValue({ data: { items: {} } });
sdk.get.mockClear();
const initialStoreState = {
  functions: {
    items: {
      items: Map([[mockFunctionId, mockFunction]]),
    },
    call: {},
    delete: {},
    create: { fileInfo: {} },
    allCalls: {},
    schedules: {
      list: {
        items: {
          [mockSchedule.id]: {
            schedule: mockSchedule,
            calls: [mockCall],
          },
        },
      },
      create: {},
      delete: {},
    },
    response: {
      [mockFunctionExternalId]: {},
    },
  },
};
let initialStore = mockStore(initialStoreState);

describe('Functions', () => {
  beforeEach(() => {
    initialStore = mockStore(initialStoreState);
  });
  it('renders without crashing', () => {
    expect(() => {
      const div = document.createElement('div');
      ReactDOM.render(
        <Provider store={initialStore}>
          <MemoryRouter>
            <Functions />
          </MemoryRouter>
        </Provider>,
        div
      );
      ReactDOM.unmountComponentAtNode(div);
    }).not.toThrow();
  });
  it('should load functions upon mount', () => {
    const useEffect = jest.spyOn(React, 'useEffect');

    mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <Functions />
        </MemoryRouter>
      </Provider>
    );
    expect(useEffect).toHaveBeenCalled();
    expect(initialStore.getActions()[0]).toEqual({
      type: 'functions/RETRIEVE',
      ids: [],
    });
    expect(initialStore.getActions()).toHaveLength(4);
  });
  it('should load function calls upon mount', () => {
    const useEffect = jest.spyOn(React, 'useEffect');

    mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <Functions />
        </MemoryRouter>
      </Provider>
    );
    expect(useEffect).toHaveBeenCalled();
    expect(initialStore.getActions()).toHaveLength(4);
    expect(initialStore.getActions()[2]).toEqual({
      type: 'functions/LIST_CALLS',
      functionId: mockFunctionId,
    });
  });
  it('should load schedules upon mount', () => {
    const useEffect = jest.spyOn(React, 'useEffect');

    mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <Functions />
        </MemoryRouter>
      </Provider>
    );
    expect(useEffect).toHaveBeenCalled();
    expect(initialStore.getActions()).toHaveLength(4);
    expect(initialStore.getActions()[1]).toEqual({
      type: 'functions/SCHEDULES_LIST',
    });
  });
  it('should load schedule calls upon mount', () => {
    const useEffect = jest.spyOn(React, 'useEffect');

    mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <Functions />
        </MemoryRouter>
      </Provider>
    );
    expect(useEffect).toHaveBeenCalled();
    expect(initialStore.getActions()).toHaveLength(4);
    expect(initialStore.getActions()[3]).toEqual({
      type: 'functions/SCHEDULE_LIST_CALLS',
      schedule: mockSchedule,
    });
  });

  it('should not show any modals', () => {
    const wrapper = mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <Functions />
        </MemoryRouter>
      </Provider>
    );
    const uploadFunctionModal = wrapper.find(UploadFunctionModal);
    expect(uploadFunctionModal.prop('visible')).toBe(false);
    const callFunctionModal = wrapper.find(CallFunctionModal);
    expect(callFunctionModal.prop('visible')).toBe(false);
  });
  it('should show upload modal if that button is clicked on', () => {
    const wrapper = mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <Functions />
        </MemoryRouter>
      </Provider>
    );
    const beforeClickModal = wrapper.find(UploadFunctionModal);
    expect(beforeClickModal.prop('visible')).toBe(false);
    const uploadFunctionButton = wrapper.find('button.cogs-btn').at(0);
    uploadFunctionButton.simulate('click');
    const afterClickModal = wrapper.find(UploadFunctionModal);
    expect(afterClickModal.prop('visible')).toBe(true);
  });
  it('should show run modal if a function is selected to run', () => {
    const runFunctionStoreState = {
      ...initialStoreState,
      functions: {
        ...initialStoreState,
        call: { function: mockFunction },
        response: {},
      },
    };
    const runFunctionStore = mockStore(runFunctionStoreState);
    const wrapper = mount(
      <Provider store={runFunctionStore}>
        <MemoryRouter>
          <Functions />
        </MemoryRouter>
      </Provider>
    );
    const modal = wrapper.find(CallFunctionModal);
    expect(modal.prop('visible')).toBe(true);
  });
  it('should refresh functions when button is clicked', () => {
    const wrapper = mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <Functions />
        </MemoryRouter>
      </Provider>
    );
    const refreshButton = wrapper.find('button.cogs-btn').at(1);
    refreshButton.simulate('click');
    expect(initialStore.getActions()).toHaveLength(8);
    // first 5 are on mount
    expect(initialStore.getActions()[4]).toEqual({
      type: 'functions/RETRIEVE',
      ids: [],
    });
    expect(initialStore.getActions()[5]).toEqual({
      type: 'functions/LIST_CALLS',
      functionId: mockFunctionId,
    });
    expect(initialStore.getActions()[6]).toEqual({
      type: 'functions/SCHEDULES_LIST',
    });
    expect(initialStore.getActions()[7]).toEqual({
      type: 'functions/SCHEDULE_LIST_CALLS',
      schedule: mockSchedule,
    });
  });
  it('should update functions shown if search field is filled', () => {
    const mockFunctionId2 = 3;
    const mockFunction2 = {
      fileId: 1,
      name: 'secondFunc',
      id: mockFunctionId2,
      createdTime: new Date(),
      owner: 'somebody@cognite.com',
      description: 'some description',
      status: 'Ready',
    } as Function;
    const searchStoreState = {
      ...initialStoreState,
      functions: {
        ...initialStoreState,
        items: {
          items: Map([
            [mockFunctionId, mockFunction],
            [mockFunctionId2, mockFunction2],
          ]),
        },
      },
    };
    const searchStore = mockStore(searchStoreState);
    const wrapper = mount(
      <Provider store={searchStore}>
        <MemoryRouter>
          <Functions />
        </MemoryRouter>
      </Provider>
    );
    const functionsDisplayed = wrapper.find(Collapse.Panel);
    expect(functionsDisplayed).toHaveLength(2);
    const search = wrapper.find('input[name="filter"]');
    search.simulate('change', { target: { value: 'second' } });
    const functionsDisplayedAfterSearch = wrapper.find(Collapse.Panel);
    expect(functionsDisplayedAfterSearch).toHaveLength(1);
  });
  it('search field is case insensitive', () => {
    const mockFunctionId2 = 3;
    const mockFunction2 = {
      fileId: 1,
      name: 'secondFunc',
      id: mockFunctionId2,
      createdTime: new Date(),
      owner: 'somebody@cognite.com',
      description: 'some description',
      status: 'Ready',
    } as Function;
    const searchStoreState = {
      ...initialStoreState,
      functions: {
        ...initialStoreState,
        items: {
          items: Map([
            [mockFunctionId, mockFunction],
            [mockFunctionId2, mockFunction2],
          ]),
        },
      },
    };
    const searchStore = mockStore(searchStoreState);
    const wrapper = mount(
      <Provider store={searchStore}>
        <MemoryRouter>
          <Functions />
        </MemoryRouter>
      </Provider>
    );
    const functionsDisplayed = wrapper.find(Collapse.Panel);
    expect(functionsDisplayed).toHaveLength(2);
    const search = wrapper.find('input[name="filter"]');
    search.simulate('change', { target: { value: 'SECOND' } });
    const functionsDisplayedAfterSearch = wrapper.find(Collapse.Panel);
    expect(functionsDisplayedAfterSearch).toHaveLength(1);
  });
});
