/* eslint-disable import/first */
jest.mock('sdk-singleton', () => {
  return {
    timeseries: {
      retrieve: jest.fn().mockResolvedValue([{ id: 42, name: 'some ts' }]),
    },
  };
});

import reducer, { retrieve } from './timeseries';

let seed = 1;
function random() {
  const x = Math.sin(seed) * 10000;
  seed += 1;
  return x - Math.floor(x);
}

function generateRandomId(length: number = 17): number {
  return parseInt(
    [...new Array(length).keys()].map(() => Math.floor(random() * 10)).join(''),
    10
  );
}

function generateRandomString(length: number = 20): string {
  return [...new Array(length).keys()]
    .map(() => String.fromCharCode(65 + Math.floor(random() * 57)))
    .join('');
}

function generateRandomTimeSeries(includeAssetId: boolean = true) {
  const id = generateRandomId();
  const assetId = includeAssetId ? generateRandomId() : undefined;
  const externalId = generateRandomId().toString();
  const name = generateRandomString(30);
  const description = generateRandomString(60);
  return {
    [id]: {
      externalId,
      name,
      isString: false,
      assetId,
      isStep: false,
      description,
      createdTime: new Date(1582023240144),
      lastUpdatedTime: new Date(1582730942369),
      id,
    },
  };
}

function generateItemsObject(nItems: number, includeAssetId: boolean = true) {
  const items = [...new Array(nItems).keys()].map(() =>
    generateRandomTimeSeries(includeAssetId)
  );
  return Object.assign({}, ...items);
}

describe('Timeseries store', () => {
  describe('actions', () => {
    describe('retrieve', () => {
      it('should dispatch an action before starting the sdk work and then then call the sdk. A successful sdk call should then call the dispatch with a success action.', async () => {
        const store = {
          timeseries: {
            items: {
              items: {},
              getById: {},
            },
          },
        };
        const dispatch = jest.fn();
        const getState = jest.fn().mockReturnValue(store);

        const ids = [{ id: 42 }];

        const thunk = retrieve(ids);

        expect(thunk).toBeInstanceOf(Function);

        await thunk(dispatch, getState);

        expect(dispatch).toHaveBeenNthCalledWith(1, {
          type: 'timeseries/RETRIEVE',
          ids,
        });

        expect(dispatch).toHaveBeenNthCalledWith(2, {
          type: 'timeseries/UPDATE_ITEMS',
          result: [{ id: 42, name: 'some ts' }],
        });
        expect(dispatch).toHaveBeenNthCalledWith(3, {
          type: 'timeseries/RETRIEVE_DONE',
          ids,
          items: [{ id: 42, name: 'some ts' }],
        });
      });
    });
    describe('reducer', () => {
      const initialState = reducer(undefined, {
        type: 'INIT',
      });
      describe('imutability', () => {
        it('it should not mutate the old state, but return the new', () => {
          const state1 = reducer(initialState, {
            type: 'timeseries/UPDATE',
            updates: [
              {
                id: 1,
              },
            ],
          });
          expect(initialState).not.toBe(state1);
          const state2 = reducer(state1, {
            type: 'timeseries/UPDATE_DONE',
            updates: [
              {
                id: 1,
              },
            ],
          });
          expect(state1).not.toBe(state2);
        });
      });
      describe('ACTIONS', () => {
        const updateInitAction = {
          type: 'timeseries/UPDATE',
          updates: [{ id: 1 }],
        };
        const searchInitAction = {
          type: 'timeseries/SEARCH',
          filter: {
            name: 'abc',
          },
        };
        const listInitAction = {
          type: 'timeseries/LIST',
          nth: 1,
          partition: 1,
          scope: {
            filter: {
              name: 'foo',
            },
          },
        };

        describe('UPDATE', () => {
          it('should set the `inProgres` flag to true for new IDs', () => {
            expect(initialState.items.update).toEqual({});

            const state1 = reducer(initialState, {
              type: 'timeseries/UPDATE',
              updates: [
                {
                  id: 1,
                },
              ],
            });

            expect(() => state1.items.update[1].inProgress).not.toThrow();
            expect(state1.items.update[1].inProgress).toBe(true);
          });
          it('should set the `inProgress` flag to true', () => {
            const firstState = {
              ...initialState,
              items: {
                update: {
                  1: {
                    inProgress: true,
                  },
                },
              },
            };

            const state1 = reducer(firstState, {
              type: 'timeseries/UPDATE',
              updates: [
                {
                  id: 1,
                },
              ],
            });

            expect(() => state1.items.update[1].inProgress).not.toThrow();
            expect(state1.items.update[1].inProgress).toBe(true);
          });

          it('should return the same object if there is nothing to change', () => {
            const state1 = reducer(initialState, {
              type: 'timeseries/UPDATE',
              updates: [
                {
                  id: 1,
                },
              ],
            });

            const state2 = reducer(state1, {
              type: 'timeseries/UPDATE',
              updates: [
                {
                  id: 1,
                },
              ],
            });

            expect(state1.items.update).toEqual({
              1: {
                inProgress: true,
              },
            });
            expect(state1).toEqual(state2);
            expect(state1.update).toBe(state2.update);
          });

          describe('PERFORMANCE', () => {
            it('should be possible to run a reasonable large amount of updates in a small amount of time', () => {
              const items = generateItemsObject(10000, false);
              const initialPerfTestState = {
                ...initialState,
                items: { items },
              };

              // 1000 updates
              const idsToUpdate = Object.values(items).reduce(
                (accl, item, index) =>
                  index % 10 === 0 ? accl.concat(item.id) : accl,
                []
              );
              const updates = idsToUpdate.map(id => ({ id }));
              expect(updates.length).toBe(1000);

              const excecuteTimes = [...Array(50).keys()].map(() => {
                const [startSec, startNano] = process.hrtime();

                reducer(initialPerfTestState, {
                  type: 'timeseries/UPDATE',
                  updates,
                });

                const [deltaSec, deltaNano] = process.hrtime([
                  startSec,
                  startNano,
                ]);
                expect(deltaSec).toEqual(0);
                return deltaNano;
              });

              const averageTime =
                excecuteTimes.reduce((accl, t) => accl + t, 0) /
                excecuteTimes.length;
              // 20 ms, 60pfs = 16.6ms per frame
              expect(averageTime).toBeLessThan(2e7);
            });
          });
        });

        describe('UPDATE_DONE', () => {
          const beforeUpdateState = reducer(initialState, updateInitAction);
          it('it should add results to store', () => {
            const state1 = reducer(beforeUpdateState, {
              type: 'timeseries/UPDATE_DONE',
              updates: [{ id: 1 }],
            });

            expect(state1.items.update).toEqual({
              1: {
                inProgress: false,
                done: true,
              },
            });
          });

          describe('PERFORMANCE', () => {
            it('should be possible to run a reasonable large amount of updates in a small amount of time', () => {
              const items = generateItemsObject(1000, false);
              const initialPerfTestState = {
                ...initialState,
                items: { items },
              };
              const assetId = generateRandomId();

              // 1000 updates
              const idsToUpdate = Object.values(items).reduce(
                (accl, item, index) =>
                  index % 10 === 0 ? accl.concat(item.id) : accl,
                []
              );

              const updatedTimeseries = idsToUpdate.map(id => ({
                ...items[id],
                assetId,
              }));

              expect(updatedTimeseries.length).toBe(100);

              const excecuteTimes = [...Array(50).keys()].map(() => {
                const [startSec, startNano] = process.hrtime();

                reducer(initialPerfTestState, {
                  type: 'timeseries/UPDATE_DONE',
                  updates: updatedTimeseries,
                });

                const [deltaSec, deltaNano] = process.hrtime([
                  startSec,
                  startNano,
                ]);
                expect(deltaSec).toEqual(0);
                return deltaNano;
              });

              const averageTime =
                excecuteTimes.reduce((accl, t) => accl + t, 0) /
                excecuteTimes.length;
              // 20 ms, 60pfs = 16.6ms per frame
              expect(averageTime).toBeLessThan(2e7);
            });
          });
        });

        describe('UPDATE_ERROR', () => {
          const beforeUpdateState = reducer(initialState, updateInitAction);
          it('it should set updating to false and updateError to true', () => {
            const state1 = reducer(beforeUpdateState, {
              type: 'timeseries/UPDATE_ERROR',
              updates: [{ id: 1 }],
            });

            expect(state1.items.update).toEqual({
              1: {
                inProgress: false,
                error: true,
              },
            });
          });

          it('it should overwrite updating to false and updateError to true', () => {
            const state1 = reducer(
              {
                ...initialState,
                items: {
                  update: {
                    1: {
                      inProgress: true,
                    },
                  },
                },
              },
              {
                type: 'timeseries/UPDATE_ERROR',
                updates: [{ id: 1 }],
              }
            );
            const state2 = reducer(
              {
                ...initialState,
                items: {
                  update: {
                    1: {
                      inProgress: true,
                      error: false,
                    },
                  },
                },
              },
              {
                type: 'timeseries/UPDATE_ERROR',
                updates: [{ id: 1 }],
              }
            );

            expect(state1.items.update).toEqual({
              1: {
                inProgress: false,
                error: true,
              },
            });
            expect(state2.items.update).toEqual({
              1: {
                inProgress: false,
                error: true,
              },
            });
          });

          it('it should leave other data alone', () => {
            const firstState = {
              ...initialState,
              items: {
                items: {
                  '1': {
                    id: 1,
                    extraStuff: true,
                    name: 'I have a name',
                  },
                },
              },
            };

            const state1 = reducer(firstState, {
              type: 'timeseries/UPDATE_ERROR',
              updates: [{ id: 1 }],
            });

            expect(state1.items.update).toEqual({
              '1': {
                inProgress: false,
                error: true,
              },
            });
          });

          it('it should return the same object if there is nothing to change', () => {
            const state1 = reducer(initialState, {
              type: 'timeseries/UPDATE_ERROR',
              updates: [],
            });

            expect(initialState).toEqual(state1);
            expect(initialState).toBe(state1);

            const alreadyBadState = {
              ...initialState,
              items: {
                update: {
                  1: {
                    inProgress: false,
                    error: true,
                  },
                },
              },
            };

            const state2 = reducer(alreadyBadState, {
              type: 'timeseries/UPDATE_ERROR',
              updates: [{ id: 1 }],
            });

            expect(alreadyBadState.update).toEqual(state2.update);
            expect(alreadyBadState.update).toBe(state2.update);
          });
        });

        describe('SEARCH', () => {
          const action = {
            type: 'timeseries/SEARCH',
            filter: {
              name: 'abc',
            },
          };

          it('should initialize the state', () => {
            expect(reducer(initialState, action).search).toEqual({
              '{"name":"abc"}': {
                fetching: true,
                error: false,
                done: false,
                ids: [],
              },
            });
          });

          it('should only change the fetching flag', () => {
            const beforeState = {
              items: {},
              list: {},
              search: {
                '{"name":"abc"}': {
                  fetching: false,
                  done: true,
                  error: false,
                },
              },
            };

            expect(reducer(beforeState, action).search).toEqual({
              '{"name":"abc"}': {
                fetching: true,
                done: true,
                error: false,
              },
            });
          });
        });

        describe('SEARCH_DONE', () => {
          const action = {
            type: 'timeseries/SEARCH_DONE',
            filter: {
              name: 'abc',
            },
            result: [
              { id: 123, name: 'TS1' },
              { id: 234, name: 'TS2' },
            ],
          };

          const beforeDoneState = reducer(initialState, searchInitAction);

          it('should add the ids and status flags to the search part', () => {
            expect(reducer(beforeDoneState, action).search).toEqual({
              '{"name":"abc"}': {
                ids: [123, 234],
                done: true,
                fetching: false,
                error: false,
              },
            });
          });

          it('should merge old and new results', () => {
            const action2 = {
              ...action,
              filter: {
                name: 'cdf',
              },
              result: [
                { id: 345, name: 'TS3' },
                { id: 456, name: 'TS4' },
              ],
            };
            const beforeAction2 = {
              ...searchInitAction,
              filter: action2.filter,
            };

            const state1 = reducer(
              reducer(beforeDoneState, action),
              beforeAction2
            );
            const finalState = reducer(state1, action2);

            expect(finalState.search).toEqual({
              '{"name":"abc"}': {
                ids: [123, 234],
                done: true,
                fetching: false,
                error: false,
              },
              '{"name":"cdf"}': {
                ids: [345, 456],
                done: true,
                fetching: false,
                error: false,
              },
            });
          });
        });

        describe('SEARCH_ERROR', () => {
          const action = {
            type: 'timeseries/SEARCH_ERROR',
            filter: {
              name: 'abc',
            },
          };

          it('should set error and fetching', () => {
            const beforeErrorState = reducer(initialState, searchInitAction);
            expect(reducer(beforeErrorState, action).search).toEqual({
              '{"name":"abc"}': {
                error: true,
                fetching: false,
                done: false,
                ids: [],
              },
            });
          });
        });

        describe('LIST', () => {
          const action = {
            type: 'timeseries/LIST',
            partition: 1,
            nth: 1,
            scope: {
              filter: {
                name: 'foo',
              },
            },
          };

          it('should set fetching', () => {
            expect(reducer(initialState, action).list).toEqual({
              '{"filter":{"name":"foo"}}': {
                '1/1': {
                  done: false,
                  error: false,
                  ids: [],
                  fetching: true,
                },
              },
            });
          });

          it('should ignore the cursor', () => {
            const action2 = {
              ...action,
              scope: {
                ...action.scope,
                cursor: '1233',
              },
            };

            expect(reducer(initialState, action2).list).toEqual({
              '{"filter":{"name":"foo"}}': {
                '1/1': {
                  done: false,
                  error: false,
                  ids: [],
                  fetching: true,
                },
              },
            });
          });
        });

        describe('LIST_DONE', () => {
          const action = {
            ...listInitAction,
            type: 'timeseries/LIST_DONE',
            result: [123, 234],
          };
          const beforeState = reducer(initialState, listInitAction);

          it('should set update all the relevant values', () => {
            expect(reducer(beforeState, action).list).toEqual({
              '{"filter":{"name":"foo"}}': {
                '1/1': {
                  done: true,
                  error: false,
                  fetching: false,
                  ids: [123, 234],
                },
              },
            });
          });

          it('should set ignore the cursor', () => {
            const action2 = {
              ...action,
              scope: {
                ...action.scope,
                cursor: 'abc',
              },
            };
            expect(reducer(beforeState, action2).list).toEqual({
              '{"filter":{"name":"foo"}}': {
                '1/1': {
                  done: true,
                  error: false,
                  fetching: false,
                  ids: [123, 234],
                },
              },
            });
          });
        });

        describe('LIST_ERROR', () => {
          const action = {
            type: 'timeseries/LIST_ERROR',
            partition: 1,
            nth: 1,
            scope: {
              filter: {
                name: 'foo',
              },
            },
          };
          const beforeState = reducer(initialState, listInitAction);

          it('should set the error and fetching values', () => {
            expect(reducer(beforeState, action).list).toEqual({
              '{"filter":{"name":"foo"}}': {
                '1/1': {
                  done: false,
                  ids: [],
                  error: true,
                  fetching: false,
                },
              },
            });
          });
          it('should set ignore the cursor', () => {
            const action2 = {
              ...action,
              scope: {
                ...action.scope,
                cursor: 'abc',
              },
            };
            expect(reducer(beforeState, action2).list).toEqual({
              '{"filter":{"name":"foo"}}': {
                '1/1': {
                  done: false,
                  ids: [],
                  error: true,
                  fetching: false,
                },
              },
            });
          });
        });
      });
    });
  });
});
