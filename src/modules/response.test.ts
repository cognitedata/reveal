/* eslint-disable import/first */
jest.mock('sdk-singleton', () => {
  return {
    get: jest.fn(),
    project: 'testProject',
  };
});

import sdk from 'sdk-singleton';
import { Function, CallResponse } from 'types/Types';
import reducer, { retrieveFunctionResponse } from './response';

const mockFunctionId = 2;
const mockCallId = 100;
const mockFunction = {
  fileId: 1,
  name: 'function name',
  id: mockFunctionId,
} as Function;
const mockResponse = {
  functionId: mockFunctionId,
  callId: mockCallId,
  response: { a: 'b' },
} as CallResponse;

describe('function response module', () => {
  describe('actions', () => {
    describe('responseFunction', () => {
      sdk.get.mockResolvedValue({ status: 200, data: mockResponse });

      const store = {
        functions: {
          response: {},
        },
      };
      it('should dispatch appropriate actions', async () => {
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = retrieveFunctionResponse(mockFunction, mockCallId);
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/RESPONSE',
          func: mockFunction,
          callId: mockCallId,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: 'functions/RESPONSE_DONE',
          result: mockResponse.response,
          callId: mockCallId,
          func: mockFunction,
        });
      });
    });
  });
  describe('reducer', () => {
    describe('imutability', () => {
      it('it should not mutate the old state, but return the new', () => {
        const initialState = reducer(undefined, {
          type: 'functions/RESPONSE',
          callId: mockCallId,
          func: mockFunction,
        });
        const state1 = reducer(initialState, {
          type: 'functions/RESPONSE_DONE',
          result: mockResponse.response,
          func: mockFunction,
          callId: mockCallId,
        });
        expect(initialState).not.toBe(state1);
      });
    });
  });
  describe('ACTIONS', () => {
    const initialState = reducer(undefined, { type: 'INIT' });
    describe('response actions', () => {
      const inProgressCallFunctionState = {};
      describe('functions/RESPONSE', () => {
        const newState = reducer(initialState, {
          type: 'functions/RESPONSE',
          callId: mockCallId,
          func: mockFunction,
        });
        it('should set the `done` flag to false', () => {
          expect(newState[mockFunction.externalId][mockCallId].done).toBe(
            false
          );
        });
        it('should set the `error` flag to false', () => {
          expect(newState[mockFunction.externalId][mockCallId].error).toBe(
            false
          );
        });
        it('should set the `response` flag to undefined', () => {
          expect(newState[mockFunction.externalId][mockCallId].response).toBe(
            undefined
          );
        });
      });
      describe('functions/RESPONSE_DONE', () => {
        const newState = reducer(inProgressCallFunctionState, {
          type: 'functions/RESPONSE_DONE',
          result: mockResponse.response,
          callId: mockCallId,
          func: mockFunction,
        });
        it('should set the `done` flag to true', () => {
          expect(newState[mockFunction.externalId][mockCallId].done).toBe(true);
        });
        it('should set the `error` flag to false', () => {
          expect(newState[mockFunction.externalId][mockCallId].error).toBe(
            false
          );
        });
        it('should set the `result` field to be the result of the api call', () => {
          expect(newState[mockFunction.externalId][mockCallId].response).toBe(
            mockResponse.response
          );
        });
      });
      describe('functions/RESPONSE_ERROR', () => {
        const newState = reducer(inProgressCallFunctionState, {
          type: 'functions/RESPONSE_ERROR',
          callId: mockCallId,
          func: mockFunction,
        });
        it('should set the `done` flag to true', () => {
          expect(newState[mockFunction.externalId][mockCallId].done).toBe(true);
        });
        it('should set the `error` flag to true', () => {
          expect(newState[mockFunction.externalId][mockCallId].error).toBe(
            true
          );
        });
        it('should set the `result` field to be what it was', () => {
          expect(newState[mockFunction.externalId][mockCallId].response).toBe(
            undefined
          );
        });
      });
    });
  });
});
