/* eslint-disable import/first */
jest.mock('sdk-singleton', () => {
  return {
    project: 'testProject',
    post: jest.fn(),
    get: jest.fn(),
  };
});

import { Map } from 'immutable';
import { Function, Call, Log } from 'types/Types';
import sdk from 'sdk-singleton';
import reducer, {
  retrieveLogs,
  getFunctionCalls,
  getFunctionsCalls,
} from './functionCalls';

const mockProject = 'testProject';
const mockFunctionName = 'testFunc';
const mockFunctionId = 2;
const mockCallId = 100;
const mockLogs = { timestamp: new Date(5000), message: 'some logs' } as Log;
const mockFunction = {
  fileId: 1,
  name: mockFunctionName,
  id: mockFunctionId,
} as Function;
const mockCall = {
  id: mockCallId,
  startTime: new Date(),
  endTime: new Date(),
  status: 'Completed',
} as Call;

describe('functionCalls module', () => {
  describe('actions', () => {
    describe('retrieveLogs', () => {
      const store = {};
      it('should dispatch error actions', async () => {
        sdk.get.mockResolvedValue({
          status: 500,
        });
        sdk.get.mockClear();

        const errorStore = {};

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(errorStore);
        const thunk = retrieveLogs(mockFunctionId, mockCallId);
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/RETRIEVE_LOGS',
          functionId: mockFunctionId,
          callId: mockCallId,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: 'functions/RETRIEVE_LOGS_ERROR',
          functionId: mockFunctionId,
          callId: mockCallId,
        });
      });
      it('should dispatch appropriate actions', async () => {
        sdk.get.mockResolvedValue({
          status: 200,
          data: { items: [mockLogs] },
        });
        sdk.get.mockClear();
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = retrieveLogs(mockFunctionId, mockCallId);
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/RETRIEVE_LOGS',
          functionId: mockFunctionId,
          callId: mockCallId,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: 'functions/RETRIEVE_LOGS_DONE',
          functionId: mockFunctionId,
          callId: mockCallId,
          logs: [mockLogs],
        });
      });
      it('should call the datastudio api', async () => {
        sdk.get.mockResolvedValue({
          status: 200,
          data: { items: [mockLogs] },
        });
        sdk.get.mockClear();

        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = retrieveLogs(mockFunctionId, mockCallId);
        await thunk(dispatch, getState);
        expect(sdk.get.mock.calls.length).toBe(1);
        expect(sdk.get).toHaveBeenNthCalledWith(
          1,
          `/api/playground/projects/${mockProject}/functions/${mockFunctionId}/calls/${mockCallId}/logs`
        );
      });
    });
    describe('getFunctionCalls', () => {
      const store = {};
      it('should dispatch error actions', async () => {
        sdk.get.mockResolvedValue({
          status: 500,
        });
        sdk.post.mockClear();
        const errorStore = {};
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(errorStore);
        const thunk = getFunctionCalls(mockFunctionId);
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/LIST_CALLS',
          functionId: mockFunctionId,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: 'functions/LIST_CALLS_ERROR',
          functionId: mockFunctionId,
        });
      });
      it('should dispatch appropriate actions', async () => {
        sdk.get.mockResolvedValue({
          status: 200,
          data: { items: mockCall },
        });
        sdk.get.mockClear();
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = getFunctionCalls(mockFunctionId);
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/LIST_CALLS',
          functionId: mockFunctionId,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: 'functions/LIST_CALLS_DONE',
          functionId: mockFunctionId,
          calls: mockCall,
        });
      });
      it('should call the datastudio api', async () => {
        sdk.get.mockResolvedValue({
          status: 200,
          data: { items: mockCall },
        });
        sdk.get.mockClear();
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = getFunctionCalls(mockFunctionId);
        await thunk(dispatch, getState);
        expect(sdk.get.mock.calls.length).toBe(1);
        expect(sdk.get).toHaveBeenNthCalledWith(
          1,
          `/api/playground/projects/${mockProject}/functions/${mockFunctionId}/calls`
        );
      });
    });
    describe('getFunctionsCalls', () => {
      const store = {
        functions: {
          items: {
            items: Map([[mockFunctionId, mockFunction]]),
          },
        },
      };
      it('should dispatch appropriate actions', async () => {
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = getFunctionsCalls();
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(store.items.items.count()); // called getFunctionCalls()
      });
      it('should dispatch appropriate actions with input', async () => {
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = getFunctionsCalls([mockFunction]);
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(store.items.items.count()); // called getFunctionCalls()
      });
    });
  });
  describe('reducer', () => {
    describe('imutability', () => {
      it('it should not mutate the old state, but return the new', () => {
        const initialState = reducer(undefined, {
          type: 'functions/LIST_CALLS',
          functionId: mockFunctionId,
        });
        const state1 = reducer(initialState, {
          type: 'functions/LIST_CALLS_DONE',
          functionId: mockFunctionId,
          calls: [mockCall],
        });
        expect(initialState).not.toBe(state1);
      });
    });
  });
  describe('ACTIONS', () => {
    const initialState = reducer(undefined, { type: 'INIT' });
    describe('calls actions', () => {
      describe('list calls actions', () => {
        describe('functions/LIST_CALLS', () => {
          it('should set the `fetching` flag to true', () => {
            const newState = reducer(initialState, {
              type: 'functions/LIST_CALLS',
              functionId: mockFunctionId,
            });
            expect(newState[mockFunctionId].fetching).toBe(true);
          });
        });
        describe('functions/LIST_CALLS_DONE', () => {
          const newState = reducer(initialState, {
            type: 'functions/LIST_CALLS_DONE',
            functionId: mockFunctionId,
            calls: [mockCall],
          });
          it('should set the `fetching` flag to false', () => {
            expect(newState[mockFunctionId].fetching).toBe(false);
          });
          it('should set the `error` flag to false', () => {
            expect(newState[mockFunctionId].error).toBe(false);
          });
          it('should set `calls`', () => {
            expect(newState[mockFunctionId].functionCalls).toStrictEqual([
              mockCall,
            ]);
          });
        });
        describe('functions/LIST_CALLS_ERROR', () => {
          const newState = reducer(initialState, {
            type: 'functions/LIST_CALLS_ERROR',
            functionId: mockFunctionId,
          });
          it('should set the `error` flag to true', () => {
            expect(newState[mockFunctionId].error).toBe(true);
          });
          it('should set the `fetching` flag to false', () => {
            expect(newState[mockFunctionId].fetching).toBe(false);
          });
        });
      });
      describe('retrieve logs actions', () => {
        const logsState = {
          [mockFunctionId]: {
            logs: {},
          },
        };
        describe('functions/RETRIEVE_LOGS', () => {
          it('should set the `fetching` flag to true', () => {
            const newState = reducer(logsState, {
              type: 'functions/RETRIEVE_LOGS',
              functionId: mockFunctionId,
              callId: mockCallId,
            });
            expect(newState[mockFunctionId].logs![mockCallId].fetching).toBe(
              true
            );
          });
        });
        describe('functions/RETRIEVE_LOGS_DONE', () => {
          const newState = reducer(logsState, {
            type: 'functions/RETRIEVE_LOGS_DONE',
            functionId: mockFunctionId,
            callId: mockCallId,
            logs: [mockLogs],
          });
          it('should set the `fetching` flag to false', () => {
            expect(newState[mockFunctionId].logs![mockCallId].fetching).toBe(
              false
            );
          });
          it('should set the `error` flag to false', () => {
            expect(newState[mockFunctionId].logs![mockCallId].error).toBe(
              false
            );
          });
          it('should set `calls`', () => {
            expect(newState[mockFunctionId].logs![mockCallId].logs![0]).toBe(
              mockLogs
            );
          });
        });
        describe('functions/RETRIEVE_LOGS_ERROR', () => {
          const newState = reducer(logsState, {
            type: 'functions/RETRIEVE_LOGS_ERROR',
            functionId: mockFunctionId,
            callId: mockCallId,
          });
          it('should set the `fetching` flag to false', () => {
            expect(newState[mockFunctionId].logs![mockCallId].fetching).toBe(
              false
            );
          });
          it('should set the `error` flag to false', () => {
            expect(newState[mockFunctionId].logs![mockCallId].error).toBe(true);
          });
        });
      });
    });
  });
});
