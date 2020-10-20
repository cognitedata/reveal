import sinon from 'sinon';
import {
  isEqual,
  firstResolvedDomain,
  processStateUpdate,
  getDerivedStateFromProps,
  onComponentDidUpdate,
  StateUpdates,
  Props,
  State,
} from '../index';
import { placeholder } from '../../utils/placeholder';
import { Datapoint, UpdateState } from '../../types';

describe('Scaler tests', () => {
  describe('onComponentDidUpdate tests', () => {
    const timeSubDomainChanged = sinon.spy();
    const limitTimeSubDomain = sinon.spy();
    const onUpdateDomains = sinon.spy();
    const props: Props = {
      children: [],
      dataContext: {
        timeDomain: [1, 1000],
        externalTimeDomain: [0, 0],
        timeSubDomain: [200, 800],
        externalTimeSubDomain: [0, 0],
        timeSubDomainChanged,
        limitTimeSubDomain,
        onUpdateDomains,
        series: [],
        collections: [],
        registerCollection: () => null,
        updateCollection: () => null,
        registerSeries: () => null,
        updateSeries: () => null,
      },
    };
    const state: State = {
      domainsByItemId: {},
      subDomainsByItemId: {},
    };
    let stateSet: State = state;
    let setStateCalled = false;
    const updateState: UpdateState<State> = (newState, callback) => {
      setStateCalled = true;
      if (typeof newState === 'function') {
        newState(state);
      } else {
        stateSet = newState;
      }
      if (callback) {
        callback();
      }
    };
    it('should not update when nothing has changed', () => {
      onComponentDidUpdate(props, props, state, updateState);
      expect(stateSet).toEqual(state);
      expect(setStateCalled).toEqual(false);
    });

    it('should update when domains change', () => {
      const yAccessor = sinon.spy();
      const xAccessor = sinon.spy();
      const timeAccessor = sinon.spy();
      onComponentDidUpdate(
        {
          ...props,
          dataContext: {
            ...props.dataContext,
            series: [
              {
                id: '1',
                timeDomain: [1, 1000],
                data: [],
                yAccessor,
                xAccessor,
                timeAccessor,
              },
            ],
          },
        },
        props,
        state,
        updateState
      );
      expect(JSON.stringify(stateSet)).toEqual(
        JSON.stringify({
          ...state,
          ...{
            domainsByItemId: {
              '1': {
                time: [1, 1000],
                x: [-9007199254740991, 9007199254740991],
                y: [-9007199254740991, 9007199254740991],
              },
            },
            subDomainsByItemId: {
              '1': {
                time: [200, 800],
                x: [0, 1],
                y: [0, 1],
              },
            },
          },
        })
      );
      expect(setStateCalled).toEqual(true);
    });
  });
  describe('getDerivedStateFromProps tests', () => {
    it('should not update if nothing to derive', () => {
      const timeSubDomainChanged = sinon.spy();
      const limitTimeSubDomain = sinon.spy();
      const onUpdateDomains = sinon.spy();
      const props: Props = {
        children: [],
        dataContext: {
          timeDomain: [1, 1000],
          externalTimeDomain: [0, 0],
          timeSubDomain: [200, 800],
          externalTimeSubDomain: [0, 0],
          timeSubDomainChanged,
          limitTimeSubDomain,
          onUpdateDomains,
          series: [],
          collections: [],
          registerCollection: () => null,
          updateCollection: () => null,
          registerSeries: () => null,
          updateSeries: () => null,
        },
      };
      const state: State = {
        domainsByItemId: {},
        subDomainsByItemId: {},
      };
      expect(getDerivedStateFromProps(props, state)).toEqual(null);
    });
  });

  describe('processStateUpdate tests', () => {
    it('should return updated state updates', () => {
      let updated = false;
      const setUpdated = () => {
        updated = true;
      };
      const stateUpdates = processStateUpdate({}, setUpdated, [1, 1000], {}, [
        200,
        800,
      ])(
        { domainsByItemId: {}, subDomainsByItemId: {} },
        {
          id: '1',
          data: [],
          timeAccessor: (d: Datapoint) => d.timestamp as number,
          xAccessor: (d: Datapoint) => d.x as number,
          yAccessor: (d: Datapoint) => d.value as number,
        }
      );
      const expected = {
        domainsByItemId: {
          '1': {
            time: [1, 1000],
            x: [-9007199254740991, 9007199254740991],
            y: [-9007199254740991, 9007199254740991],
          },
        },
        subDomainsByItemId: {
          '1': {
            time: [200, 800],
            x: [0, 1],
            y: [0, 1],
          },
        },
      } as StateUpdates;
      expect(JSON.stringify(stateUpdates)).toEqual(JSON.stringify(expected));
      expect(updated).toEqual(true);
    });
  });

  describe('isEqual tests', () => {
    it('shouød return true for equal arrays', () => {
      expect(isEqual([1, 2], [1, 2])).toEqual(true);
    });

    it('shouød return false for unequal arrays', () => {
      expect(isEqual([1, 2], [1, 3])).toEqual(false);
    });

    it('shouød return false if some are undefined', () => {
      expect(isEqual(undefined, [1, 3])).toEqual(false);
      expect(isEqual([1, 2], undefined)).toEqual(false);
    });
  });

  describe('firstResolvedDomain tests', () => {
    it('should resolve first domain (or not)', () => {
      expect(firstResolvedDomain([1, 2])).toEqual([1, 2]);
      expect(firstResolvedDomain(placeholder(1, 2))).toEqual(undefined);
      expect(firstResolvedDomain(placeholder(1, 2), [3, 4])).toEqual([3, 4]);
      expect(firstResolvedDomain(placeholder(1, 2), placeholder(3, 4))).toEqual(
        undefined
      );
    });
  });
});
