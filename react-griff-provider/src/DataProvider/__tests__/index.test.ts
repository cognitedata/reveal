import sinon from 'sinon';
import {
  boundedDomain,
  fetchData,
  getTimeSubDomain,
  smallerDomain,
  calculateDomainFromData,
  deleteUndefinedFromObject,
  getCollectedSeries,
  DataProviderState,
  DataproviderProps,
  DEFAULT_ACCESSORS,
  getDomainsByCollectionId,
  getSeriesObjects,
  onTimeSubDomainChangedFn,
} from '..';
import { Datapoint, Series, Collection, UpdateState } from '../../types';

describe('DataProvider tests', () => {
  describe('timeSubDomainChanged tests', () => {
    const series = {
      id: '1',
      data: [{ x: 1, y: 1, value: 1, timestamp: 1 }],
      loader: undefined,
      timeAccessor: (d: Datapoint) => d.timestamp as number,
      xAccessor: (d: Datapoint) => d.x as number,
      yAccessor: (d: Datapoint) => d.y as number,
    };
    const defaultLoader = () => Promise.resolve<Series>(series);
    const props: DataproviderProps = {
      defaultLoader,
      timeDomain: [0, 0],
      timeSubDomain: [0, 0],
      xDomain: [0, 0],
      xSubDomain: [0, 0],
      yDomain: [0, 0],
      ySubDomain: [0, 0],
      children: [],
      isTimeSubDomainSticky: false,
      onFetchData: () => null,
      series: [{ id: '1' }],
    };
    const state: DataProviderState = {
      collectionsById: {},
      seriesById: {
        '1': series,
      },
      timeDomain: [0, 0],
      timeSubDomain: [0, 0],
      timeSubDomains: {},
      xSubDomains: {},
      ySubDomains: {},
    };
    it('should return undefined if new and current sub domain are equal', () => {
      const timeoutRef = 1;
      const clearTimeout = sinon.spy();
      const setTimeout = sinon.stub();
      setTimeout.returns(1);
      const setState = sinon.spy();
      expect(
        onTimeSubDomainChangedFn(
          props,
          state,
          timeoutRef,
          setTimeout,
          clearTimeout,
          setState,
          [1, 1000]
        )
      ).toBeUndefined();
      expect(setState.called).toBeFalsy();
    });

    it('should return 1 if there are changes', () => {
      const timeoutRef = 1;
      const clearTimeout = sinon.spy();
      const setTimeout = sinon.stub();
      setTimeout.returns(1); // <- this 1
      let stateSet: DataProviderState = state;
      const updateState: UpdateState<DataProviderState> = (
        newState,
        callback
      ) => {
        if (typeof newState === 'function') {
          newState(state);
        } else {
          stateSet = newState;
        }
        if (callback) {
          callback();
        }
      };
      const onTimeSubDomainChangedCB = sinon.spy();
      expect(
        onTimeSubDomainChangedFn(
          { ...props, onTimeSubDomainChanged: onTimeSubDomainChangedCB },
          { ...state, timeDomain: [1, 1000] },
          timeoutRef,
          setTimeout,
          clearTimeout,
          updateState,
          [400, 800]
        )
      ).toEqual(1);
      expect(onTimeSubDomainChangedCB.called).toBeTruthy();
      expect(stateSet).toEqual({
        ...state,
        timeDomain: [1, 1000],
        timeSubDomain: [400, 800],
      });
    });
  });

  describe('getSeriesObjects tests', () => {
    const series = {
      id: '1',
      data: [{ x: 1, y: 1, value: 1, timestamp: 1 }],
      loader: undefined,
      timeAccessor: (d: Datapoint) => d.timestamp as number,
      xAccessor: (d: Datapoint) => d.x as number,
      yAccessor: (d: Datapoint) => d.y as number,
    };
    const defaultLoader = () => Promise.resolve<Series>(series);
    const props: DataproviderProps = {
      defaultLoader,
      timeDomain: [0, 0],
      timeSubDomain: [0, 0],
      xDomain: [0, 0],
      xSubDomain: [0, 0],
      yDomain: [0, 0],
      ySubDomain: [0, 0],
      children: [],
      isTimeSubDomainSticky: false,
      onFetchData: () => null,
      series: [{ id: '1' }],
    };
    const state: DataProviderState = {
      collectionsById: {},
      seriesById: {
        '1': series,
      },
      timeDomain: [0, 0],
      timeSubDomain: [0, 0],
      timeSubDomains: {},
      xSubDomains: {},
      ySubDomains: {},
    };
    it('should work', () => {
      const seriesObjects = getSeriesObjects(props, state);
      expect(
        seriesObjects.map((seriesObject) => ({
          ...seriesObject,
          timeAccessor: undefined,
          xAccessor: undefined,
          yAccessor: undefined,
        }))
      ).toEqual([
        {
          color: 'black',
          data: [{ timestamp: 1, value: 1, x: 1, y: 1 }],
          drawLines: undefined,
          drawPoints: undefined,
          hidden: false,
          id: '1',
          loader: undefined,
          opacity: undefined,
          opacityAccessor: undefined,
          pointWidth: undefined,
          pointWidthAccessor: undefined,
          strokeWidth: undefined,
          timeAccessor: undefined,
          timeDomain: [0, 0],
          timeSubDomain: [0, 0],
          x0Accessor: undefined,
          x1Accessor: undefined,
          xAccessor: undefined,
          xDomain: [0, 0],
          xSubDomain: [0, 0],
          y0Accessor: undefined,
          y1Accessor: undefined,
          yAccessor: undefined,
          yDomain: [0, 0],
          ySubDomain: [0, 0],
        },
      ]);
    });
  });
  describe('getDomainsByCollectionId tests', () => {
    it('should work', () => {
      const series: Series = {
        id: '1',
        collectionId: '2',
        data: [{ x: 1, y: 1, value: 1, timestamp: 1 }],
        loader: undefined,
        timeAccessor: DEFAULT_ACCESSORS.time,
        xAccessor: DEFAULT_ACCESSORS.x,
        yAccessor: DEFAULT_ACCESSORS.y,
      };
      expect(getDomainsByCollectionId([series])).toEqual({
        '2': {
          timeDomain: undefined,
          timeSubDomain: [9007199254740991, -9007199254740991],
          xDomain: undefined,
          xSubDomain: [9007199254740991, -9007199254740991],
          yDomain: undefined,
          ySubDomain: [9007199254740991, -9007199254740991],
        },
      });
    });
  });

  describe('getCollectedSeries tests', () => {
    const series: Series = {
      id: '1',
      collectionId: '2',
      data: [{ x: 1, y: 1, value: 1, timestamp: 1 }],
      loader: undefined,
      timeAccessor: DEFAULT_ACCESSORS.time,
      xAccessor: DEFAULT_ACCESSORS.x,
      yAccessor: DEFAULT_ACCESSORS.y,
    };
    const collection: Collection = {
      data: [],
      id: '2',
      timeAccessor: DEFAULT_ACCESSORS.time,
      xAccessor: DEFAULT_ACCESSORS.x,
      yAccessor: DEFAULT_ACCESSORS.y,
    };

    it('should copy the series', () => {
      const collectedSeries = getCollectedSeries(
        [series],
        { '2': collection },
        {
          '2': {
            xDomain: [0, 0],
            xSubDomain: [0, 0],
            timeDomain: [0, 0],
            timeSubDomain: [0, 0],
            yDomain: [0, 0],
            ySubDomain: [0, 0],
          },
        }
      )[0];
      expect({
        collectionId: '2',
        data: [{ timestamp: 1, value: 1, x: 1, y: 1 }],
        id: '1',
        loader: undefined,
        xDomain: [0, 0],
        xSubDomain: [0, 0],
        timeDomain: [0, 0],
        timeSubDomain: [0, 0],
        yDomain: [0, 0],
        ySubDomain: [0, 0],
      }).toEqual({
        ...collectedSeries,
        timeAccessor: undefined,
        xAccessor: undefined,
        yAccessor: undefined,
      });
    });

    it('should not copy the series if no collection match', () => {
      const collectedSeries = getCollectedSeries(
        [series],
        {}, // not match
        { '1': { timeDomain: [3, 4] } }
      )[0];
      expect({
        data: [{ timestamp: 1, value: 1, x: 1, y: 1 }],
        id: '1',
        loader: undefined,
      }).toEqual({
        ...collectedSeries,
        timeAccessor: undefined,
        xAccessor: undefined,
        yAccessor: undefined,
      });
    });

    it('should not copy the series if series has no collectionId', () => {
      const collectedSeries = getCollectedSeries(
        [{ ...series, collectionId: undefined }],
        {}, // not match
        { '1': { timeDomain: [3, 4] } }
      )[0];
      expect({
        data: [{ timestamp: 1, value: 1, x: 1, y: 1 }],
        id: '1',
        loader: undefined,
      }).toEqual({
        ...collectedSeries,
        timeAccessor: undefined,
        xAccessor: undefined,
        yAccessor: undefined,
      });
    });
  });

  describe('default accessors test', () => {
    it('should pass', () => {
      expect(DEFAULT_ACCESSORS.time({ timestamp: 123 })).toEqual(123);
      expect(DEFAULT_ACCESSORS.x({ x: 123 })).toEqual(123);
      expect(DEFAULT_ACCESSORS.y({ value: 123 })).toEqual(123);
    });
  });
  describe('deleteUndefinedFromObject tests', () => {
    it('should remove undefined', () => {
      expect(deleteUndefinedFromObject({ name: undefined, age: 1 })).toEqual({
        age: 1,
      });
    });
    it('should return {} when passed undefined', () => {
      expect(deleteUndefinedFromObject(undefined)).toEqual({});
    });
  });
  describe('calculateDomainFromData test', () => {
    it('should return default domain on no data', () => {
      expect(calculateDomainFromData([], (d) => d.value as number)).toEqual([
        -0.25,
        0.25,
      ]);
    });

    it('should return calculated domain when min and max accessor is set and data is set', () => {
      expect(
        calculateDomainFromData(
          [{ x: 1, y: 1, value: 1, timestamp: 1 }],
          (d) => d.value as number,
          (d) => d.value as number,
          (d) => d.value as number
        )
      ).toEqual([0.5, 1.5]);
    });

    it('should return calculated domain when min and max accessor is set, data is set and diff is large', () => {
      expect(
        calculateDomainFromData(
          [
            { x: 1, y: 1, value: 1, timestamp: 1 },
            { x: 1, y: 1, value: 2000, timestamp: 1 },
          ],
          (d) => d.value as number,
          (d) => d.value as number,
          (d) => d.value as number
        )
      ).toEqual([-48.975, 2049.975]);
    });
  });

  describe('fetchData tests', () => {
    const onFetchData = () => null;
    const series = {
      id: '1',
      data: [{ x: 1, y: 1, value: 1, timestamp: 1 }],
      loader: undefined,
      timeAccessor: (d: Datapoint) => d.timestamp as number,
      xAccessor: (d: Datapoint) => d.x as number,
      yAccessor: (d: Datapoint) => d.y as number,
    };
    const defaultLoader = () => Promise.resolve<Series>(series);
    const props: DataproviderProps = {
      defaultLoader,
      timeDomain: [0, 0],
      timeSubDomain: [0, 0],
      xDomain: [0, 0],
      xSubDomain: [0, 0],
      yDomain: [0, 0],
      ySubDomain: [0, 0],
      children: [],
      isTimeSubDomainSticky: false,
      onFetchData,
      series: [{ id: '1' }],
    };
    const state: DataProviderState = {
      collectionsById: {},
      seriesById: {
        '1': series,
      },
      timeDomain: [0, 0],
      timeSubDomain: [0, 0],
      timeSubDomains: {},
      xSubDomains: {},
      ySubDomains: {},
    };

    it('should call setState', async () => {
      const setStateSpy = sinon.spy();
      await fetchData('1', 'test', props, state, setStateSpy);
      expect(setStateSpy.called).toEqual(true);
    });

    it('should not call setState', async () => {
      const setStateSpy = sinon.spy();
      await fetchData(
        '1',
        'test',
        props,
        {
          ...state,
          seriesById: {}, // nothing on '1'
        },
        setStateSpy
      );
      expect(setStateSpy.called).toEqual(false);
    });

    it('should fail on no loader', async () => {
      const setStateSpy = sinon.spy();
      let failed = false;
      try {
        await fetchData(
          '1',
          'test',
          { ...props, defaultLoader: undefined },
          state,
          setStateSpy
        );
      } catch (e) {
        failed = true;
      }
      expect(failed).toBe(true);
    });

    it('should call callback on loader failure', async () => {
      const setStateSpy = sinon.spy();
      const onFetchDataError = sinon.spy();
      let loaderCalled = false;
      const loaderThatFails = () => {
        loaderCalled = true;
        throw new Error();
      };
      await fetchData(
        '1',
        'test',
        {
          ...props,
          defaultLoader: loaderThatFails,
          onFetchDataError,
        },
        state,
        setStateSpy
      );
      expect(loaderCalled).toEqual(true);
      expect(onFetchDataError.called).toBe(true);
    });

    it('should do stuff on MOUNTED', async () => {
      const stateCallback = sinon.spy();
      const setStateSpy: UpdateState<DataProviderState> = (
        ignore,
        onComplete
      ) => {
        stateCallback(state);
        if (typeof ignore === 'function') {
          ignore(state); // make sure not to mock this, let this run
        }
        if (onComplete) {
          onComplete();
        }
      };
      await fetchData('1', 'MOUNTED', props, state, setStateSpy);
      expect(stateCallback.called).toEqual(true);
    });
  });

  describe('boundedDomain tests', () => {
    it('should select lowest and highest if both are defined', () => {
      expect(boundedDomain([1, 6], [0, 3])).toEqual([0, 6]);
    });

    it('should select the second domain if the first is not set', () => {
      expect(boundedDomain(undefined, [0, 3])).toEqual([0, 3]);
    });

    it('should select the first domain if the second is not set', () => {
      expect(boundedDomain([43, 32], undefined)).toEqual([43, 32]);
    });
  });

  describe('smallerDomain tests', () => {
    it('should select the smallest domain if both are defined (subDomain is smallest)', () => {
      expect(smallerDomain([-1000, 1000], [-400, 400])).toEqual([-400, 400]);
    });

    it('should select the smallest domain if both are defined (domain is smallest)', () => {
      expect(smallerDomain([-400, 400], [-1000, 1000])).toEqual([-400, 400]);
    });

    it('should select the smallest domain if both are defined (domains are overlapping)', () => {
      expect(smallerDomain([-400, 1001], [-1000, 1000])).toEqual([-400, 1000]);
    });
  });

  describe('getTimeSubDomain tests', () => {
    it('should return subdomain if subdomain is smaller and limitTimeSubDomain is Function.identity', () => {
      expect(getTimeSubDomain([-1000, 1000], [200, 900], (id) => id)).toEqual([
        200,
        900,
      ]);
    });

    // TO DO find out why this happens. v1
    it('should return [i dont know what and why this works v1] if limitTimeSubDomain is Function.identity', () => {
      expect(getTimeSubDomain([-1000, 1000], [200, 1500], (id) => id)).toEqual([
        -300, // <- wtf
        1000,
      ]);
    });

    // TO DO find out why this happens. v2
    it('should return [i dont know what and why this works v2] if limitTimeSubDomain is Function.identity', () => {
      expect(
        getTimeSubDomain([-1000, 1000], [-1001, 1500], (id) => id)
      ).toEqual([
        -1000, // <- wtf
        1000,
      ]);
    });
  });
});
