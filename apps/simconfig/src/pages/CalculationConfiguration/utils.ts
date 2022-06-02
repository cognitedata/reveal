import type { Dispatch, Reducer } from 'react';
import { useEffect, useReducer } from 'react';

import { format, formatISO9075, sub } from 'date-fns';

import { useAuthContext } from '@cognite/react-container';
import type {
  CogniteClient,
  CogniteExternalId,
  DatapointAggregate,
} from '@cognite/sdk';
import type { AggregateType } from '@cognite/simconfig-api-sdk/rtk';

import type { ScheduleRepeat, ValueOptionType } from './types';

export const INTERVAL_OPTIONS: ValueOptionType<string>[] = [
  { label: 'minutes', value: 'm' },
  { label: 'hours', value: 'h' },
  { label: 'days', value: 'd' },
];

export const getScheduleRepeat = (repeat: string): ScheduleRepeat => {
  const count = parseInt(repeat, 10);
  const interval = repeat.match(/[dhm]/)?.[0] ?? INTERVAL_OPTIONS[0].value;
  const intervalOption = INTERVAL_OPTIONS.find(
    (it) => it.value === repeat.match(/[dhm]/)?.[0]
  );
  const minutes =
    count *
    ({
      m: 1,
      h: 60,
      d: 60 * 24,
      w: 60 * 24 * 7,
    }[interval] ?? 0);
  return { count, interval, intervalOption, minutes };
};

export const getScheduleStart = (start: number | string) => {
  const date = new Date(start);
  const dateString = formatISO9075(date, { representation: 'date' });
  const timeString = format(new Date(start), 'HH:mm');
  return { date, dateString, timeString };
};

interface TimeseriesAggregate {
  externalId: CogniteExternalId;
  aggregateType: AggregateType;
}

interface UseTimeseriesProps<
  T extends TimeseriesAggregate | TimeseriesAggregate[]
> {
  timeseries: T;
  granularity: number;
  window: number;
  limit?: number;
  endOffset?: number;
}

export function useTimeseries(
  props: UseTimeseriesProps<TimeseriesAggregate[]>
) {
  const { client } = useAuthContext();
  const [state, dispatch] = useReducer<
    Reducer<TimeseriesState, TimeseriesAction>
  >(timeseriesReducer, getTimeseriesInitialState());

  const { granularity, window, limit = 5000, endOffset = 0 } = props;

  useEffect(() => {
    async function loadAllTimeseries() {
      dispatch({ type: 'SET_LOADING', payload: true });
      await Promise.all(
        props.timeseries.map(async (timeseries) =>
          loadTimeseries({
            timeseries,
            client,
            dispatch,
            granularity,
            window,
            limit,
            endOffset,
          })
        )
      );
      dispatch({ type: 'SET_LOADING', payload: false });
    }
    void loadAllTimeseries();
  }, [client, props.timeseries, granularity, window, limit, endOffset]);

  return state;
}

async function loadTimeseries({
  timeseries: { externalId, aggregateType },
  client,
  dispatch,
  granularity,
  window,
  limit = 5000,
  endOffset = 0,
  includeExtents = true,
}: UseTimeseriesProps<TimeseriesAggregate> & {
  client?: CogniteClient;
  dispatch: Dispatch<TimeseriesAction>;
  includeExtents?: boolean;
}) {
  if (!client || !externalId) {
    return undefined;
  }

  try {
    const {
      items: [{ unit, description }],
    } = await client.timeseries.list({
      filter: {
        externalIdPrefix: externalId,
      },
    });

    const start = sub(new Date(), {
      minutes: window + endOffset,
    });
    const end = sub(new Date(), { minutes: endOffset });

    const getDatapoints = async () => {
      const [{ datapoints }] = await client.datapoints.retrieve({
        items: [
          {
            externalId,
            start,
            end,
            aggregates: [
              ...(includeExtents ? (['min', 'max'] as const) : []),
              aggregateType,
            ],
            granularity: `${granularity}m`,
            limit,
          },
        ],
      });

      if (datapoints.length !== 1) {
        return datapoints;
      }

      const [datapoint] = datapoints;
      return [
        {
          ...datapoint,
          timestamp: start,
        },
        {
          ...datapoint,
          timestamp: end,
        },
      ];
    };

    const datapoints = await getDatapoints();

    dispatch({
      type: 'SET_TIMESERIES',
      payload: {
        externalId,
        datapoints,
        axisLabel: `${description.substring(0, 25)} (${unit ?? 'n/a'})`,
      },
    });
  } catch (e) {
    console.error(`Error while reading timeseries '${externalId}':`, e);
  }
  return undefined;
}

interface TimeseriesState {
  isLoading: boolean;
  timeseries: Record<string, TimeseriesStateEntry | undefined>;
}

interface TimeseriesStateEntry {
  externalId: CogniteExternalId;
  datapoints: DatapointAggregate[];
  axisLabel: string;
}

type TimeseriesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_TIMESERIES'; payload: TimeseriesStateEntry };

const timeseriesReducer = (
  state: TimeseriesState,
  action: TimeseriesAction
) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_TIMESERIES':
      return {
        ...state,
        timeseries: {
          ...state.timeseries,
          [action.payload.externalId]: action.payload,
        },
      };
    default:
      return state;
  }
};

const getTimeseriesInitialState = (
  state?: TimeseriesState
): TimeseriesState => ({
  isLoading: false,
  timeseries: {},
  ...state,
});
