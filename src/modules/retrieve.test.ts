/* eslint-disable import/first */
jest.mock('sdk-singleton', () => {
  return {
    project: 'testProject',
    post: jest.fn(),
    get: jest.fn(),
  };
});

import { Map } from 'immutable';
import { Function, Call } from 'types/Types';
import sdk from 'sdk-singleton';
import reducer, {
  retrieve,
  functionsSortedRecentlyCreated,
  functionsSortedLastCallSelector,
} from './retrieve';

const mockProject = 'testProject';
const mockFunctionName = 'testFunc';
const mockFunctionId = 2;
const mockFunction = {
  fileId: 1,
  name: mockFunctionName,
  id: mockFunctionId,
  createdTime: new Date(1),
} as Function;
const mockFunctionId2 = 3;
const mockFunction2 = {
  fileId: 5,
  name: `${mockFunctionName}2`,
  id: mockFunctionId2,
  createdTime: new Date(2),
} as Function;

describe('functions retrieve module', () => {
  describe('actions', () => {
    describe('retrieve', () => {
      const store = {
        functions: { items: { items: Map() } },
      };

      it('should call sdk', async () => {
        sdk.get.mockResolvedValue({
          status: 200,
          data: { items: [mockFunction] },
        });
        sdk.get.mockClear();
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = retrieve([], true);
        await thunk(dispatch, getState);
        expect(sdk.get.mock.calls.length).toBe(1);
        expect(sdk.get).toHaveBeenNthCalledWith(
          1,
          `/api/playground/projects/${mockProject}/functions`
        );
      });
    });
  });
  describe('reducer', () => {
    describe('actions', () => {
      const initialState = reducer(undefined, { type: 'INIT' });
      describe('UPDATE_ITEMS', () => {
        const action = {
          type: 'functions/UPDATE_ITEMS',
          result: [mockFunction],
        };
        it('should add functions to the items part of the store ', () => {
          expect(reducer(initialState, action)).toEqual({
            items: Map([[mockFunctionId, mockFunction]]),
            getByExternalId: {},
            getById: {},
            update: {},
          });
        });

        it('should not merge old and new assets', () => {
          const state1 = reducer(initialState, action);
          const state2 = reducer(state1, {
            ...action,
            result: [mockFunction2],
          });
          expect(state2).not.toEqual({
            items: {
              [mockFunctionId]: mockFunction,
              [mockFunctionId2]: mockFunction2,
            },
            getByExternalId: {},
            getById: {},
            update: {},
          });
          expect(state2).toEqual({
            items: Map([[mockFunctionId2, mockFunction2]]),
            getByExternalId: {},
            getById: {},
            update: {},
          });
        });
      });
    });
  });

  describe('selectors', () => {
    describe('functionsSortedRecentlyCreated', () => {
      it('it should return an array of functions sorted by createdTime', () => {
        expect(
          functionsSortedRecentlyCreated({
            functions: {
              items: {
                items: Map([
                  [mockFunctionId, mockFunction],
                  [mockFunctionId2, mockFunction2],
                ]),
              },
            },
          })
        ).toEqual([mockFunction2, mockFunction]);
      });
    });
    describe('functionsSortedLastCallSelector', () => {
      it('it should return an array of functions sorted by its last call', () => {
        expect(
          functionsSortedLastCallSelector({
            functions: {
              items: {
                items: Map([
                  [mockFunctionId, mockFunction],
                  [mockFunctionId2, mockFunction2],
                ]),
              },
              allCalls: {
                [mockFunctionId]: {
                  functionCalls: [
                    {
                      id: 10,
                      startTime: new Date(1),
                      endTime: new Date(),
                      status: 'Completed',
                    } as Call,
                  ],
                  logs: {},
                },
                [mockFunctionId2]: {
                  functionCalls: [
                    {
                      id: 11,
                      startTime: new Date(2),
                      endTime: new Date(),
                      status: 'Completed',
                    } as Call,
                  ],
                  logs: {},
                },
              },
            },
          })
        ).toEqual([mockFunction2, mockFunction]);
      });
    });
  });
});
