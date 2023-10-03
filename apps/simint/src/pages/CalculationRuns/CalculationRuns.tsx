import type { UIEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { Range } from 'react-date-range';
import { useMatch, useNavigate, useSearch } from 'react-location';
import { useSelector } from 'react-redux';

import { formatISO, parseISO, sub } from 'date-fns';
import capitalize from 'lodash/capitalize';
import uniq from 'lodash/uniq';
import styled from 'styled-components/macro';

import type { OptionType } from '@cognite/cogs.js';
import { DateRange, Illustrations, Select, Skeleton } from '@cognite/cogs.js';
import {
  useGetCalculationRunListV2Query,
  useGetModelFileListV2Query,
} from '@cognite/simconfig-api-sdk/rtk';
import type {
  CalculationRun,
  CalculationRunMetadata,
  GetCalculationRunListV2ApiArg,
  SimulatorConfigDetails,
} from '@cognite/simconfig-api-sdk/rtk';

import type { AppLocationGenerics } from '../../routes';
import { selectProject } from '../../store/simconfigApiProperties/selectors';

import { CalculationRunList } from './CalculationRunList';
import { generateOptions } from './options';
import type { OptionGroupValues } from './types';

const POLLING_INTERVAL = 2000;

export function CalculationRuns() {
  const [calculationRuns, setCalculationRuns] = useState<CalculationRun[]>([]);

  const [shouldPollCalculations, setShouldPollCalculations] =
    useState<boolean>(false);
  const [cursors, setCursors] = useState(['']);
  const project = useSelector(selectProject);
  const nextCursor = cursors[cursors.length - 1];
  const searchFilters: Partial<GetCalculationRunListV2ApiArg> =
    useSearch<AppLocationGenerics>();
  // const history = useHistory();
  const navigate = useNavigate();

  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  const {
    data: calculationsRunList,
    isFetching: isFetchingCalculationsRunList,
    isLoading: isLoadingCalculationsRunList,
  } = useGetCalculationRunListV2Query(
    {
      ...initialDateRange,
      project,
      simulator: searchFilters.simulator ?? '',
      ...(nextCursor !== '' && { nextCursor }),
      ...searchFilters,
    },
    {
      refetchOnMountOrArgChange: true,
      pollingInterval: shouldPollCalculations ? POLLING_INTERVAL : undefined,
    }
  );

  const { data: modelFileList } = useGetModelFileListV2Query({ project });

  const simualtorKeys = definitions?.simulatorsConfig?.reduce(
    (prev: Record<string, string>, { key, name }: SimulatorConfigDetails) => {
      // eslint-disable-next-line no-param-reassign
      prev[key] = name;
      return prev;
    },
    {}
  );

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!calculationsRunList?.nextCursor) {
      return;
    }
    const { scrollHeight, scrollTop, clientHeight } = event.currentTarget;
    if (
      scrollHeight - scrollTop <= clientHeight &&
      calculationsRunList.nextCursor !== ''
    ) {
      setCursors([...cursors, calculationsRunList.nextCursor]);
    }
  };

  useEffect(() => {
    setCursors(['']);
  }, [searchFilters]);

  useEffect(() => {
    if (!calculationsRunList?.calculationRunList) {
      return;
    }
    const { calculationRunList } = calculationsRunList;
    setCursors((cursors) => {
      setCalculationRuns((calculationRuns) =>
        cursors.length > 1
          ? [...calculationRuns, ...calculationRunList]
          : calculationRunList
      );
      return cursors;
    });
  }, [calculationsRunList]);

  useEffect(() => {
    const calculationStates = new Set(
      calculationRuns.map((calculation) => calculation.metadata.status)
    );
    const pollingStates: Partial<CalculationRunMetadata['status']>[] = [
      'ready',
      'running',
    ];
    const shouldPoll = pollingStates.some((state) =>
      calculationStates.has(state)
    );
    setShouldPollCalculations(shouldPoll);
  }, [calculationRuns]);

  const setSearchParams = (
    params: Record<string, number | string | undefined>
  ) => {
    navigate({
      search: (existingParams) => ({ ...existingParams, ...params }),
      replace: true,
    });
  };

  const handleDateChange = ({ startDate, endDate }: Range) => {
    if (!startDate || !endDate) {
      return;
    }

    setSearchParams({
      eventStartTime: formatISO(startDate),
      eventEndTime: formatISO(endDate),
    });
  };

  // Change in simualtor should trigger the change in modelFiles
  const filteredModelFiles = useMemo(() => {
    if (!searchFilters.simulator) {
      return modelFileList?.modelFileList ?? [];
    }
    return modelFileList?.modelFileList.filter(
      (model) => model.source === searchFilters.simulator
    );
  }, [modelFileList?.modelFileList, searchFilters.simulator]);

  // Find the calculation names from calculationRuns
  const calculationNames = useMemo(
    () =>
      uniq(calculationRuns.map((calculation) => calculation.metadata.calcName)),
    [calculationRuns]
  );

  // Find runTypes from calculationRuns
  const runTypes = useMemo(
    () =>
      uniq(calculationRuns.map((calculation) => calculation.metadata.runType)),
    [calculationRuns]
  );

  // Find runStatus from calculationRuns
  const runStatus = useMemo(
    () =>
      uniq(calculationRuns.map((calculation) => calculation.metadata.status)),
    [calculationRuns]
  );

  return (
    <CalculationRunsContainer>
      <CalculationsFilterContainer>
        <div className="cogs-input-container">
          <span className="title">Date range</span>
          <DateRangeWrapped>
            <DateRange
              endDatePlaceholder="Select"
              format="YYYY.MM.DD"
              maxDate={new Date()}
              range={{
                startDate: parseISO(
                  searchFilters.eventStartTime ??
                    initialDateRange.eventStartTime
                ),
                endDate: parseISO(
                  searchFilters.eventEndTime ?? initialDateRange.eventEndTime
                ),
              }}
              startDatePlaceholder="Interval"
              onChange={handleDateChange}
            />
          </DateRangeWrapped>
        </div>

        <Filter
          currentValue={searchFilters.simulator}
          filterKey="simulator"
          label="Simulator"
          options={generateOptions('simulator', 'Simulator', simualtorKeys)}
          setSearchParams={setSearchParams}
        />

        <Filter
          currentValue={searchFilters.modelName}
          filterKey="modelName"
          label="Model name"
          options={[
            {
              label: 'Model name',
              options: filteredModelFiles?.map((model) => ({
                value: { key: 'modelName', value: model.name },
                label: model.name,
              })),
            },
          ]}
          setSearchParams={setSearchParams}
        />

        <Filter
          currentValue={searchFilters.calculationName}
          filterKey="calculationName"
          label="Calculation name"
          options={[
            {
              label: 'Calculation name',
              options: calculationNames.map((name) => ({
                value: { key: 'calculationName', value: name },
                label: name,
              })),
            },
          ]}
          setSearchParams={setSearchParams}
        />

        <Filter
          currentValue={searchFilters.calculationRunType}
          filterKey="calculationRunType"
          label="Run type"
          options={[
            {
              label: 'Run type',
              options: runTypes.map((runType) => ({
                value: { key: 'calculationRunType', value: runType },
                label: capitalize(runType),
              })),
            },
          ]}
          setSearchParams={setSearchParams}
        />
        <Filter
          currentValue={searchFilters.calculationRunStatus}
          filterKey="calculationRunStatus"
          label="Run status"
          options={[
            {
              label: 'Run status',
              options: runStatus.map((status) => ({
                value: { key: 'calculationRunStatus', value: status },
                label: capitalize(status),
              })),
            },
          ]}
          setSearchParams={setSearchParams}
        />
      </CalculationsFilterContainer>

      {isLoadingCalculationsRunList ? <Skeleton.List lines={5} /> : null}

      {isFetchingCalculationsRunList &&
      !shouldPollCalculations &&
      cursors.length === 1 ? (
        <Skeleton.List lines={5} />
      ) : (
        <CalculationRunList
          calculationRuns={calculationRuns}
          isFetchingCalculationsRunList={isFetchingCalculationsRunList}
          onScroll={handleScroll}
        />
      )}

      {!calculationRuns.length && !isFetchingCalculationsRunList ? (
        <NoResultsContainer>
          <Illustrations.Solo type="EmptyStateSearch" />

          <h5>No results</h5>
          <span>
            Try adjusting your search or filter to find what you are looking
            for.
          </span>
        </NoResultsContainer>
      ) : null}
    </CalculationRunsContainer>
  );
}

const initialDateRange = {
  eventStartTime: formatISO(sub(new Date(), { days: 7 })),
  eventEndTime: formatISO(new Date()),
};

const NoResultsContainer = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
  height: 100%;

  h5 {
    font-size: var(--cogs-t5-font-size);
    margin: 0;
  }

  span {
    width: 250px;
    text-align: center;
    font-size: 12px;
  }
`;

const CalculationRunsContainer = styled.div`
  display: flex;
  flex: 1 0 0;
  flex-flow: column nowrap;
  overflow: auto;
  .rc-collapse {
    background-color: transparent;
  }
  .rc-collapse-content {
    background-color: var(--cogs-greyscale-grey2);
  }
`;

const CalculationsFilterContainer = styled.form`
  display: flex;
  column-gap: 12px;
  margin: 24px 24px 12px 24px;
  align-items: flex-end;
  & > div {
    flex: 1 1 0;
  }
  .cogs-date-range--input {
    border: 2px solid var(--cogs-border-default);
    height: 36px;
  }
  & .cogs-input-container .title {
    text-transform: none;
  }
`;

const DateRangeWrapped = styled.div`
  .cogs-dropdown {
    .rc-tabs {
      border: 0;
      height: 90%;
      .rc-tabs-tab {
        font-size: 1em;
      }
    }
    .cogs-date-range--input {
      & {
        border-color: var(--cogs-border-default);
      }
      ,
      &,
      &:hover {
        border-width: 2px;
      }
    }
  }
`;

interface FilterProps {
  filterKey: string;
  label: string;
  options: OptionType<OptionGroupValues>[];
  currentValue?: string;
  isClearable?: boolean | false;
  setSearchParams: (
    params: Record<string, number | string | undefined>
  ) => void;
}

function Filter({
  filterKey,
  label,
  options,
  currentValue,
  setSearchParams,
  isClearable = true,
}: FilterProps) {
  return (
    <div className="cogs-input-container">
      <label className="title">{label}</label>
      <Select
        isClearable={isClearable}
        options={options}
        value={options[0]?.options?.find(
          ({ value }) =>
            value?.key === filterKey && value.value === currentValue
        )}
        onChange={(option: OptionType<OptionGroupValues> | null) => {
          setSearchParams({ [filterKey]: option?.value?.value });
        }}
        dropdownRender={(menu) => {
          const firstItem = options[0];
          const optionsLength = firstItem && (firstItem?.options || []).length;
          return (
            <>
              <FilterWrapper>({optionsLength} Items)</FilterWrapper>
              {menu}
            </>
          );
        }}
      />
    </div>
  );
}

const FilterWrapper = styled.div`
  && {
    position: absolute;
    top: 5px;
    right: 10px;
    font-size: 10px;
  }
`;
