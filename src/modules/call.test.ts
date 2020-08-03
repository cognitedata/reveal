/* eslint-disable import/first */
jest.mock('sdk-singleton', () => {
  return {
    project: 'testProject',
    get: jest.fn().mockResolvedValue({
      status: 200,
      data: {
        id: 100,
        startTime: new Date('2020-06-10T15:45:18.148Z'),
        endTime: new Date('2020-06-10T15:45:19.148Z'),
        status: 'Completed',
        response: { a: 'b' },
      },
    }),
    post: jest.fn().mockResolvedValue({
      status: 201,
      data: {
        id: 100,
        startTime: new Date('2020-06-10T15:45:18.148Z'),
        endTime: new Date('2020-06-10T15:45:19.148Z'),
        status: 'Running',
      },
    }),
  };
});

import { Function, Call } from 'types/Types';
import sdk from 'sdk-singleton';
import reducer, { callFunctionReset, callFunction } from './call';

const mockProject = 'testProject';
const mockFunctionId = 2;
const mockCallId = 100;
const mockFunction = {
  fileId: 1,
  name: 'function name',
  id: mockFunctionId,
} as Function;
const mockInput = {};
const mockCallStatus = 'Completed';
const mockCall = {
  id: mockCallId,
  startTime: new Date('2020-06-10T15:45:18.148Z'),
  endTime: new Date('2020-06-10T15:45:19.148Z'),
  status: mockCallStatus,
  response: { a: 'b' },
} as Call;
const mockCallRunningStatus = 'Running';
const mockCallCreated = {
  id: mockCallId,
  startTime: new Date('2020-06-10T15:45:18.148Z'),
  endTime: new Date('2020-06-10T15:45:19.148Z'),
  status: mockCallRunningStatus,
} as Call;
const mockErrorCall = {
  id: mockCallId,
  startTime: new Date('2020-06-10T15:45:18.148Z'),
  endTime: new Date('2020-06-10T15:45:19.148Z'),
  status: 'Failed',
  error: {
    message: 'Error Message',
    trace: 'Error Trace',
  },
} as Call;

describe('function call module', () => {
  describe('actions', () => {
    describe('callFunction', () => {
      describe('with input', () => {
        // const callApiMock = sdk.post;
        // const retrieveCallApiMock = sdk.get;
        const store = {
          functions: {
            call: {
              function: mockFunction,
              currentCallId: mockCallId,
            },
          },
        };

        it('should dispatch appropriate actions', async () => {
          const dispatch = jest.fn();
          const getState = jest.fn().mockReturnValue(store);
          const thunk = callFunction(mockFunction, mockInput);
          await thunk(dispatch, getState);
          expect(dispatch).toBeCalledTimes(6);
          expect(dispatch).toHaveBeenNthCalledWith(1, {
            type: 'functions/CALL',
            data: mockInput,
            functionToCall: mockFunction,
          });
          expect(dispatch).toHaveBeenNthCalledWith(2, {
            type: 'functions/CALL_CREATED',
            functionToCall: mockFunction,
            callId: mockCallId,
            result: mockCallCreated,
          });
          // 3rd call to update store
          expect(dispatch).toHaveBeenNthCalledWith(4, {
            type: 'functions/CALL_STATUS_UPDATED',
            functionToCall: mockFunction,
            status: mockCall.status,
            result: mockCall,
          });
          expect(dispatch).toHaveBeenNthCalledWith(5, {
            type: 'functions/CALL_DONE',
            result: mockCall,
            functionToCall: mockFunction,
          });
          // 6th call to update store
        });
        it('should call the datastudio api', async () => {
          sdk.post.mockClear();
          const dispatch = jest.fn();
          const getState = jest.fn().mockReturnValue(store);
          const thunk = callFunction(mockFunction, mockInput);
          await thunk(dispatch, getState);
          expect(sdk.post.mock.calls.length).toBe(1);
          expect(sdk.post).toHaveBeenNthCalledWith(
            1,
            `/api/playground/projects/${mockProject}/functions/${mockFunction.id}/call`,
            { data: { data: mockInput } }
          );
        });
      });
      describe('without input', () => {
        const store = {
          functions: {
            call: {
              function: mockFunction,
              currentCallId: mockCallId,
            },
          },
        };

        it('should dispatch appropriate actions', async () => {
          const dispatch = jest.fn();
          const getState = jest.fn().mockReturnValue(store);
          const thunk = callFunction(mockFunction);
          await thunk(dispatch, getState);
          expect(dispatch).toBeCalledTimes(6);
          expect(dispatch).toHaveBeenNthCalledWith(1, {
            type: 'functions/CALL',
            data: mockInput,
            functionToCall: mockFunction,
          });
          expect(dispatch).toHaveBeenNthCalledWith(2, {
            type: 'functions/CALL_CREATED',
            functionToCall: mockFunction,
            callId: mockCallId,
            result: mockCallCreated,
          });
          // 3rd call to update store
          expect(dispatch).toHaveBeenNthCalledWith(4, {
            type: 'functions/CALL_STATUS_UPDATED',
            functionToCall: mockFunction,
            status: mockCall.status,
            result: mockCall,
          });
          expect(dispatch).toHaveBeenNthCalledWith(5, {
            type: 'functions/CALL_DONE',
            result: mockCall,
            functionToCall: mockFunction,
          });
          // 6th call to update store
        });
        it('should call the datastudio api', async () => {
          sdk.post.mockClear();
          const dispatch = jest.fn();
          const getState = jest.fn().mockReturnValue(store);
          const thunk = callFunction(mockFunction);
          await thunk(dispatch, getState);
          expect(sdk.post.mock.calls.length).toBe(1);
          expect(sdk.post).toHaveBeenNthCalledWith(
            1,
            `/api/playground/projects/${mockProject}/functions/${mockFunction.id}/call`,
            { data: {} }
          );
        });
      });
    });
    describe('callFunctionReset', () => {
      it('should dispatch appropriate actions', async () => {
        const dispatch = jest.fn();
        const thunk = callFunctionReset();
        await thunk(dispatch);
        expect(dispatch).toBeCalledTimes(1);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/CALL_RESET',
        });
      });
    });
  });
  describe('reducer', () => {
    describe('imutability', () => {
      it('it should not mutate the old state, but return the new', () => {
        const initialState = reducer(undefined, {
          type: 'functions/CALL',
          data: {},
          functionToCall: mockFunction,
        });
        const state1 = reducer(initialState, {
          type: 'functions/CALL_DONE',
          result: mockCall,
          functionToCall: mockFunction,
        });
        expect(initialState).not.toBe(state1);
      });
    });
  });
  describe('ACTIONS', () => {
    const initialState = reducer(undefined, { type: 'INIT' });
    describe('call actions', () => {
      const inProgressCallFunctionState = {
        function: mockFunction,
        calling: true,
      };
      describe('functions/SELECT_FUNCTION_TO_CALL', () => {
        const newState = reducer(initialState, {
          type: 'functions/SELECT_FUNCTION_TO_CALL',
          functionToCall: mockFunction,
        });
        it('should set the `functionToCall` flag to be a function', () => {
          expect(newState.function).toBe(mockFunction);
        });
      });
      describe('functions/CALL', () => {
        const newState = reducer(initialState, {
          type: 'functions/CALL',
          data: mockInput,
          functionToCall: mockFunction,
        });
        it('should set the `creating` flag to true', () => {
          expect(newState.creating).toBe(true);
        });
        it('should set the `calling` flag to true', () => {
          expect(newState.calling).toBe(true);
        });
        it('should set the `input` flag to given input', () => {
          expect(newState.input).toBe(mockInput);
        });
      });
      describe('functions/CALL_CREATED', () => {
        const newState = reducer(initialState, {
          type: 'functions/CALL_CREATED',
          functionToCall: mockFunction,
          callId: mockCallId,
          result: mockCall,
        });
        it('should set the `creating` flag to false', () => {
          expect(newState.creating).toBe(false);
        });
        it('should set the `calling` flag to true', () => {
          expect(newState.calling).toBe(true);
        });
        it('should set the `currentCallId` flag to the appropriate callId', () => {
          expect(newState.currentCallId).toBe(mockCallId);
        });
        it('should set the `result` field to be the result of the api call', () => {
          expect(newState.result).toBe(mockCall);
        });
      });
      describe('functions/CALL_STATUS_UPDATED', () => {
        const newState = reducer(initialState, {
          type: 'functions/CALL_STATUS_UPDATED',
          functionToCall: mockFunction,
          status: mockCall.status,
          result: mockCall,
        });
        it('should set the `creating` flag to false', () => {
          expect(newState.creating).toBe(false);
        });
        it('should set the `calling` flag to true', () => {
          expect(newState.calling).toBe(true);
        });
        it('should set the `result` field to be the result of the api call', () => {
          expect(newState.result).toBe(mockCall);
        });
      });
      describe('functions/CALL_DONE', () => {
        const newState = reducer(inProgressCallFunctionState, {
          type: 'functions/CALL_DONE',
          result: mockCall,
          functionToCall: mockFunction,
        });
        it('should set the `creating` flag to false', () => {
          expect(newState.creating).toBe(false);
        });
        it('should set the `calling` flag to false', () => {
          expect(newState.calling).toBe(false);
        });
        it('should set the `result` field to be the result of the api call', () => {
          expect(newState.result).toBe(mockCall);
        });
      });
      describe('functions/CALL_ERROR', () => {
        const newState = reducer(inProgressCallFunctionState, {
          type: 'functions/CALL_ERROR',
          result: mockErrorCall,
          functionToCall: mockFunction,
        });
        it('should set the `error` flag to true', () => {
          expect(newState.error).toBe(true);
        });
        it('should set the `creating` flag to false', () => {
          expect(newState.creating).toBe(false);
        });
        it('should set the `calling` flag to false', () => {
          expect(newState.calling).toBe(false);
        });
        it('should set the `result` field to be the result of the api call', () => {
          expect(newState.result).toBe(mockErrorCall);
        });
      });
      describe('functions/CALL_RESET', () => {
        it('should reset all call fields', () => {
          const newState = reducer(inProgressCallFunctionState, {
            type: 'functions/CALL_RESET',
          });
          expect(newState).toEqual({});
        });
      });
    });
  });
});
