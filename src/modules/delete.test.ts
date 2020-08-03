import { Function } from 'types/Types';
import sdk from 'sdk-singleton';
import reducer, { deleteFunction } from './delete';

jest.mock('sdk-singleton', () => {
  return {
    project: 'testProject',
    post: jest.fn(),
  };
});

const mockProject = 'testProject';
const mockFunctionName = 'testFunc';
const mockFunctionId = 2;
const mockFunction = {
  fileId: 1,
  name: mockFunctionName,
  id: mockFunctionId,
} as Function;

describe('function delete module', () => {
  describe('actions', () => {
    describe('delete Function', () => {
      const store = {
        functions: {
          delete: {
            function: mockFunction,
          },
        },
      };
      it('should dispatch error actions', async () => {
        sdk.post.mockResolvedValue({ status: 500 });
        const errorStore = {
          functions: {
            delete: {
              function: mockFunction,
            },
          },
        };

        const dispatch = jest.fn().mockReturnValue(false);
        const getState = jest.fn().mockReturnValue(errorStore);
        const thunk = deleteFunction(mockFunction);
        await thunk(dispatch, getState);

        expect(dispatch).toBeCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/DELETE',
          functionToDelete: mockFunction,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: 'functions/DELETE_ERROR',
          functionToDelete: mockFunction,
        });
      });
      it('should dispatch appropriate actions', async () => {
        sdk.post.mockResolvedValue({ status: 200 });
        const dispatch = jest.fn().mockReturnValue(false);
        const getState = jest.fn().mockReturnValue(store);
        const thunk = deleteFunction(mockFunction);
        await thunk(dispatch, getState);

        expect(dispatch).toBeCalledTimes(3);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/DELETE',
          functionToDelete: mockFunction,
        });
        // 2rd call is to loadFunctions()
        expect(dispatch).toHaveBeenNthCalledWith(3, {
          type: 'functions/DELETE_DONE',
          functionToDelete: mockFunction,
        });
      });
      it('should call the datastudio api', async () => {
        sdk.post.mockResolvedValue({ status: 200 });
        sdk.post.mockClear();
        const dispatch = jest.fn().mockReturnValue(false);
        const getState = jest.fn().mockReturnValue(store);
        const thunk = deleteFunction(mockFunction);
        await thunk(dispatch, getState);

        expect(sdk.post.mock.calls.length).toBe(1);
        expect(sdk.post).toHaveBeenNthCalledWith(
          1,
          `/api/playground/projects/${mockProject}/functions/delete`,
          { data: { items: [{ id: 2 }] } }
        );
      });
    });
  });
  describe('reducer', () => {
    describe('imutability', () => {
      it('it should not mutate the old state, but return the new', () => {
        const initialState = reducer(undefined, {
          type: 'functions/DELETE',
          functionToDelete: mockFunction,
        });
        const state1 = reducer(initialState, {
          type: 'functions/DELETE_DONE',
          functionToDelete: mockFunction,
        });
        expect(initialState).not.toBe(state1);
      });
    });
  });
  describe('ACTIONS', () => {
    const initialState = reducer(undefined, { type: 'INIT' });
    describe('delete actions', () => {
      const inProgressDeleteFunctionState = {
        deleting: true,
      };
      describe('functions/DELETE', () => {
        it('should set the `deleting` flag to true', () => {
          const newState = reducer(initialState, {
            type: 'functions/DELETE',
            functionToDelete: mockFunction,
          });

          expect(newState.function).toEqual(mockFunction);
          expect(newState.deleting).toBe(true);
        });
      });
      describe('functions/DELETE_DONE', () => {
        it('should set the `deleting` flag to false', () => {
          const newState = reducer(inProgressDeleteFunctionState, {
            type: 'functions/DELETE_DONE',
            functionToDelete: mockFunction,
          });
          expect(newState.deleting).toBe(false);
        });
      });
      describe('functions/DELETE_ERROR', () => {
        it('should set the `error` flag to true', () => {
          const newState = reducer(inProgressDeleteFunctionState, {
            type: 'functions/DELETE_ERROR',
            functionToDelete: mockFunction,
          });
          expect(newState.error).toBe(true);
          expect(newState.deleting).toBe(false);
        });
      });
    });
  });
});
