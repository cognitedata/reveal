import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { Function, Schedule, Call } from 'types/Types';
import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import ViewLogsModal from 'components/FunctionModals/ViewLogsModal';
import CreateScheduleModal from 'components/FunctionModals/CreateScheduleModal';
import FunctionPanelContent from './FunctionPanelContent';

const middlewares = [thunk]; // add your middlewares like `redux-thunk`
const mockStore = configureStore(middlewares);

const mockFunctionId = 2;
const mockFunctionExternalId = 'externalId';
const mockFunction = {
  fileId: 1,
  name: 'testFunc',
  id: mockFunctionId,
  status: 'Ready',
  createdTime: new Date(),
  owner: 'somebody@cognite.com',
  description: 'some description',
  apiKey: 'key',
  externalId: mockFunctionExternalId,
  secrets: { key: 'value' },
} as Function;
const mockCallId = 100;
const mockCall = {
  id: mockCallId,
  startTime: new Date(),
  endTime: new Date(),
  status: 'Completed',
} as Call;
const mockScheduleId = 6;
const mockSchedule = {
  id: mockScheduleId,
  createdTime: new Date(),
  name: 'mock schedule',
  description: 'mock Schedule description',
  functionExternalId: mockFunctionExternalId,
  cronExpression: '* * * * *',
  data: {},
} as Schedule;
const initialStoreState = {
  functions: {
    allCalls: {
      [mockFunctionId]: {
        functionCalls: [mockCall],
      },
    },
    schedules: {
      list: {
        items: {
          [mockScheduleId]: { schedule: mockSchedule, calls: [mockCall] },
        },
      },
      create: {},
      delete: {},
    },
    response: {},
  },
};
const initialStore = mockStore(initialStoreState);
let mockFunctionPanelContent = <Provider store={initialStore} />;

describe('FunctionPanelContent', () => {
  beforeEach(() => {
    mockFunctionPanelContent = (
      <Provider store={initialStore}>
        <MemoryRouter>
          <FunctionPanelContent currentFunction={mockFunction} />
        </MemoryRouter>
      </Provider>
    );
  });

  it('renders without crashing', () => {
    expect(() => {
      const div = document.createElement('div');
      ReactDOM.render(mockFunctionPanelContent, div);
      ReactDOM.unmountComponentAtNode(div);
    }).not.toThrow();
  });
  it('Tabs to show info on calls, schedules and function details', () => {
    const wrapper = mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <FunctionPanelContent currentFunction={mockFunction} />
        </MemoryRouter>
      </Provider>
    );
    const tabs = wrapper.find('div.ant-tabs-tab');
    expect(tabs).toHaveLength(3);
    expect(tabs.at(0).text()).toBe('Calls');
    expect(tabs.at(1).text()).toContain('Schedules');
    expect(tabs.at(2).text()).toBe('Details');
  });
  it('Tabs to show info on function error info if function failed', () => {
    const mockFunctionError = {
      fileId: 1,
      name: 'testFunc',
      id: mockFunctionId,
      status: 'Failed',
      createdTime: new Date(),
      owner: 'somebody@cognite.com',
      description: 'some description',
      apiKey: 'key',
      externalId: mockFunctionExternalId,
      secrets: { key: 'value' },
      error: {
        message: 'error message',
        trace: 'error trace',
      },
    } as Function;
    const wrapper = mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <FunctionPanelContent currentFunction={mockFunctionError} />
        </MemoryRouter>
      </Provider>
    );
    const tabs = wrapper.find('div.ant-tabs-tab');
    expect(tabs).toHaveLength(4);
    expect(tabs.at(0).text()).toBe('Error Info');
    expect(tabs.at(1).text()).toBe('Calls');
    expect(tabs.at(2).text()).toContain('Schedules');
    expect(tabs.at(3).text()).toBe('Details');
  });
  it('should show view logs modal when view logs button is clicked', () => {
    const wrapper = mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <FunctionPanelContent currentFunction={mockFunction} />
        </MemoryRouter>
      </Provider>
    );
    const viewLogsButton = wrapper.find('button.cogs-btn').at(1);
    viewLogsButton.simulate('click');
    const afterClickModal = wrapper.find(ViewLogsModal);
    expect(afterClickModal.prop('visible')).toBe(true);
    expect(initialStore.getActions()[0]).toEqual({
      type: 'functions/RETRIEVE_LOGS',
      functionId: mockFunctionId,
      callId: mockCallId,
    });
  });
  it('should have delete schedule button', () => {
    const wrapper = mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <FunctionPanelContent currentFunction={mockFunction} />
        </MemoryRouter>
      </Provider>
    );
    const schedulesTab = wrapper.find('div.ant-tabs-tab').at(1);
    schedulesTab.simulate('click');
    const deleteScheduleButton = wrapper.find('button.cogs-btn').at(2);
    expect(deleteScheduleButton).toHaveLength(1);
  });
  it('should show create schedule modal when create schedule button is clicked', () => {
    const wrapper = mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <FunctionPanelContent currentFunction={mockFunction} />
        </MemoryRouter>
      </Provider>
    );
    const schedulesTab = wrapper.find('div.ant-tabs-tab').at(1);
    schedulesTab.simulate('click');
    const createScheduleButton = wrapper.find('button.cogs-btn').at(2);
    expect(createScheduleButton).toHaveLength(1);
    createScheduleButton.simulate('click');
    const afterClickModal = wrapper.find(CreateScheduleModal);
    expect(afterClickModal.prop('visible')).toBe(true);
  });
  it('should disable create schedule if function does not have an external id', () => {
    const mockFunctionNoExternalId = {
      ...mockFunction,
      externalId: '',
    } as Function;
    const wrapper = mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <FunctionPanelContent currentFunction={mockFunctionNoExternalId} />
        </MemoryRouter>
      </Provider>
    );
    const schedulesTab = wrapper.find('div.ant-tabs-tab').at(1);
    schedulesTab.simulate('click');
    const createScheduleButton = wrapper.find('button.cogs-btn').at(2);
    expect(createScheduleButton.prop('disabled')).toBeTruthy();
  });
  it('should disable create schedule if function does not have "Ready" status', () => {
    const mockFunctionIncorrectStatus = {
      ...mockFunction,
      status: 'Failed',
    } as Function;
    const wrapper = mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <FunctionPanelContent currentFunction={mockFunctionIncorrectStatus} />
        </MemoryRouter>
      </Provider>
    );
    const schedulesTab = wrapper.find('div.ant-tabs-tab').at(1);
    schedulesTab.simulate('click');
    const createScheduleButton = wrapper.find('button.cogs-btn').at(2);
    expect(createScheduleButton.prop('disabled')).toBeTruthy();
  });
});
