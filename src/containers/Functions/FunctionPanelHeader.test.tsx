import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { Function } from 'types/Types';
import { mount } from 'enzyme';
import thunk from 'redux-thunk';
import configureStore from 'redux-mock-store';
import { Button } from '@cognite/cogs.js';
import FunctionPanelHeader from './FunctionPanelHeader';

const middlewares = [thunk]; // add your middlewares like `redux-thunk`
const mockStore = configureStore(middlewares);

const mockFunctionId = 2;
const mockFunction = {
  fileId: 1,
  name: 'testFunc',
  id: mockFunctionId,
  status: 'Ready',
} as Function;
const initialStoreState = {
  app: {},
  functions: {
    call: {},
    delete: {},
    schedules: {
      list: {},
    },
  },
};
let initialStore = mockStore(initialStoreState);
let mockFunctionPanelHeader = <Provider store={initialStore} />;

describe('FunctionPanelHeader', () => {
  beforeEach(() => {
    initialStore = mockStore(initialStoreState);
    mockFunctionPanelHeader = (
      <Provider store={initialStore}>
        <MemoryRouter>
          <FunctionPanelHeader currentFunction={mockFunction} />
        </MemoryRouter>
      </Provider>
    );
  });
  it('renders without crashing', () => {
    expect(() => {
      const div = document.createElement('div');
      ReactDOM.render(mockFunctionPanelHeader, div);
      ReactDOM.unmountComponentAtNode(div);
    }).not.toThrow();
  });
  it('should contain delete button', () => {
    const wrapper = mount(mockFunctionPanelHeader);
    const deleteButton = wrapper.find(Button).at(1);
    expect(deleteButton.prop('icon')).toBe('Delete');
  });
  it('should dispatch callFunction when run button is clicked', () => {
    const wrapper = mount(mockFunctionPanelHeader);
    const runButton = wrapper.find('button.cogs-btn').at(0);
    runButton.simulate('click');
    const actions = initialStore.getActions();
    expect(actions[0]).toEqual({
      type: 'functions/SELECT_FUNCTION_TO_CALL',
      functionToCall: mockFunction,
    });
  });
  it('should disable callFunction button if status is not ready', () => {
    const mockFailedFunction = {
      fileId: 1,
      name: 'testFunc',
      id: mockFunctionId,
      status: 'Failed',
    } as Function;

    const mockFailedFunctionPanelHeader = (
      <Provider store={initialStore}>
        <MemoryRouter>
          <FunctionPanelHeader currentFunction={mockFailedFunction} />
        </MemoryRouter>
      </Provider>
    );

    const wrapper = mount(mockFailedFunctionPanelHeader);
    const runButton = wrapper.find('button.cogs-btn').at(0);
    expect(runButton.prop('disabled')).toBeTruthy();
  });
  it('should call useEffect if there was an error in deleting a function', () => {
    const deletingFunctionStoreState = {
      functions: {
        ...initialStoreState,
        delete: {
          error: true,
        },
      },
    };
    const deletingFunctionStore = mockStore(deletingFunctionStoreState);
    const useEffect = jest.spyOn(React, 'useEffect');

    mount(
      <Provider store={deletingFunctionStore}>
        <MemoryRouter>
          <FunctionPanelHeader currentFunction={mockFunction} />
        </MemoryRouter>
      </Provider>
    );
    expect(useEffect).toHaveBeenCalled();
  });
});
