/* eslint-disable import/first */
jest.mock('sdk-singleton', () => {
  return {
    project: 'testProject',
    post: jest.fn(),
    get: jest.fn(),
  };
});

import { Schedule } from 'types/Types';
import sdk from 'sdk-singleton';
import reducer, {
  loadSchedules,
  createSchedule,
  createScheduleReset,
  deleteSchedule,
} from './schedules';

const mockProject = 'testProject';
const mockExternalId = 'testFunc';
const mockScheduleId = 6;
const mockScheduleName = 'mock schedule';
const mockScheduleDescription = 'mock Schedule description';
const mockScheduleCronExpression = '* * * * *';
const mockScheduleData = { key: 'value' };
const mockSchedule = {
  id: mockScheduleId,
  createdTime: new Date(),
  name: mockScheduleName,
  description: mockScheduleDescription,
  functionExternalId: mockExternalId,
  cronExpression: mockScheduleCronExpression,
  data: mockScheduleData,
} as Schedule;
const mockErrorMessage = 'mock error message';

describe('functions schedule module', () => {
  describe('actions', () => {
    describe('loadSchedules', () => {
      sdk.get.mockResolvedValue({
        status: 200,
        data: { items: [mockSchedule] },
      });
      sdk.get.mockClear();
      const store = {};
      it('should dispatch appropriate actions', async () => {
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = loadSchedules();
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/SCHEDULES_LIST',
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: 'functions/SCHEDULES_LIST_DONE',
          schedules: [mockSchedule],
        });
      });
      it('should call the datastudio api', async () => {
        sdk.get.mockResolvedValue({
          status: 200,
          data: { items: [mockSchedule] },
        });
        sdk.get.mockClear();
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = loadSchedules();
        await thunk(dispatch, getState);
        expect(sdk.get.mock.calls.length).toBe(1);
        expect(sdk.get).toHaveBeenNthCalledWith(
          1,
          `/api/playground/projects/${mockProject}/functions/schedules`
        );
      });
    });
    // todo loadScheduleCalls
    // todo getSchedulesCalls
    describe('createSchedule', () => {
      sdk.post.mockResolvedValue({
        status: 201,
      });
      sdk.post.mockClear();
      it('should thorw an error if there is no externalId set', async () => {
        const store = {};
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = createSchedule(
          mockScheduleName,
          mockScheduleDescription,
          mockScheduleCronExpression,
          mockScheduleData,
          ''
        );
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(1);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/SCHEDULE_CREATE_ERROR',
          scheduleName: mockScheduleName,
          functionExternalId: '',
          errorMessage: 'The function does not have an external id',
        });
      });
      it('should throw an error if there there is an error with the API call', async () => {
        sdk.post.mockResolvedValue({
          status: 500,
        });
        sdk.post.mockClear();
        const store = {};
        const dispatch = jest.fn().mockReturnValue(true);
        const getState = jest.fn().mockReturnValue(store);
        const thunk = createSchedule(
          mockScheduleName,
          mockScheduleDescription,
          mockScheduleCronExpression,
          mockScheduleData,
          mockExternalId
        );
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(2);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/SCHEDULE_CREATE',
          scheduleName: mockScheduleName,
          description: mockScheduleDescription,
          cronExpression: mockScheduleCronExpression,
          data: mockScheduleData,
          functionExternalId: mockExternalId,
        });
        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: 'functions/SCHEDULE_CREATE_ERROR',
          scheduleName: mockScheduleName,
          functionExternalId: mockExternalId,
          errorMessage: 'Unable to create schedule',
        });
      });
      it('should dispatch appropriate actions', async () => {
        sdk.post.mockResolvedValue({
          status: 201,
        });
        sdk.post.mockClear();
        const store = {};
        const dispatch = jest.fn().mockReturnValue(true);
        const getState = jest.fn().mockReturnValue(store);
        const thunk = createSchedule(
          mockScheduleName,
          mockScheduleDescription,
          mockScheduleCronExpression,
          mockScheduleData,
          mockExternalId
        );
        await thunk(dispatch, getState);
        expect(dispatch).toBeCalledTimes(3);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/SCHEDULE_CREATE',
          scheduleName: mockScheduleName,
          description: mockScheduleDescription,
          cronExpression: mockScheduleCronExpression,
          data: mockScheduleData,
          functionExternalId: mockExternalId,
        });
        // 2nd call is to loadSchedules()
        expect(dispatch).toHaveBeenNthCalledWith(3, {
          type: 'functions/SCHEDULE_CREATE_DONE',
          scheduleName: mockScheduleName,
          functionExternalId: mockExternalId,
        });
      });
      it('should call the datastudio api', async () => {
        sdk.post.mockResolvedValue({
          status: 201,
        });
        sdk.post.mockClear();
        const store = {};
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);
        const thunk = createSchedule(
          mockScheduleName,
          mockScheduleDescription,
          mockScheduleCronExpression,
          mockScheduleData,
          mockExternalId
        );
        await thunk(dispatch, getState);
        expect(sdk.post.mock.calls.length).toBe(1);
        expect(sdk.post).toHaveBeenNthCalledWith(
          1,
          `/api/playground/projects/${mockProject}/functions/schedules`,
          {
            data: {
              items: [
                {
                  name: mockScheduleName,
                  functionExternalId: mockExternalId,
                  description: mockScheduleDescription,
                  cronExpression: mockScheduleCronExpression,
                  data: mockScheduleData,
                },
              ],
            },
          }
        );
      });
    });
    describe('createScheduleReset', () => {
      it('should dispatch appropriate actions', async () => {
        const dispatch = jest.fn();
        const thunk = createScheduleReset();
        await thunk(dispatch);
        expect(dispatch).toBeCalledTimes(1);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/SCHEDULE_CREATE_RESET',
        });
      });
    });
    describe('deleteSchedule', () => {
      const store = {
        functions: {
          deleteSchedule: {
            schedule: mockSchedule,
          },
        },
      };
      it('should dispatch appropriate actions', async () => {
        sdk.post.mockResolvedValue({
          status: 200,
        });
        sdk.post.mockClear();

        const dispatch = jest.fn().mockReturnValue(false);
        const getState = jest.fn().mockReturnValue(store);
        const thunk = deleteSchedule(mockSchedule);
        await thunk(dispatch, getState);

        expect(dispatch).toBeCalledTimes(3);
        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'functions/SCHEDULE_DELETE',
          scheduleToDelete: mockSchedule,
          functionExternalId: mockExternalId,
        });
        // 2rd call is to loadSchedules()
        expect(dispatch).toHaveBeenNthCalledWith(3, {
          type: 'functions/SCHEDULE_DELETE_DONE',
          scheduleToDelete: mockSchedule,
          functionExternalId: mockExternalId,
        });
      });
      it('should call the datastudio api', async () => {
        sdk.post.mockResolvedValue({
          status: 200,
        });
        sdk.post.mockClear();
        const dispatch = jest.fn().mockReturnValue(false);
        const getState = jest.fn().mockReturnValue(store);
        const thunk = deleteSchedule(mockSchedule);
        await thunk(dispatch, getState);

        expect(sdk.post.mock.calls.length).toBe(1);
        expect(sdk.post).toHaveBeenNthCalledWith(
          1,
          `/api/playground/projects/${mockProject}/functions/schedules/delete`,
          { data: { items: [{ id: mockScheduleId }] } }
        );
      });
    });
  });
  describe('reducer', () => {
    describe('imutability', () => {
      it('it should not mutate the old state, but return the new', () => {
        const initialState = reducer(undefined, {
          type: 'functions/SCHEDULES_LIST',
        });
        const state1 = reducer(initialState, {
          type: 'functions/SCHEDULES_LIST_DONE',
          schedules: [mockSchedule],
        });
        expect(initialState).not.toBe(state1);
      });
    });
  });
  describe('ACTIONS', () => {
    const initialState = reducer(undefined, { type: 'INIT' });
    const initialStore = {
      list: { items: [] },
      create: {},
      delete: {},
    };
    describe('list schedule actions', () => {
      const inProgressLoadSchedulesState = {
        ...initialStore,
        list: {
          fetching: true,
          ...initialStore.list,
        },
      };
      describe('functions/SCHEDULES_LIST', () => {
        it('should set the `fetching` flag to true', () => {
          const newState = reducer(initialState, {
            type: 'functions/SCHEDULES_LIST',
          });
          expect(newState.list.fetching).toBe(true);
        });
      });
      describe('functions/SCHEDULES_LIST_DONE', () => {
        const newState = reducer(inProgressLoadSchedulesState, {
          type: 'functions/SCHEDULES_LIST_DONE',
          schedules: [mockSchedule],
        });
        it('should set the `fetching` flag to false', () => {
          expect(newState.list.fetching).toBe(false);
        });
        it('should set the `error` flag to false', () => {
          expect(newState.list.error).toBe(false);
        });
        it('should set items to contain the function from the api call', () => {
          expect(newState.list.items).toEqual({
            [mockScheduleId]: { schedule: mockSchedule },
          });
        });
      });
      describe('functions/LIST_ERROR', () => {
        const newState = reducer(inProgressLoadSchedulesState, {
          type: 'functions/SCHEDULES_LIST_ERROR',
        });
        it('should set the `error` flag to true', () => {
          expect(newState.list.error).toBe(true);
        });
        it('should set the `fetching` flag to false', () => {
          expect(newState.list.fetching).toBe(false);
        });
      });
    });
    describe('list schedule calls actions', () => {
      const inProgressLoadScheduleCallsState = {
        ...initialStore,
        list: {
          items: {
            [mockScheduleId]: { schedule: mockSchedule },
          },
        },
      };

      describe('functions/SCHEDULES_LIST_DONE', () => {
        const newState = reducer(inProgressLoadScheduleCallsState, {
          type: 'functions/SCHEDULE_LIST_CALLS_DONE',
          schedule: mockSchedule,
          calls: [],
        });
        it('should set items to contain the calls for the schedule', () => {
          expect(newState.list.items).toEqual({
            [mockScheduleId]: { schedule: mockSchedule, calls: [] },
          });
        });
      });
    });
    describe('create schedule actions', () => {
      const inProgressCreateScheduleState = {
        ...initialStore,
        create: {
          name: mockScheduleName,
          description: mockScheduleDescription,
          cronExpression: mockScheduleCronExpression,
          data: mockScheduleData,
          functionExternalId: mockExternalId,
          creating: true,
        },
      };

      describe('functions/SCHEDULE_CREATE', () => {
        it('should set the `creating` flag to true', () => {
          const newState = reducer(initialState, {
            type: 'functions/SCHEDULE_CREATE',
            scheduleName: mockScheduleName,
            description: mockScheduleDescription,
            cronExpression: mockScheduleCronExpression,
            data: mockScheduleData,
            functionExternalId: mockExternalId,
          });
          expect(newState.create.creating).toBe(true);
        });
      });
      describe('functions/SCHEDULE_CREATE_DONE', () => {
        const newState = reducer(inProgressCreateScheduleState, {
          type: 'functions/SCHEDULE_CREATE_DONE',
          scheduleName: mockScheduleName,
          functionExternalId: mockExternalId,
        });
        it('should set the `done` flag to true', () => {
          expect(newState.create.done).toBe(true);
        });
        it('should set the `creating` flag to false', () => {
          expect(newState.create.creating).toBe(false);
        });
      });
      describe('functions/SCHEDULE_CREATE_ERROR', () => {
        const newState = reducer(undefined, {
          type: 'functions/SCHEDULE_CREATE_ERROR',
          scheduleName: mockScheduleName,
          functionExternalId: mockExternalId,
          errorMessage: mockErrorMessage,
        });
        it('should set the `error` flag to true', () => {
          expect(newState.create.error).toBe(true);
        });
        it('should set the `creating` flag to false', () => {
          expect(newState.create.creating).toBe(false);
        });
        it('should set the `errorMessage` field to the provided string', () => {
          expect(newState.create.errorMessage).toBe(mockErrorMessage);
        });
      });
      describe('functions/CREATE_RESET', () => {
        it('should reset store', () => {
          const newState = reducer(inProgressCreateScheduleState, {
            type: 'functions/SCHEDULE_CREATE_RESET',
          });
          expect(newState.create).toEqual({});
        });
      });
    });
    describe('delete schedule actions', () => {
      const inProgressDeleteFunctionState = {
        ...initialStore,
        delete: {
          schedule: mockSchedule,
          deleting: true,
        },
      };
      describe('functions/SCHEDULE_DELETE', () => {
        it('should set the `deleting` flag to true', () => {
          const newState = reducer(initialState, {
            type: 'functions/SCHEDULE_DELETE',
            scheduleToDelete: mockSchedule,
            functionExternalId: mockExternalId,
          });

          expect(newState.delete.schedule).toEqual(mockSchedule);
          expect(newState.delete.deleting).toBe(true);
        });
      });
      describe('functions/schedule_delete_DONE', () => {
        it('should set the `deleting` flag to false', () => {
          const newState = reducer(inProgressDeleteFunctionState, {
            type: 'functions/SCHEDULE_DELETE_DONE',
            scheduleToDelete: mockSchedule,
            functionExternalId: mockExternalId,
          });
          expect(newState.delete.deleting).toBe(false);
        });
      });
      describe('functions/SCHEDULE_DELETE_ERROR', () => {
        it('should set the `error` flag to true', () => {
          const newState = reducer(inProgressDeleteFunctionState, {
            type: 'functions/SCHEDULE_DELETE_ERROR',
            scheduleToDelete: mockSchedule,
            functionExternalId: mockExternalId,
          });
          expect(newState.delete.error).toBe(true);
          expect(newState.delete.deleting).toBe(false);
        });
      });
    });
  });
});
