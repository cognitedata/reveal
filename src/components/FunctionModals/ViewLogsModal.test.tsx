import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { mount, shallow } from 'enzyme';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Call, Log } from 'types';
import ViewLogsModal, { stuffForUnitTests } from './ViewLogsModal';

const middlewares = [thunk]; // add your middlewares like `redux-thunk`
const mockStore = configureStore(middlewares);

const mockFunctionId = 2;
const mockCallId = 100;
const mockCall = {
  id: mockCallId,
  startTime: new Date(),
  endTime: new Date(),
  status: 'Completed',
} as Call;
const mockLogs = [
  {
    timestamp: new Date(1585350276000),
    message: 'Did do another fancy thing',
  } as Log,
];
const initialStoreState = {
  app: {},
  functions: {
    allCalls: {
      [mockFunctionId]: {
        logs: { [mockCallId]: { logs: mockLogs } },
      },
    },
  },
};
const initialStore = mockStore(initialStoreState);

describe('ViewLogsModal', () => {
  const { titleText, fetchingIcon, errorIcon } = stuffForUnitTests;
  it('renders without crashing', () => {
    expect(() => {
      const div = document.createElement('div');
      ReactDOM.render(
        <Provider store={initialStore}>
          <MemoryRouter>
            <ViewLogsModal
              visible
              onCancel={jest.fn()}
              functionId={mockFunctionId}
              call={mockCall}
            />
          </MemoryRouter>
        </Provider>,
        div
      );
      ReactDOM.unmountComponentAtNode(div);
    }).not.toThrow();
  });
  it('should be visible based on input', () => {
    const wrapperWithVisibleModal = shallow(
      <Provider store={initialStore}>
        <MemoryRouter>
          <ViewLogsModal
            visible
            onCancel={jest.fn()}
            functionId={mockFunctionId}
            call={mockCall}
          />
        </MemoryRouter>
      </Provider>
    );
    const viewLogsModal = wrapperWithVisibleModal.find(ViewLogsModal);
    expect(viewLogsModal.prop('visible')).toBe(true);
  });
  it('should be invisible based on input', () => {
    const wrapperWithoutVisibleModal = shallow(
      <Provider store={initialStore}>
        <MemoryRouter>
          <ViewLogsModal
            visible={false}
            onCancel={jest.fn()}
            functionId={mockFunctionId}
            call={mockCall}
          />
        </MemoryRouter>
      </Provider>
    );
    const viewLogsModal = wrapperWithoutVisibleModal.find(ViewLogsModal);
    expect(viewLogsModal.prop('visible')).toBe(false);
  });
  it('should have a card inside the modal', () => {
    const wrapper = mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <ViewLogsModal
            visible
            onCancel={jest.fn()}
            functionId={mockFunctionId}
            call={mockCall}
          />
        </MemoryRouter>
      </Provider>
    );
    const modal = wrapper.find('div.ant-modal');
    expect(modal.find('div.ant-card')).toHaveLength(1);
  });
  it('displays a normal title', () => {
    const wrapper = mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <ViewLogsModal
            visible
            onCancel={jest.fn()}
            functionId={mockFunctionId}
            call={mockCall}
          />
        </MemoryRouter>
      </Provider>
    );
    const title = wrapper.find('div.ant-card-head-title');
    expect(title.text()).toBe(titleText);
  });
  it('displays a title with loading icon if fetching is set', () => {
    const fetchingStoreState = {
      app: {},
      functions: {
        allCalls: {
          [mockFunctionId]: {
            logs: { [mockCallId]: { fetching: true } },
          },
        },
      },
    };
    const fetchingStore = mockStore(fetchingStoreState);

    const wrapper = mount(
      <Provider store={fetchingStore}>
        <MemoryRouter>
          <ViewLogsModal
            visible
            onCancel={jest.fn()}
            functionId={mockFunctionId}
            call={mockCall}
          />
        </MemoryRouter>
      </Provider>
    );
    const title = wrapper.find('div.ant-card-head-title');
    expect(title.text()).toBe(titleText);
    expect(title.contains(fetchingIcon)).toBe(true);
  });
  it('displays text if fetching is set', () => {
    const fetchingStoreState = {
      app: {},
      functions: {
        allCalls: {
          [mockFunctionId]: {
            logs: { [mockCallId]: { fetching: true } },
          },
        },
      },
    };
    const fetchingStore = mockStore(fetchingStoreState);

    const wrapper = mount(
      <Provider store={fetchingStore}>
        <MemoryRouter>
          <ViewLogsModal
            visible
            onCancel={jest.fn()}
            functionId={mockFunctionId}
            call={mockCall}
          />
        </MemoryRouter>
      </Provider>
    );
    const title = wrapper.find('div.ant-card-body');
    expect(title.text()).toBeTruthy();
  });
  it('displays a title with error icon if error is set', () => {
    const errorStoreState = {
      app: {},
      functions: {
        allCalls: {
          [mockFunctionId]: {
            logs: { [mockCallId]: { error: true } },
          },
        },
      },
    };
    const errorStore = mockStore(errorStoreState);

    const wrapper = mount(
      <Provider store={errorStore}>
        <MemoryRouter>
          <ViewLogsModal
            visible
            onCancel={jest.fn()}
            functionId={mockFunctionId}
            call={mockCall}
          />
        </MemoryRouter>
      </Provider>
    );
    const title = wrapper.find('div.ant-card-head-title');
    expect(title.text()).toBe(titleText);
    expect(title.contains(errorIcon)).toBe(true);
  });
  it('displays text if error is set', () => {
    const errorStoreState = {
      app: {},
      functions: {
        allCalls: {
          [mockFunctionId]: {
            logs: { [mockCallId]: { error: true } },
          },
        },
      },
    };
    const errorStore = mockStore(errorStoreState);

    const wrapper = mount(
      <Provider store={errorStore}>
        <MemoryRouter>
          <ViewLogsModal
            visible
            onCancel={jest.fn()}
            functionId={mockFunctionId}
            call={mockCall}
          />
        </MemoryRouter>
      </Provider>
    );
    const title = wrapper.find('div.ant-card-body');
    expect(title.text()).toBeTruthy();
  });
  it('displays logs', () => {
    const wrapper = mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <ViewLogsModal
            visible
            onCancel={jest.fn()}
            functionId={mockFunctionId}
            call={mockCall}
          />
        </MemoryRouter>
      </Provider>
    );
    const result = wrapper.find('div.ant-card-body');
    expect(result.text()).toBeTruthy();
    expect(result.text()).toContain(mockLogs[0].message);
  });
  it('should call onCancel when button is clicked', () => {
    const cancelFunc = jest.fn();
    const wrapper = mount(
      <Provider store={initialStore}>
        <MemoryRouter>
          <ViewLogsModal
            visible
            onCancel={cancelFunc}
            functionId={mockFunctionId}
            call={mockCall}
          />
        </MemoryRouter>
      </Provider>
    );

    const b = wrapper.find('button.ant-modal-close');
    b.simulate('click');
    expect(cancelFunc).toBeCalledTimes(1);
  });
});
