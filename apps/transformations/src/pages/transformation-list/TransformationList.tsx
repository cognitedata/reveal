import { Reducer, useEffect, useMemo, useReducer, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useTranslation } from '@transformations/common';
import NoAccessPage from '@transformations/components/error-pages/NoAccess';
import UnknownErrorPage from '@transformations/components/error-pages/UnknownError';
import Page from '@transformations/components/page/Page';
import { ActionsBar } from '@transformations/containers';
import {
  useDataSetList,
  useDebounce,
  useTransformationList,
} from '@transformations/hooks';
import {
  collectPages,
  flattenFDMModels,
  getFilteredTransformationList,
  getTrackEvent,
} from '@transformations/utils';
import { omit, uniq } from 'lodash';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { Loader } from '@cognite/cogs.js';

import { DataModel, useModels } from '../../hooks/fdm';
import { getDataModelKey } from '../../utils/fdm';

import BlockedTransformationsAlert from './BlockedTransformationsAlert';
import TransformationListEmpty from './TransformationListEmpty';
import TransformationListTable, {
  TransformationListColumnKey,
  TRANSFORMATION_LIST_COLUMN_KEYS,
} from './TransformationListTable';

type TransformationListProps = {};

export type ColumnState = {
  key: TransformationListColumnKey;
  selected: boolean;
  title: string;
};

export enum ScheduleStatus {
  Blocked = 'Blocked',
  Scheduled = 'Scheduled',
  NotScheduled = 'Not Scheduled',
}
interface FiltersStateBase {
  lastRun: string[];
  schedule: ScheduleStatus[];
  dataSet: string;
  dataModel: string;
  search: string;
}
export interface FiltersState extends FiltersStateBase {
  applied: FiltersStateBase;
}
const getInitialFiltersStateBase = (
  init?: Partial<FiltersStateBase>
): FiltersStateBase => ({
  lastRun: init?.lastRun ?? [],
  schedule: init?.schedule ?? [],
  dataSet: init?.dataSet ?? '',
  dataModel: init?.dataModel ?? '',
  search: init?.search ?? '',
});
const getInitialState = (init?: Partial<FiltersStateBase>): FiltersState => ({
  ...getInitialFiltersStateBase(init),
  applied: getInitialFiltersStateBase(init),
});
type FiltersActionType = 'add' | 'remove' | 'reset' | 'change' | 'submit';
export type FiltersAction = {
  type: FiltersActionType;
  payload?: any;
  field?: keyof FiltersState;
};

export type FilterArrayFields = 'lastRun' | 'schedule';
export type FilterStringFields = 'search' | 'dataSet' | 'dataModel';

const isFilterArrayField = (prop?: string) =>
  prop && ['lastRun', 'schedule'].includes(prop);

const isFilterStringField = (prop?: string) =>
  prop && ['search', 'dataSet', 'dataModel'].includes(prop);

const reducer = (state: FiltersState, action: FiltersAction): FiltersState => {
  const { type, field, payload } = action;
  switch (type) {
    case 'add':
      if (isFilterArrayField(field)) {
        const _field = field as FilterArrayFields;
        return { ...state, [_field]: uniq([...state[_field], payload]) };
      }
      break;
    case 'remove':
      if (isFilterArrayField(field)) {
        const _field = field as FilterArrayFields;
        return {
          ...state,
          [_field]: payload
            ? state[_field].filter((value) => value !== payload)
            : getInitialState()[_field],
        };
      }
      break;
    case 'change':
      if (isFilterStringField(field)) {
        const _field = field as FilterStringFields;
        return {
          ...state,
          [_field]: payload,
        };
      }
      break;
    case 'submit':
      return { ...state, applied: omit(state, ['applied']) };
    case 'reset':
      return getInitialState();
    default:
      return state;
  }
  return state;
};

const readSearchParams = (
  searchParams: URLSearchParams
): Partial<FiltersStateBase> => {
  const params: Partial<FiltersStateBase> = {};
  searchParams.forEach((value, key) => {
    if (isFilterArrayField(key)) {
      const _key = key as FilterArrayFields;
      if (value && value.length > 0) {
        const _value = value.split(',') as ScheduleStatus[];
        params[_key] = _value;
      }
    }
    if (isFilterStringField(key)) {
      const _key = key as FilterStringFields;
      if (value) {
        params[_key] = value;
      }
    }
  });
  return params;
};

const getUpdatedSearchParams = (
  oldParams: URLSearchParams,
  newParams: FiltersStateBase
): URLSearchParams => {
  const params = new URLSearchParams(oldParams);
  for (const [key, value] of Object.entries(newParams)) {
    params.set(key, String(value));
  }
  return params;
};

const TransformationList = ({}: TransformationListProps): JSX.Element => {
  const { t } = useTranslation();

  const [columnStates, setColumnStates] = useState<ColumnState[]>(
    TRANSFORMATION_LIST_COLUMN_KEYS.map((key) => ({
      key,
      selected: true,
      title: t(`transformation-list-table-column-title-${key}`),
    }))
  );

  const [searchParams, setSearchParams] = useSearchParams();

  const [state, dispatch] = useReducer<Reducer<FiltersState, FiltersAction>>(
    reducer,
    getInitialState(readSearchParams(searchParams))
  );

  const { applied } = state;

  const debouncedState = useDebounce<FiltersStateBase>(applied, 500);

  useEffect(() => {
    const params = getUpdatedSearchParams(searchParams, debouncedState);
    setSearchParams(params, { replace: true });
  }, [debouncedState, searchParams, setSearchParams]);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isInitialLoading,
    isFetching,
  } = useTransformationList();

  const transformationList = useMemo(() => collectPages(data), [data]);

  // Pick out only the dataSetIds that are present in the transformations we have.
  const includedDataSetIds = Array.from(
    new Set(
      transformationList.map((transformation) => transformation.dataSetId)
    )
  ).filter(Boolean) as number[];

  const { data: dataSetsPages } = useDataSetList({
    enabled: includedDataSetIds.length > 0,
  });

  const dataSets = useMemo(() => collectPages(dataSetsPages), [dataSetsPages]);

  const dataSetOptions = includedDataSetIds
    .map((id) => {
      const dataSet = dataSets?.find((d) => d.id === id);
      const label = dataSet?.name ?? dataSet?.externalId;
      return {
        value: String(id),
        label: label ?? String(id),
        key: String(id),
        count: transformationList.filter((t) => t.dataSetId === id).length,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const { data: modelsData } = useModels();

  const models = useMemo(
    () =>
      flattenFDMModels(
        modelsData?.pages.reduce(
          (accl, p) => [...accl, ...p.items],
          [] as DataModel[]
        ) || []
      ),
    [modelsData]
  );

  const dataModelOptions = models
    .map((dataModel) => {
      return {
        value: getDataModelKey({
          externalId: dataModel.externalId,
          space: dataModel.space,
        }),
        label: dataModel.externalId,
        key: getDataModelKey({
          externalId: dataModel.externalId,
          space: dataModel.space,
        }),
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const lastRunOptions = [
    {
      label: t('fail'),
      value: t('fail'),
    },
    {
      label: t('running'),
      value: t('running'),
    },
    {
      label: t('completed'),
      value: t('completed'),
    },
  ];

  const scheduleOptions = [
    {
      label: t('schedule-blocked'),
      value: ScheduleStatus.Blocked,
    },
    {
      label: t('schedule-scheduled'),
      value: ScheduleStatus.Scheduled,
    },
    {
      label: t('schedule-not-scheduled'),
      value: ScheduleStatus.NotScheduled,
    },
  ];

  const isListEmpty = !isInitialLoading && Boolean(!transformationList?.length);

  useEffect(() => {
    if (hasNextPage && !isFetching) {
      fetchNextPage();
    }
  }, [hasNextPage, fetchNextPage, isFetching]);

  const blockedTransformations = transformationList.filter((t) => t.blocked);

  const handleChangeToBlocked = () => {
    trackEvent(getTrackEvent('event-tr-list-troubleshoot-blocked-click'));
    dispatch({ type: 'add', field: 'schedule', payload: 'Blocked' });
    dispatch({ type: 'submit' });
  };

  const { search, lastRun, schedule, dataSet, dataModel } = state?.applied;

  const filteredTransformationList = getFilteredTransformationList(
    transformationList,
    search,
    lastRun,
    schedule,
    dataSet,
    dataModel
  );

  if (error) {
    if (error?.status === 403) {
      return <NoAccessPage />;
    }
    return <UnknownErrorPage error={error} />;
  }

  return (
    <Page title={t('transform-data')}>
      {isInitialLoading && <Loader />}
      {isListEmpty && <TransformationListEmpty />}
      {!(isInitialLoading || isListEmpty) && (
        <>
          {blockedTransformations?.length > 0 && (
            <BlockedTransformationsAlert
              blockedTransformations={blockedTransformations}
              onClick={handleChangeToBlocked}
            />
          )}
          <ActionsBar
            filterState={state}
            transformationsCount={transformationList.length}
            filteredTransformationsCount={filteredTransformationList.length}
            lastRunOptions={lastRunOptions}
            scheduleOptions={scheduleOptions}
            dataSetOptions={dataSetOptions}
            dataModelOptions={dataModelOptions}
            onFilterChange={dispatch}
            columnStates={columnStates}
            setColumnStates={setColumnStates}
          />
          <TransformationListTable
            dataSets={dataSets}
            transformationList={filteredTransformationList}
            filterState={state.applied}
            columnStates={columnStates}
          />
        </>
      )}
    </Page>
  );
};

export default TransformationList;
