/* eslint-disable import/first */
jest.mock('sdk-singleton', () => {
  return {
    events: {
      retrieve: jest.fn(),
    },
  };
});

import { Map } from 'immutable';
import sdk from 'sdk-singleton';
import reducer, * as Events from './events';
import { mockStore } from '../utils/mockStore';

describe('Event store', () => {
  describe('reducer', () => {
    const events = [
      {
        externalId: '7972369478136459',
        name: 'ABC PROTECTION EQUIPMENT',
        parentId: 855846194274916,
        parentExternalId: '5743489740640132',
        description: '',
        dataSetId: 1143490474352058,
        metadata: {
          FunctionFather: '50',
          FunctionId: '506',
        },
        source: '',
        id: 6827415698873347,
        createdTime: 1581955996474,
        lastUpdatedTime: 1581955996474,
        rootId: 4617285525372246,
      },
      {
        externalId: '1646841329394391',
        name: '72-SP-125B',
        parentId: 1703154784170567,
        parentExternalId: '6423835799087150',
        description: 'FIRE EXTING, PORT DRY POWDER ABC 6 KG',
        dataSetId: 7800476201708017,
        metadata: {
          ASSETSCOPENAME: 'SKA',
          ELC_STATUS_ID: '1211',
        },
        id: 7377428459970056,
        createdTime: 1581699478794,
        lastUpdatedTime: 1581699478794,
        rootId: 260456667117613,
      },
      {
        externalId: '4034793472839654',
        name: 'SHIP SECURITY ALERT SYSTEM (SSAS)',
        parentId: 53397548714028,
        parentExternalId: '7783177042695073',
        description: '',
        dataSetId: 1143490474352058,
        metadata: {
          FunctionFather: '412',
          FunctionId: '412.050',
        },
        source: '',
        id: 4832666033124442,
        createdTime: 1581955999634,
        lastUpdatedTime: 1581955999634,
        rootId: 4617285525372246,
      },
      {
        externalId: '625670768921241',
        name: 'AUTOMATION / ALARM SYSTEM, SEA WATER COOLING SYSTE',
        parentId: 8528350082184243,
        parentExternalId: '3113576410919610',
        description: '',
        dataSetId: 1143490474352058,
        metadata: {
          FunctionFather: '792',
          FunctionId: '792.905',
        },
        source: '',
        id: 5729643723305889,
        createdTime: 1581955997771,
        lastUpdatedTime: 1581955997771,
        rootId: 4617285525372246,
      },
    ];

    const newStoreState = reducer(undefined, { type: 'INIT' });
    describe('list actions', () => {
      describe('LIST', () => {
        const action = {
          type: 'events/LIST',
          scope: {
            filter: {
              name: 'foo',
            },
          },
          partition: 1,
          nth: 1,
        };
        it('should write the correct result to the list part of the store', () => {
          expect(reducer(newStoreState, action).list).toEqual({
            '{"filter":{"name":"foo"}}': {
              '1/1': {
                fetching: true,
                done: false,
                error: false,
                ids: [],
              },
            },
          });
        });
        it('should ignore the cursor from scope', () => {
          const actionWithCursor = {
            ...action,
            scope: {
              ...action.scope,
              cursor: 'asdsada',
            },
          };
          expect(reducer(newStoreState, actionWithCursor).list).toEqual({
            '{"filter":{"name":"foo"}}': {
              '1/1': {
                fetching: true,
                done: false,
                error: false,
                ids: [],
              },
            },
          });
        });
      });
      const beforeActionStore = reducer(newStoreState, {
        type: 'events/LIST',
        scope: {
          filter: {
            name: 'foo',
          },
        },
        partition: 1,
        nth: 1,
      });
      describe('LIST_ERROR', () => {
        const action = {
          type: 'events/LIST_ERROR',
          scope: {
            filter: {
              name: 'foo',
            },
          },
          partition: 1,
          nth: 1,
        };
        it('should write the correct result to the list part of the store', () => {
          expect(reducer(beforeActionStore, action).list).toEqual({
            '{"filter":{"name":"foo"}}': {
              '1/1': {
                fetching: false,
                error: true,
                done: false,
                ids: [],
              },
            },
          });
        });
        it('should ignore the cursor from scope', () => {
          const actionWithCursor = {
            ...action,
            scope: {
              ...action.scope,
              cursor: 'asdsada',
            },
          };
          expect(reducer(beforeActionStore, actionWithCursor).list).toEqual({
            '{"filter":{"name":"foo"}}': {
              '1/1': {
                fetching: false,
                error: true,
                done: false,
                ids: [],
              },
            },
          });
        });
      });
      describe('LIST_DONE', () => {
        const action = {
          type: 'events/LIST_DONE',
          scope: {
            filter: {
              name: 'foo',
            },
          },
          partition: 1,
          nth: 1,
          result: [6827415698873347, 7377428459970056],
        };
        it('should write the correct result to the list part of the store', () => {
          expect(reducer(beforeActionStore, action).list).toEqual({
            '{"filter":{"name":"foo"}}': {
              '1/1': {
                done: true,
                fetching: false,
                error: false,
                ids: [6827415698873347, 7377428459970056],
              },
            },
          });
        });
        it('should ignore the cursor from scope', () => {
          const actionWithCursor = {
            ...action,
            scope: {
              ...action.scope,
              cursor: 'asdsada',
            },
          };
          expect(reducer(beforeActionStore, actionWithCursor).list).toEqual({
            '{"filter":{"name":"foo"}}': {
              '1/1': {
                done: true,
                fetching: false,
                error: false,
                ids: [6827415698873347, 7377428459970056],
              },
            },
          });
        });
      });
    });
    describe('RETRIEVE_DONE', () => {
      const action = {
        type: 'events/RETRIEVE_DONE',
        ids: events.slice(0, 2).map(e => ({ id: e.id })),
        items: events.slice(0, 2),
      };
      it('should add the events to the items part of the store ', () => {
        expect(reducer(newStoreState, action).items).toEqual({
          items: Map(),
          update: {},
          getByExternalId: {},
          getById: {
            6827415698873347: {
              done: true,
              error: false,
              inProgress: false,
              item: events[0].id,
            },
            '7377428459970056': {
              done: true,
              error: false,
              inProgress: false,
              item: events[1].id,
            },
          },
        });
      });
      it('should merge old and new events', () => {
        const state1 = reducer(newStoreState, action);
        const state2 = reducer(state1, {
          type: 'events/RETRIEVE_DONE',
          ids: events.slice(2, 4).map(e => ({ id: e.id })),
          items: events.slice(2, 4),
        });
        expect(state2.items).toEqual({
          items: Map(),
          getByExternalId: {},
          update: {},
          getById: {
            6827415698873347: {
              done: true,
              error: false,
              inProgress: false,
              item: events[0].id,
            },
            '7377428459970056': {
              done: true,
              error: false,
              inProgress: false,
              item: events[1].id,
            },
            '4832666033124442': {
              done: true,
              error: false,
              inProgress: false,
              item: events[2].id,
            },
            '5729643723305889': {
              done: true,
              error: false,
              inProgress: false,
              item: events[3].id,
            },
          },
        });
      });
    });

    describe('search actions', () => {
      describe('SEARCH', () => {
        const action = {
          type: 'events/SEARCH',
          filter: {
            search: {
              query: 'abc',
            },
          },
        };
        it('should set the fetching flag', () => {
          expect(reducer(newStoreState, action).search).toEqual({
            '{"search":{"query":"abc"}}': {
              fetching: true,
              done: false,
              error: false,
              ids: [],
            },
          });
        });
      });
      const initialAction = {
        type: 'events/SEARCH',
        filter: {
          search: {
            query: 'abc',
          },
        },
      };
      const afterInitialAction = reducer(newStoreState, initialAction);
      describe('SEARCH_ERROR', () => {
        const action = {
          type: 'events/SEARCH_ERROR',
          filter: {
            search: {
              query: 'abc',
            },
          },
        };
        it('should set the error and fetching values', () => {
          expect(reducer(afterInitialAction, action).search).toEqual({
            '{"search":{"query":"abc"}}': {
              fetching: false,
              error: true,
              done: false,
              ids: [],
            },
          });
        });
      });

      describe('SEARCH_DONE', () => {
        const action = {
          type: 'events/SEARCH_DONE',
          filter: {
            search: {
              query: 'abc',
            },
          },
          result: events.slice(0, 2),
        };
        it('should save the search result', () => {
          expect(reducer(afterInitialAction, action).search).toEqual({
            '{"search":{"query":"abc"}}': {
              error: false,
              fetching: false,
              done: true,
              ids: [6827415698873347, 7377428459970056],
            },
          });
        });

        it('should merge old and new item', () => {
          const action1 = {
            type: 'events/SEARCH_DONE',
            filter: {
              search: {
                query: 'abc',
              },
            },
            result: events.slice(0, 2),
          };
          const action2 = {
            type: 'events/SEARCH_DONE',
            filter: {
              search: {
                query: 'cdf',
              },
            },
            result: events.slice(2, 4),
          };
          const afterTwoInits = reducer(afterInitialAction, {
            type: 'events/SEARCH',
            filter: {
              search: {
                query: 'cdf',
              },
            },
          });
          const state1 = reducer(afterTwoInits, action1);
          const state2 = reducer(state1, action2);

          expect(state2.search).toEqual({
            '{"search":{"query":"abc"}}': {
              error: false,
              fetching: false,
              done: true,
              ids: [6827415698873347, 7377428459970056],
            },
            '{"search":{"query":"cdf"}}': {
              error: false,
              fetching: false,
              done: true,
              ids: [4832666033124442, 5729643723305889],
            },
          });
        });
      });
    });
    describe('count actions', () => {
      const initialAction = {
        type: 'events/COUNT',
        scope: {
          search: {
            query: 'abc',
          },
        },
      };
      const afterInitialAction = reducer(newStoreState, initialAction);
      describe('COUNT', () => {
        it('should set the fetching flag', () => {
          expect(reducer(newStoreState, initialAction).count).toEqual({
            '{"search":{"query":"abc"}}': {
              fetching: true,
              done: false,
              error: false,
            },
          });
        });
      });

      describe('COUNT_ERROR', () => {
        const action = {
          type: 'events/COUNT_ERROR',
          scope: {
            search: {
              query: 'abc',
            },
          },
        };
        it('should set the error and fetching values', () => {
          expect(reducer(afterInitialAction, action).count).toEqual({
            '{"search":{"query":"abc"}}': {
              fetching: false,
              error: true,
              done: false,
            },
          });
        });
      });
      describe('COUNT_DONE', () => {
        const action = {
          type: 'events/COUNT_DONE',
          scope: {
            search: {
              query: 'abc',
            },
          },
          count: 10,
        };
        it('should save the count result', () => {
          expect(reducer(afterInitialAction, action).count).toEqual({
            '{"search":{"query":"abc"}}': {
              fetching: false,
              done: true,
              error: false,
              count: 10,
            },
          });
        });
      });
    });
  });
  describe('actions', () => {
    describe('retrieveIfNeeded', () => {
      it('retrieve', () => {
        sdk.events.retrieve.mockClear();
        // @ts-ignore
        const store = mockStore({
          // @ts-ignore
          events: {
            items: {
              items: Map([[12, { id: 12 }]]),
              getById: { 12: { done: true, item: 12 } },
            },
          },
        });
        Events.retrieve([{ id: 123 }])(store.dispatch, store.getState);
        expect(sdk.events.retrieve).toBeCalled();
      });
      it('dont retrieve if not missing', () => {
        sdk.events.retrieve.mockClear();
        // @ts-ignore
        const store = mockStore({
          // @ts-ignore
          events: {
            items: {
              items: Map([[123, { id: 123 }]]),
              getById: { 123: { done: true, item: 123 } },
            },
          },
        });
        Events.retrieve([{ id: 123 }])(store.dispatch, store.getState);
        expect(sdk.events.retrieve).not.toBeCalled();
      });
      it('dont retrieve if not missing external id', () => {
        sdk.events.retrieve.mockClear();
        // @ts-ignore
        const store = mockStore({
          // @ts-ignore
          events: {
            items: {
              items: Map([[1, { externalId: '123' }]]),
              getByExternalId: { '123': { done: true, item: 1 } },
              getById: {},
            },
          },
        });
        Events.retrieveExternal([{ externalId: '123' }])(
          store.dispatch,
          store.getState
        );
        expect(sdk.events.retrieve).not.toBeCalled();
      });
      it('retrieve if missing', () => {
        sdk.events.retrieve.mockClear();
        // @ts-ignore
        const store = mockStore({
          // @ts-ignore
          events: {
            items: {
              items: Map([[12, { id: 12 }]]),
              getById: {
                12: { item: 12, done: true },
              },
            },
          },
        });
        Events.retrieve([{ id: 123 }])(store.dispatch, store.getState);
        expect(sdk.events.retrieve).toBeCalled();
      });
      it('retrieve if missing external id', () => {
        sdk.events.retrieve.mockClear();
        // @ts-ignore
        const store = mockStore({
          // @ts-ignore
          events: {
            items: {
              items: Map([[12, { externalId: '12' }]]),
              getByExternalId: {
                '12': { done: true, item: 12 },
              },
              getById: {},
            },
          },
        });
        Events.retrieveExternal([{ externalId: '123' }])(
          store.dispatch,
          store.getState
        );
        expect(sdk.events.retrieve).toBeCalled();
      });
    });
  });

  describe('selectors', () => {
    describe('searchSelector', () => {
      const item1 = {
        id: 1,
        name: 'some event',
        rootId: 42,

        lastUpdatedTime: new Date(),
        createdTime: new Date(),
      };
      const item2 = {
        id: 2,
        name: 'some other event',
        rootId: 42,
        lastUpdatedTime: new Date(),
        createdTime: new Date(),
      };
      const events: EventStore = {
        items: {
          items: Map([
            [1, item1],
            [2, item2],
          ]),
        },
        list: {},
        search: {
          '{}': {
            fetching: false,
            error: false,
            done: true,
            ids: [1, 2],
          },
        },
      };
      const store = { events };
      it('should merge items and search status', () => {
        const query = {};

        expect(Events.searchSelector(store)(query)).toEqual({
          fetching: false,
          error: false,
          done: true,
          progress: 1,
          ids: [1, 2],
          items: [item1, item2],
        });
      });

      it('should return the same object when calling it with the same arguments on the same store', () => {
        const q1 = {};
        const q2 = {};
        const result1 = Events.searchSelector(store)(q1);
        const result2 = Events.searchSelector(store)(q2);
        expect(result1).toBe(result2);
      });
    });
  });
});
