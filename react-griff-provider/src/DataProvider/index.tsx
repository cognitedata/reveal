import React from 'react';
import BluebirdPromise from 'bluebird';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import { DataContext, DataType } from '../context';
import Scaler from '../Scaler';
import {
  AccessorFunction,
  Collection,
  CollectionsWithDomains,
  Datapoint,
  Domain,
  Domains,
  LoaderParams,
  Series,
  UpdateState,
} from '../types';

export type DataproviderProps = {
  /**
   * A custom renderer for data points.
   *
   * @param {object} datapoint Current data point being rendered
   * @param {number} index Index of this current data point
   * @param {Array} datapoints All of the data points to be rendered
   * @param {object} metadata This object contains metadata useful for the
   * rendering process. This contains the following keys:
   *  - {@code x}: The x-position (in pixels) of the data point.
   *  - {@code x0}: The x-position (in pixels) for the data point's x0 value
   *  - {@code x1}: The x-position (in pixels) for the data point's x1 value
   *  - {@code y}: The y-position (in pixels) of the data point.
   *  - {@code y0}: The y-position (in pixels) for the data point's y0 value
   *  - {@code y1}: The y-position (in pixels) for the data point's y1 value
   *  - {@code color}: The color of this data point
   *  - {@code opacity}: The opacity of this data point
   *  - {@code opacityAccessor}: The opacity accessor for this data point
   *  - {@code pointWidth}: The width of this data point
   *  - {@code pointWidthAccessor}: The accessor for this data point's width
   *  - {@code strokeWidth}: The width of the stroke for this data point
   * @param {Array} elements This is an array of the items that Griff would
   * render for this data point. If custom rendering is not desired for this
   * data point, return this array as-is
   * @returns {(object|Array)} object(s) to render for this point.
   */
  drawPoints?: boolean;
  drawLines?: boolean;
  timeDomain: Domain;
  timeSubDomain: Domain;
  xDomain: Domain;
  xSubDomain: Domain;
  updateInterval?: number;
  timeAccessor?: AccessorFunction;
  xAccessor?: AccessorFunction;
  x0Accessor?: AccessorFunction;
  x1Accessor?: AccessorFunction;
  yAccessor?: AccessorFunction;
  y0Accessor?: AccessorFunction;
  y1Accessor?: AccessorFunction;
  yAxisWidth?: number;
  yDomain: Domain;
  ySubDomain: Domain;
  pointsPerSeries?: number;
  children: React.ReactChild | React.ReactChild[];
  defaultLoader?: (params: LoaderParams) => Promise<Series> | Series;
  onTimeSubDomainChanged?: (domain: Domain) => void;
  onUpdateDomains?: () => void;
  opacity?: number;
  opacityAccessor?: (d: Datapoint, index: number, dps: Datapoint[]) => void;
  pointWidth?: number;
  pointWidthAccessor?: (d: Datapoint, index: number, dps: Datapoint[]) => void;
  strokeWidth?: number;
  // if set to true and an updateInterval is provided, xSubDomain
  // will be increased at every interval (similarly to xDomain)
  isTimeSubDomainSticky: boolean;
  // timeSubDomain => timeSubDomain
  // function to allow limitation of the value of timeSubDomain
  limitTimeSubDomain?: (domain: Domain) => Domain;
  // loaderConfig => void
  // called whenever data is fetched by the loader
  onFetchData: (series: Series) => void;
  // (error, params) => void
  // Callback when data loader throws an error
  onFetchDataError?: (e: Error, params: LoaderParams) => void;
  series: Array<{ id: string | number }>;
};

export type DataProviderState = {
  timeSubDomain: Domain;
  timeDomain: Domain;
  timeSubDomains: { [k: string]: Domain };
  xSubDomains: { [k: string]: Domain };
  ySubDomains: { [k: string]: Domain };
  seriesById: { [k: string]: Series };
  collectionsById: { [k: string]: Collection };
};

export default class DataProvider extends React.Component<
  DataproviderProps,
  DataProviderState
> {
  private fetchInterval?: number;

  private timeSubDomainChangedTimeout?: number;

  // eslint-disable-next-line react/static-property-placement
  static defaultProps = {
    defaultLoader: undefined,
    drawPoints: undefined,
    drawLines: undefined,
    onTimeSubDomainChanged: undefined,
    onUpdateDomains: undefined,
    opacity: 1.0,
    opacityAccessor: undefined,
    pointsPerSeries: 250,
    pointWidth: undefined,
    pointWidthAccessor: undefined,
    strokeWidth: undefined,
    timeDomain: undefined,
    timeSubDomain: undefined,
    xDomain: undefined,
    xSubDomain: undefined,
    updateInterval: 0,
    timeAccessor: (d: Datapoint) => d.timestamp,
    x0Accessor: undefined,
    x1Accessor: undefined,
    xAccessor: (d: Datapoint) => d.timestamp,
    y0Accessor: undefined,
    y1Accessor: undefined,
    yAccessor: (d: Datapoint & { value?: number }) => d.value,
    yAxisWidth: 50,
    yDomain: undefined,
    ySubDomain: undefined,
    isTimeSubDomainSticky: false,
    limitTimeSubDomain: (xSubDomain: Domain) => xSubDomain,
    onFetchData: () => null,
    // Just rethrow the error if there is no custom error handler
    onFetchDataError: (e: Error) => {
      throw e;
    },
    series: [],
  };

  constructor(props: DataproviderProps) {
    super(props);
    const { limitTimeSubDomain, timeDomain, timeSubDomain } = props;
    this.state = {
      timeSubDomain: getTimeSubDomain(
        timeDomain,
        timeSubDomain,
        limitTimeSubDomain
      ),
      timeDomain,
      timeSubDomains: {},
      xSubDomains: {},
      ySubDomains: {},
      collectionsById: {},
      seriesById: {},
    };
  }

  componentDidMount() {
    const { updateInterval } = this.props;

    if (updateInterval) {
      this.startUpdateInterval();
    }
  }

  async componentDidUpdate(prevProps: Readonly<DataproviderProps>) {
    // If new series are present in prop,
    // run the fetchData lifecycle for those series
    const {
      limitTimeSubDomain,
      onTimeSubDomainChanged,
      pointsPerSeries,
      series,
      timeDomain: propsTimeDomain,
      timeSubDomain: propsTimeSubDomain,
      updateInterval,
    } = this.props;
    const { updateInterval: prevUpdateInterval } = prevProps;
    if (updateInterval !== prevUpdateInterval) {
      this.startUpdateInterval();
    }

    // check if pointsPerSeries changed in props -- if so fetch new data
    if (pointsPerSeries !== prevProps.pointsPerSeries) {
      await BluebirdPromise.map(series, (s) =>
        fetchData(
          s.id,
          'UPDATE_POINTS_PER_SERIES',
          this.props,
          this.state,
          this.updateState
        )
      );
    }

    if (!isEqual(propsTimeSubDomain, prevProps.timeSubDomain)) {
      this.timeSubDomainChanged(propsTimeSubDomain);
    }

    // Check if timeDomain changed in props -- if so reset state.
    if (!isEqual(propsTimeDomain, prevProps.timeDomain)) {
      const { seriesById } = this.state;

      const newTimeSubDomain = getTimeSubDomain(
        propsTimeDomain,
        propsTimeSubDomain,
        limitTimeSubDomain
      );
      // eslint-disable-next-line
      this.updateState(
        {
          ...this.state,
          timeDomain: propsTimeDomain,
          timeSubDomain: newTimeSubDomain,
          ySubDomains: {},
        },
        () => {
          Object.keys(seriesById).map((id) =>
            fetchData(id, 'MOUNTED', this.props, this.state, this.updateState)
          );
          if (onTimeSubDomainChanged) {
            onTimeSubDomainChanged(newTimeSubDomain);
          }
        }
      );
      this.startUpdateInterval();
    }
  }

  componentWillUnmount() {
    if (this.fetchInterval) {
      clearInterval(this.fetchInterval);
    }
  }

  onUpdateInterval = () => {
    const {
      isTimeSubDomainSticky,
      limitTimeSubDomain,
      updateInterval,
    } = this.props;
    const { seriesById, timeDomain, timeSubDomain } = this.state;
    const newTimeDomain = timeDomain.map(
      (d) => d + (updateInterval || 0)
    ) as Domain;
    const newTimeSubDomain = isTimeSubDomainSticky
      ? getTimeSubDomain(
          newTimeDomain,
          timeSubDomain.map((d) => d + (updateInterval || 0)) as Domain,
          limitTimeSubDomain
        )
      : timeSubDomain;
    this.updateState(
      {
        ...this.state,
        timeDomain: newTimeDomain,
        timeSubDomain: newTimeSubDomain,
      },
      () => {
        Object.keys(seriesById).map((id) =>
          fetchData(id, 'INTERVAL', this.props, this.state, this.updateState)
        );
      }
    );
  };

  startUpdateInterval = () => {
    const { updateInterval } = this.props;
    window.clearInterval(this.fetchInterval);
    if (updateInterval) {
      this.fetchInterval = window.setInterval(
        this.onUpdateInterval,
        updateInterval
      );
    }
  };

  registerCollection = ({ id, ...collection }: Collection) => {
    this.updateState(({ collectionsById }) => ({
      ...this.state,
      collectionsById: {
        ...collectionsById,
        [id]: deleteUndefinedFromObject({
          ...collection,
          id,
        }),
      },
    }));

    // Return an unregistration so that we can do some cleanup.
    return () => {
      this.updateState(({ collectionsById }) => {
        const copy = { ...collectionsById };
        delete copy[id];
        return {
          ...this.state,
          collectionsById: copy,
        };
      });
    };
  };

  updateCollection = ({ id, ...collection }: Collection) => {
    this.updateState(({ collectionsById }) => ({
      ...this.state,
      collectionsById: {
        ...collectionsById,
        [id]: deleteUndefinedFromObject({
          ...collectionsById[id],
          ...collection,
          id,
        }),
      },
    }));
  };

  registerSeries = ({ id, ...series }: Series) => {
    this.updateState(
      ({ seriesById }) => ({
        ...this.state,
        seriesById: {
          ...seriesById,
          [id]: deleteUndefinedFromObject({
            ...series,
            id,
          }),
        },
      }),
      () => {
        fetchData(id, 'MOUNTED', this.props, this.state, this.updateState);
      }
    );

    // Return an unregistration so that we can do some cleanup.
    return () => {
      this.updateState(({ seriesById }) => {
        const copy = { ...seriesById };
        delete copy[id];
        return {
          ...this.state,
          seriesById: copy,
        };
      });
    };
  };

  updateSeries = ({ id, ...series }: Series) => {
    this.updateState(({ seriesById }) => ({
      ...this.state,
      seriesById: {
        ...seriesById,
        [id]: deleteUndefinedFromObject({
          ...seriesById[id],
          ...series,
          id,
        }),
      },
    }));
  };

  // Need to able to pass around a "setState" callback
  // Lets call it updateState. When we migrate to functional style this will most propably
  // call a setState from a hook and call the provided callback.
  updateState: UpdateState<DataProviderState> = (
    state:
      | ((
          prevState: Readonly<DataProviderState>
        ) => Pick<DataProviderState, keyof DataProviderState>)
      | Pick<DataProviderState, keyof DataProviderState>,
    callback?: () => void
  ): void => {
    this.setState(state, callback);
  };

  timeSubDomainChanged = (domain: Domain) => {
    this.timeSubDomainChangedTimeout = onTimeSubDomainChangedFn(
      this.props,
      this.state,
      this.timeSubDomainChangedTimeout,
      window.setTimeout,
      window.clearTimeout,
      this.updateState,
      domain
    );
  };

  render() {
    const { collectionsById, timeDomain, timeSubDomain } = this.state;
    const {
      children,
      limitTimeSubDomain,
      timeDomain: externalTimeDomain,
      timeSubDomain: externalTimeSubDomain,
      yAxisWidth,
      onUpdateDomains,
    } = this.props;

    const seriesObjects = getSeriesObjects(this.props, this.state);

    // // Compute the domains for all of the collections with one pass over all of
    // // the series objects.
    const domainsByCollectionId = getDomainsByCollectionId(seriesObjects);

    // Then we want to enrich the collection objects with their above-computed
    // domains.
    const collectionsWithDomains = getCollectionsWithDomains(
      collectionsById,
      domainsByCollectionId
    );

    // Then take a final pass over all of the series and replace their
    // yDomain and ySubDomain arrays with the one from their collections (if
    // they're a member of a collection).
    const collectedSeries = getCollectedSeries(
      seriesObjects,
      collectionsById,
      domainsByCollectionId
    );

    const context: DataType = {
      series: collectedSeries,
      collections: collectionsWithDomains,
      timeDomain,
      // This is used to signal external changes vs internal changes
      externalTimeDomain,
      timeSubDomain,
      // This is used to signal external changes vs internal changes
      externalTimeSubDomain,
      yAxisWidth,
      limitTimeSubDomain,
      onUpdateDomains,
      timeSubDomainChanged: this.timeSubDomainChanged,
      registerCollection: this.registerCollection,
      updateCollection: this.updateCollection,
      registerSeries: this.registerSeries,
      updateSeries: this.updateSeries,
    };
    return (
      <DataContext.Provider value={context}>
        <Scaler>{children}</Scaler>
      </DataContext.Provider>
    );
  }
}

export const onTimeSubDomainChangedFn = (
  props: DataproviderProps,
  state: DataProviderState,
  timeoutRef: number | undefined,
  setTimeout: (cb: () => void, timeout: number) => number,
  clearTimeout: (ref?: number) => void,
  setState: UpdateState<DataProviderState>,
  timeSubDomain: Domain
): number | undefined => {
  const { limitTimeSubDomain, onTimeSubDomainChanged } = props;
  const { timeDomain, timeSubDomain: current, seriesById } = state;
  const newTimeSubDomain = getTimeSubDomain(
    timeDomain,
    timeSubDomain,
    limitTimeSubDomain
  );
  if (isEqual(newTimeSubDomain, current)) {
    return undefined;
  }

  clearTimeout(timeoutRef);
  const newTimeoutRef = setTimeout(
    () =>
      Object.keys(seriesById).map((id) =>
        fetchData(id, 'UPDATE_SUBDOMAIN', props, state, setState)
      ),
    250
  );

  setState({ ...state, timeSubDomain: newTimeSubDomain }, () => {
    if (onTimeSubDomainChanged) {
      onTimeSubDomainChanged(newTimeSubDomain);
    }
  });

  return newTimeoutRef;
};

export const fetchData = async (
  id: string | number,
  reason: string,
  props: DataproviderProps,
  state: DataProviderState,
  setState: UpdateState<DataProviderState>
) => {
  const {
    defaultLoader,
    onFetchData,
    pointsPerSeries,
    timeAccessor,
    x0Accessor,
    x1Accessor,
    xAccessor,
    y0Accessor,
    y1Accessor,
    yAccessor,
    onFetchDataError = () => null,
  } = props;
  const { timeDomain, timeSubDomain, seriesById } = state;
  const seriesObject = seriesById[id];
  if (!seriesObject) {
    return;
  }
  const loader = seriesObject.loader || defaultLoader;
  if (!loader) {
    throw new Error(`Series ${id} does not have a loader.`);
  }
  let loaderResult: Series;
  const params = {
    id,
    timeDomain,
    timeSubDomain,
    pointsPerSeries,
    // eslint-disable-next-line
    // @ts-ignore
    oldSeries: { data: [], ...seriesObject },
    reason,
  };
  try {
    loaderResult = await loader(params);
  } catch (e) {
    onFetchDataError(e, params);
  }

  setState(
    ({
      collectionsById,
      seriesById: { [id]: freshSeries },
      seriesById: freshSeriesById,
      timeSubDomains: freshTimeSubDomains,
      xSubDomains: freshXSubDomains,
      ySubDomains: freshYSubDomains,
    }) => {
      const stateUpdates = {} as DataProviderState;

      const series = {
        ...freshSeries,
        ...loaderResult,
      };

      if (
        // We either couldn't have any data before ...
        reason === 'MOUNTED' ||
        // ... or we didn't have data before, but do now!
        ((freshSeries.data || []).length === 0 &&
          (loaderResult.data || []).length > 0)
      ) {
        const collection = series.collectionId
          ? collectionsById[series.collectionId] || ({} as Collection)
          : ({} as Collection);

        stateUpdates.timeSubDomains = {
          ...freshTimeSubDomains,
          [id]: calculateDomainFromData(
            series.data,
            series.timeAccessor || timeAccessor || DEFAULT_ACCESSORS.time
          ),
        };
        stateUpdates.xSubDomains = {
          ...freshXSubDomains,
          [id]: calculateDomainFromData(
            series.data,
            series.xAccessor ||
              collection.xAccessor ||
              xAccessor ||
              DEFAULT_ACCESSORS.x,
            series.x0Accessor || collection.x0Accessor || x0Accessor,
            series.x1Accessor || collection.x1Accessor || x1Accessor
          ),
        };
        stateUpdates.ySubDomains = {
          ...freshYSubDomains,
          [id]: calculateDomainFromData(
            series.data,
            series.yAccessor ||
              collection.yAccessor ||
              yAccessor ||
              DEFAULT_ACCESSORS.y,
            series.y0Accessor || collection.y0Accessor || y0Accessor,
            series.y1Accessor || collection.y1Accessor || y1Accessor
          ),
        };

        series.timeSubDomain = series.timeSubDomain || series.timeDomain;
      }

      stateUpdates.seriesById = {
        ...freshSeriesById,
        [id]: series,
      };

      return stateUpdates;
    },
    () => {
      const {
        seriesById: { [id]: series },
      } = state;
      onFetchData({ ...series });
    }
  );
};

export const calculateDomainFromData = (
  data: Datapoint[],
  accessor: AccessorFunction,
  minAccessor?: AccessorFunction,
  maxAccessor?: AccessorFunction
): Domain => {
  // if there is no data, hard code the domain
  if (!data || !data.length) {
    return [-0.25, 0.25];
  }

  let extent: Domain;
  if (minAccessor && maxAccessor) {
    const min = d3.min(data, minAccessor) as number;
    const max = d3.max(data, maxAccessor) as number;
    extent = [min, max];
  } else {
    extent = d3.extent(data, accessor) as Domain;
  }
  const diff = extent[1] - extent[0];
  if (Math.abs(diff) < 1e-3) {
    if (extent[0] === 0) {
      // If 0 is the only value present in the series, hard code domain.
      return [-0.25, 0.25];
    }
    const domain = [(1 / 2) * extent[0], (3 / 2) * extent[0]] as Domain;
    if (domain[1] < domain[0]) {
      return [domain[1], domain[0]];
    }
    return domain;
  }
  return [extent[0] - diff * 0.025, extent[1] + diff * 0.025];
};

export function deleteUndefinedFromObject<T extends Record<string, unknown>>(
  obj?: T
): T {
  if (!obj) {
    return {} as T;
  }
  return Object.keys(obj).reduce((acc, k) => {
    if (obj[k] !== undefined) {
      return { ...acc, [k]: obj[k] };
    }
    return acc;
  }, {} as T);
}

export const getTimeSubDomain = (
  timeDomain: Domain,
  timeSubDomain?: Domain,
  limitTimeSubDomain = (domain: Domain) => domain
): Domain => {
  if (!timeSubDomain) {
    return timeDomain;
  }
  const newTimeSubDomain = limitTimeSubDomain(timeSubDomain);
  const timeDomainLength = timeDomain[1] - timeDomain[0];
  const timeSubDomainLength = newTimeSubDomain[1] - newTimeSubDomain[0];
  if (timeDomainLength < timeSubDomainLength) {
    return timeDomain;
  }
  if (newTimeSubDomain[0] < timeDomain[0]) {
    return [timeDomain[0], timeDomain[0] + timeSubDomainLength];
  }
  if (newTimeSubDomain[1] > timeDomain[1]) {
    return [timeDomain[1] - timeSubDomainLength, timeDomain[1]];
  }
  return newTimeSubDomain;
};

export const smallerDomain = (
  domain: Domain,
  subDomain: Domain
): Domain | undefined => {
  if (!domain && !subDomain) {
    return undefined;
  }

  if (!domain || !subDomain) {
    return domain || subDomain;
  }

  return [Math.max(domain[0], subDomain[0]), Math.min(domain[1], subDomain[1])];
};

export const boundedDomain = (a?: Domain, b?: Domain): Domain | undefined =>
  a && b ? [Math.min(a[0], b[0]), Math.max(a[1], b[1])] : a || b;

export const DEFAULT_ACCESSORS = {
  time: (d: Datapoint) => d.timestamp as number,
  x: (d: Datapoint) => d.x as number,
  y: (d: Datapoint) => d.value as number,
};

export const DEFAULT_SERIES_CONFIG = {
  color: 'black',
  data: [],
  hidden: false,
  drawPoints: false,
  timeAccessor: DEFAULT_ACCESSORS.time,
  xAccessor: DEFAULT_ACCESSORS.x,
  yAccessor: DEFAULT_ACCESSORS.y,
  timeDomain: undefined,
  timeSubDomain: undefined,
  xDomain: undefined,
  xSubDomain: undefined,
  yDomain: undefined,
  ySubDomain: undefined,
  pointWidth: 6,
  strokeWidth: 1,
};

export const getCollectedSeries = (
  seriesObjects: Series[],
  collectionsById: { [k: string]: Collection },
  domainsByCollectionId: CollectionsWithDomains | { [p: string]: Domains }
) => {
  return seriesObjects.map((s) => {
    const { collectionId } = s;
    if (collectionId === undefined) {
      return s;
    }
    const copy = { ...s };
    if (!collectionsById[collectionId]) {
      // It's pointing to a collection that doesn't exist.
      delete copy.collectionId;
    } else {
      const {
        timeDomain: collectionTimeDomain,
        timeSubDomain: collectionTimeSubDomain,
        xDomain: collectionXDomain,
        xSubDomain: collectionXSubDomain,
        yDomain: collectionYDomain,
        ySubDomain: collectionYSubDomain,
      } = domainsByCollectionId[collectionId] || {};

      if (collectionTimeDomain) {
        copy.timeDomain = collectionTimeDomain;
      }
      if (collectionTimeSubDomain) {
        copy.timeSubDomain = collectionTimeSubDomain;
      }
      if (collectionXDomain) {
        copy.xDomain = collectionXDomain;
      }
      if (collectionXSubDomain) {
        copy.xSubDomain = collectionXSubDomain;
      }
      if (collectionYDomain) {
        copy.yDomain = collectionYDomain;
      }
      if (collectionYSubDomain) {
        copy.ySubDomain = collectionYSubDomain;
      }
    }
    return copy;
  });
};

export const getCollectionsWithDomains = (
  collectionsById: { [k: string]: Collection },
  domainsByCollectionId: CollectionsWithDomains | { [p: string]: Domains }
) => {
  return Object.keys(collectionsById).reduce((acc, id) => {
    if (!domainsByCollectionId[id]) {
      return acc;
    }
    return [
      ...acc,
      {
        ...collectionsById[id],
        ...domainsByCollectionId[id],
      },
    ];
  }, [] as Array<Collection & Domains>);
};

export const getDomainsByCollectionId = (seriesObjects: Series[]) => {
  return seriesObjects.reduce((acc: CollectionsWithDomains, series) => {
    const { collectionId } = series;
    if (!collectionId) {
      return acc;
    }

    const {
      timeDomain: seriesTimeDomain,
      timeSubDomain: seriesTimeSubDomain,
      xDomain: seriesXDomain,
      xSubDomain: seriesXSubDomain,
      yDomain: seriesYDomain,
      ySubDomain: seriesYSubDomain,
    } = series;

    const {
      timeDomain: collectionTimeDomain = [
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
      ] as Domain,
      timeSubDomain: collectionTimeSubDomain = [
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
      ] as Domain,
      xDomain: collectionXDomain = [
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
      ] as Domain,
      xSubDomain: collectionXSubDomain = [
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
      ] as Domain,
      yDomain: collectionYDomain = [
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
      ] as Domain,
      ySubDomain: collectionYSubDomain = [
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
      ] as Domain,
    } = acc[collectionId] || {};

    return {
      ...acc,
      [collectionId]: {
        timeDomain: seriesTimeDomain
          ? boundedDomain(collectionTimeDomain, seriesTimeDomain)
          : undefined,
        timeSubDomain: boundedDomain(
          collectionTimeSubDomain,
          seriesTimeSubDomain
        ),
        xDomain: seriesXDomain
          ? boundedDomain(collectionXDomain, seriesXDomain)
          : undefined,
        xSubDomain: boundedDomain(collectionXSubDomain, seriesXSubDomain),
        yDomain: seriesYDomain
          ? boundedDomain(collectionYDomain, seriesYDomain)
          : undefined,
        ySubDomain: boundedDomain(collectionYSubDomain, seriesYSubDomain),
      },
    };
  }, {});
};

export const getSeriesObjects = (
  props: DataproviderProps,
  state: DataProviderState
) => {
  const {
    drawLines,
    drawPoints,
    timeAccessor,
    xAccessor,
    x0Accessor,
    x1Accessor,
    yAccessor,
    y0Accessor,
    y1Accessor,
    timeDomain,
    timeSubDomain,
    xDomain,
    xSubDomain,
    yDomain,
    ySubDomain,
    pointWidth,
    strokeWidth,
    opacity,
    opacityAccessor,
    pointWidthAccessor,
  } = props;
  const {
    collectionsById,
    seriesById,
    timeSubDomains,
    xSubDomains,
    ySubDomains,
  } = state;
  return Object.keys(seriesById).reduce((acc: Series[], id) => {
    const series = seriesById[id];
    const dataProvider = {
      drawLines,
      drawPoints,
      pointWidth,
      strokeWidth,
      opacity,
      opacityAccessor,
      pointWidthAccessor,
      timeAccessor,
      xAccessor,
      x0Accessor,
      x1Accessor,
      yAccessor,
      y0Accessor,
      y1Accessor,
    };
    const collection =
      series.collectionId !== undefined
        ? collectionsById[series.collectionId] || ({} as Collection)
        : ({} as Collection);
    const completedSeries = {
      // First copy in the base-level configuration.
      ...DEFAULT_SERIES_CONFIG,

      // Then the global props from DataProvider, if any are set.
      ...dataProvider,

      // Then the domains because these are in the DataProvider state, which
      // supercedes the props.
      timeSubDomain: smallerDomain(
        timeDomain,
        timeSubDomain || timeSubDomains[id]
      ),
      xSubDomain: smallerDomain(xDomain, xSubDomain || xSubDomains[id]),
      ySubDomain: smallerDomain(yDomain, ySubDomain || ySubDomains[id]),
      timeDomain,
      xDomain,
      yDomain,

      // Next, copy over defaults from the parent collection, if there is one.
      ...collection,

      // Finally, the series configuration itself.
      ...series,
    };
    return [...acc, completedSeries];
  }, [] as Series[]);
};
