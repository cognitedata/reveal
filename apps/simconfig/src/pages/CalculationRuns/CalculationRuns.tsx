import type { UIEvent } from 'react';
import { useEffect, useState } from 'react';
import type { Range } from 'react-date-range';
import { useMatch, useNavigate, useSearch } from 'react-location';
import { useSelector } from 'react-redux';
// import { useHistory } from 'react-router-dom';

import { formatISO, parseISO, sub } from 'date-fns';
import styled from 'styled-components/macro';

import type { OptionType } from '@cognite/cogs.js';
import { AutoComplete, DateRange, Graphic, Skeleton } from '@cognite/cogs.js';
import {
  useGetCalculationRunListQuery,
  useGetModelFileListQuery,
} from '@cognite/simconfig-api-sdk/rtk';
import type {
  CalculationRun,
  CalculationRunMetadata,
  GetCalculationRunListApiArg,
} from '@cognite/simconfig-api-sdk/rtk';

import { GraphicContainer } from 'components/shared/elements';
import { selectProject } from 'store/simconfigApiProperties/selectors';
import { excludeUnknownSimulator } from 'utils/simulatorUtils';

import { CalculationRunList } from './CalculationRunList';
import { generateOptions } from './options';
import type { OptionGroupValues } from './types';

import type { AppLocationGenerics } from 'routes';

const POLLING_INTERVAL = 2000;

export function CalculationRuns() {
  const [calculationRuns, setCalculationRuns] = useState<CalculationRun[]>([]);
  const [shouldPollCalculations, setShouldPollCalculations] =
    useState<boolean>(false);
  const [cursors, setCursors] = useState(['']);
  const project = useSelector(selectProject);
  const nextCursor = cursors[cursors.length - 1];
  const searchFilters: Partial<GetCalculationRunListApiArg> =
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
  } = useGetCalculationRunListQuery(
    {
      ...initialDateRange,
      project,
      simulator: searchFilters.simulator ?? 'PROSPER',
      ...(nextCursor !== '' && { nextCursor }),
      ...searchFilters,
    },
    {
      refetchOnMountOrArgChange: true,
      pollingInterval: shouldPollCalculations ? POLLING_INTERVAL : undefined,
    }
  );

  const { data: modelFileList } = useGetModelFileListQuery({ project });

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

  return (
    <CalculationRunsContainer>
      <CalculationsFilterContainer>
        <div className="cogs-input-container">
          <span className="title">Date range</span>
          <DateRange
            endDatePlaceholder="Select"
            format="YYYY.MM.DD"
            maxDate={new Date()}
            range={{
              startDate: parseISO(
                searchFilters.eventStartTime ?? initialDateRange.eventStartTime
              ),
              endDate: parseISO(
                searchFilters.eventEndTime ?? initialDateRange.eventEndTime
              ),
            }}
            startDatePlaceholder="Interval"
            onChange={handleDateChange}
          />
        </div>

        <Filter
          currentValue={searchFilters.simulator ?? 'PROSPER'}
          filterKey="simulator"
          isClearable={false}
          label="Simulator"
          options={generateOptions(
            'simulator',
            'Simulator',
            excludeUnknownSimulator(definitions?.type.simulator)
          )}
          setSearchParams={setSearchParams}
        />

        <Filter
          currentValue={searchFilters.modelName}
          filterKey="modelName"
          label="Model Name"
          options={[
            {
              label: 'Model name',
              options: modelFileList?.modelFileList.map((model) => ({
                value: { key: 'modelName', value: model.name },
                label: model.name,
              })),
            },
          ]}
          setSearchParams={setSearchParams}
        />

        <Filter
          currentValue={searchFilters.calculationType}
          filterKey="calculationType"
          label="Calculation Type"
          options={generateOptions(
            'calculationType',
            'Calculations',
            definitions?.type.calculation
          )}
          setSearchParams={setSearchParams}
        />
        <Filter
          currentValue={searchFilters.calculationRunType}
          filterKey="calculationRunType"
          label="Run Type"
          options={generateOptions(
            'calculationRunType',
            'Run Type',
            definitions?.calculation.runType
          )}
          setSearchParams={setSearchParams}
        />
        <Filter
          currentValue={searchFilters.calculationRunStatus}
          filterKey="calculationRunStatus"
          label="Run Status"
          options={generateOptions(
            'calculationRunStatus',
            'Status',
            definitions?.calculation.runStatus
          )}
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
        <GraphicContainer>
          <Graphic type="Search" />
          Search returned no results matching the current search criteria
        </GraphicContainer>
      ) : null}
    </CalculationRunsContainer>
  );
}

const initialDateRange = {
  eventStartTime: formatISO(sub(new Date(), { days: 7 })),
  eventEndTime: formatISO(new Date()),
};

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
      <AutoComplete
        isClearable={isClearable}
        options={options}
        title={label}
        value={options[0]?.options?.find(
          ({ value }) =>
            value?.key === filterKey && value.value === currentValue
        )}
        onChange={(option: OptionType<OptionGroupValues> | null) => {
          setSearchParams({ [filterKey]: option?.value?.value });
        }}
      />
    </div>
  );
}
