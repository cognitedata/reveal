import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { Function, Call, Error } from 'types/Types';
import { mount, shallow } from 'enzyme';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Button } from '@cognite/cogs.js';
import CallFunctionModal, { stuffForUnitTests } from './CallFunctionModal';

const middlewares = [thunk]; // add your middlewares like `redux-thunk`
const mockStore = configureStore(middlewares);

const mockFunction = {
  fileId: 1,
  name: 'testFunc',
  id: 2,
} as Function;
const mockSimpleResult = {
  id: 1,
  startTime: new Date(),
  endTime: new Date(),
  status: 'Completed',
} as Call;

const initialStoreState = {
  app: {},
  functions: {
    call: {
      function: mockFunction,
      result: mockSimpleResult,
    },
    response: {
      [mockFunction.externalId]: {
        [mockSimpleResult.id]: {
          response: { a: 'b' },
          done: true,
          error: false,
        },
      },
    },
  },
};
let initialStore = mockStore(initialStoreState);

describe('CallFunctionModal', () => {
  beforeEach(() => {
    initialStore = mockStore(initialStoreState);
  });
  describe('component', () => {
    it('renders without crashing', () => {
      expect(() => {
        const div = document.createElement('div');
        ReactDOM.render(
          <Provider store={initialStore}>
            <MemoryRouter>
              <CallFunctionModal visible />
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
            <CallFunctionModal visible />
          </MemoryRouter>
        </Provider>
      );
      const callFunctionModal = wrapperWithVisibleModal.find(CallFunctionModal);
      expect(callFunctionModal.prop('visible')).toBe(true);
    });
    it('should be invisible based on input', () => {
      const wrapperWithoutVisibleModal = shallow(
        <Provider store={initialStore}>
          <MemoryRouter>
            <CallFunctionModal visible={false} />
          </MemoryRouter>
        </Provider>
      );
      const callFunctionModal = wrapperWithoutVisibleModal.find(
        CallFunctionModal
      );
      expect(callFunctionModal.prop('visible')).toBe(false);
    });
    it('should have a card inside the modal', () => {
      const wrapper = mount(
        <Provider store={initialStore}>
          <MemoryRouter>
            <CallFunctionModal visible />
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
            <CallFunctionModal visible />
          </MemoryRouter>
        </Provider>
      );
      const title = wrapper.find('div.ant-card-head-title');
      expect(title.text()).toBeTruthy();
    });
    it('displays result if call status is completed but there is no response', () => {
      const mockCompletedResult = {
        id: 1,
        startTime: new Date(),
        endTime: new Date(),
        status: 'Completed',
      } as Call;

      const completedStoreState = {
        app: {},
        functions: {
          call: {
            function: mockFunction,
            result: mockCompletedResult,
          },
          delete: {},
          newFunction: {},
          response: {},
        },
      };
      const completedStore = mockStore(completedStoreState);

      const wrapper = mount(
        <Provider store={completedStore}>
          <MemoryRouter>
            <CallFunctionModal visible />
          </MemoryRouter>
        </Provider>
      );
      const result = wrapper.find('div.ant-card-body');
      expect(result.text()).toBeTruthy();
    });
    it('displays error if call status is Failed', () => {
      const mockFaileddResult = {
        id: 1,
        startTime: new Date(),
        endTime: new Date(),
        status: 'Failed',
        error: { trace: 'trace', message: 'Error' } as Error,
      } as Call;

      const failedStoreState = {
        app: {},
        functions: {
          call: {
            function: mockFunction,
            result: mockFaileddResult,
          },
          delete: {},
          newFunction: {},
          response: {},
        },
      };
      const failedStore = mockStore(failedStoreState);
      const wrapper = mount(
        <Provider store={failedStore}>
          <MemoryRouter>
            <CallFunctionModal visible />
          </MemoryRouter>
        </Provider>
      );
      const result = wrapper.find('div.ant-card-body');
      expect(result.text()).toContain(mockFaileddResult.error?.message);
      expect(result.text()).toContain(mockFaileddResult.error?.trace);
    });
    it('displays result if call status is Failed without error message', () => {
      const mockFaileddResult = {
        id: 1,
        startTime: new Date(),
        endTime: new Date(),
        status: 'Failed',
      } as Call;

      const failedStoreState = {
        app: {},
        functions: {
          call: {
            function: mockFunction,
            result: mockFaileddResult,
          },
          delete: {},
          newFunction: {},
          response: {},
        },
      };
      const failedStore = mockStore(failedStoreState);
      const wrapper = mount(
        <Provider store={failedStore}>
          <MemoryRouter>
            <CallFunctionModal visible />
          </MemoryRouter>
        </Provider>
      );
      const result = wrapper.find('div.ant-card-body');
      expect(result.text()).toBeTruthy();
    });
    it('displays result if call status is Timeout', () => {
      const mockTimeoutResult = {
        id: 1,
        startTime: new Date(),
        endTime: new Date(),
        status: 'Timeout',
      } as Call;

      const timeoutStoreState = {
        app: {},
        functions: {
          call: {
            function: mockFunction,
            result: mockTimeoutResult,
          },
          delete: {},
          newFunction: {},
          response: {},
        },
      };
      const timoeutStore = mockStore(timeoutStoreState);
      const wrapper = mount(
        <Provider store={timoeutStore}>
          <MemoryRouter>
            <CallFunctionModal visible />
          </MemoryRouter>
        </Provider>
      );
      const result = wrapper.find('div.ant-card-body');
      expect(result.text()).toBeTruthy();
    });
    it('should call dispatch callFunctionReset when button is clicked', () => {
      const wrapper = mount(
        <Provider store={initialStore}>
          <MemoryRouter>
            <CallFunctionModal visible />
          </MemoryRouter>
        </Provider>
      );

      const b = wrapper.find('button.ant-modal-close');
      b.simulate('click');
      expect(initialStore.getActions()).toHaveLength(1);
      expect(initialStore.getActions()[0]).toEqual({
        type: 'functions/CALL_RESET',
      });
    });
    it('should disable call buttons if input is not valid', () => {
      const wrapper = mount(
        <Provider store={initialStore}>
          <MemoryRouter>
            <CallFunctionModal visible />
          </MemoryRouter>
        </Provider>
      );

      const input = wrapper.find('textarea.ant-input');
      input.simulate('change', { target: { value: '{1}' } });
      const callButton = wrapper.find(Button).at(0);
      expect(callButton.prop('disabled')).toBeTruthy();
    });
    it('should not disable call buttons if input is valid', () => {
      const wrapper = mount(
        <Provider store={initialStore}>
          <MemoryRouter>
            <CallFunctionModal visible />
          </MemoryRouter>
        </Provider>
      );
      // empty input
      const callButton = wrapper.find(Button).at(0);
      expect(callButton.prop('disabled')).toBeFalsy();

      // real input
      const input = wrapper.find('textarea.ant-input');
      input.simulate('change', { target: { value: '{"key": "value"}' } });
      expect(callButton.prop('disabled')).toBeFalsy();
    });
    it('should do call function if button is clicked', () => {
      const wrapper = mount(
        <Provider store={initialStore}>
          <MemoryRouter>
            <CallFunctionModal visible />
          </MemoryRouter>
        </Provider>
      );

      const callButton = wrapper.find(Button).at(0);
      callButton.simulate('click');
      expect(initialStore.getActions()).toHaveLength(3);
      expect(initialStore.getActions()[0]).toEqual({
        type: 'functions/CALL',
        data: {},
        functionToCall: mockFunction,
      });
      expect(initialStore.getActions()[2]).toEqual({
        type: 'functions/LIST_CALLS',
        functionId: mockFunction.id,
      });
    });
    it('should include run status', () => {
      const wrapper = mount(
        <Provider store={initialStore}>
          <MemoryRouter>
            <CallFunctionModal visible />
          </MemoryRouter>
        </Provider>
      );

      expect(wrapper.text()).toContain('Call Status');
      expect(wrapper.text()).toContain(mockSimpleResult.status);
    });
  });
  describe('valid input', () => {
    describe('data', () => {
      const { canParseInputData } = stuffForUnitTests;
      it('invalid if not properly formatted JSON object', () => {
        const inValidDataArray = '[]';
        expect(canParseInputData(inValidDataArray)).toBeFalsy();
        const invalidDataNumber = '1';
        expect(canParseInputData(invalidDataNumber)).toBeFalsy();
        const inValidDataString = 'a';
        expect(canParseInputData(inValidDataString)).toBeFalsy();
        const inValidDataBadObject = '{a}';
        expect(canParseInputData(inValidDataBadObject)).toBeFalsy();
      });
      it('valid if empty input', () => {
        const validData = '';
        expect(canParseInputData(validData)).toBeTruthy();
      });
      it('valid examples', () => {
        const validDataEmpty = '{}';
        expect(canParseInputData(validDataEmpty)).toBeTruthy();
        const validData = '{"a": 1}';
        expect(canParseInputData(validData)).toBeTruthy();
      });
    });
  });
});
