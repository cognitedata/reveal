import { UIEvent } from 'react';
import type { Range } from 'react-date-range';
import { useNavigate } from 'react-location';

import { formatISO, parseISO, sub } from 'date-fns';
import capitalize from 'lodash/capitalize';
import styled from 'styled-components/macro';

import type { OptionType } from '@cognite/cogs.js';
import {
  Button,
  DateRange,
  Illustrations,
  Select,
  Skeleton,
} from '@cognite/cogs.js';
import type {
  CalculationRun,
  CalculationRunMetadata,
  GetCalculationRunListV2ApiArg,
  ModelFile,
  SimulatorConfigDetails,
} from '@cognite/simconfig-api-sdk/rtk';

import { CalculationRunList } from './CalculationRunList';
import { generateOptions } from './options';
import type { OptionGroupValues } from './types';

export type CalculationRunsProps = {
  calculationNames: string[];
  calculationRuns: CalculationRun[];
  createRoutineUrl: string;
  cursors: string[];
  filteredModelFiles?: ModelFile[];
  hasRunsInProject?: boolean;
  isFetching: boolean;
  isLoading: boolean;
  onDateChange: ({ startDate, endDate }: Range) => void;
  onSearchParamsSet: (
    params: Record<string, number | string | undefined>
  ) => void;
  onScroll: (event: UIEvent<HTMLDivElement>) => void;
  runStatus: CalculationRunMetadata['status'][];
  runTypes: CalculationRunMetadata['runType'][];
  searchFilters: Partial<GetCalculationRunListV2ApiArg>;
  shouldPollCalculations: boolean;
  simulatorConfig: SimulatorConfigDetails[];
  simulatorKeys?: Record<string, string>;
};

export function CalculationRuns({
  calculationNames,
  calculationRuns,
  createRoutineUrl,
  cursors,
  filteredModelFiles,
  hasRunsInProject,
  isFetching,
  isLoading,
  onDateChange,
  onSearchParamsSet,
  onScroll,
  runStatus,
  runTypes,
  searchFilters,
  shouldPollCalculations,
  simulatorConfig,
  simulatorKeys,
}: CalculationRunsProps) {
  const navigate = useNavigate();

  const renderFilters = () => (
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
                searchFilters.eventStartTime ?? initialDateRange.eventStartTime
              ),
              endDate: parseISO(
                searchFilters.eventEndTime ?? initialDateRange.eventEndTime
              ),
            }}
            startDatePlaceholder="Interval"
            onChange={onDateChange}
          />
        </DateRangeWrapped>
      </div>

      <Filter
        currentValue={searchFilters.simulator}
        filterKey="simulator"
        label="Simulator"
        options={generateOptions('simulator', 'Simulator', simulatorKeys)}
        setSearchParams={onSearchParamsSet}
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
        setSearchParams={onSearchParamsSet}
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
        setSearchParams={onSearchParamsSet}
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
        setSearchParams={onSearchParamsSet}
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
        setSearchParams={onSearchParamsSet}
      />
    </CalculationsFilterContainer>
  );

  const renderRuns = () => {
    // check for false because hasRunsInProject can be undefined
    if (hasRunsInProject === false) {
      return (
        <NoResultsContainer data-testid="no-runs-container">
          <Illustrations.Solo
            css={{ marginBottom: '20px' }}
            type="EmptyStateSearch"
          />

          <h5>No simulator runs found</h5>
          <span>Create your first simulation routine to get started</span>
          <Button
            css={{ marginTop: '24px' }}
            data-testid="create-routine-button"
            icon="ExternalLink"
            iconPlacement="right"
            onClick={() => {
              navigate({
                to: createRoutineUrl,
              });
            }}
            type="primary"
          >
            Create Routine
          </Button>
        </NoResultsContainer>
      );
    }

    if (isLoading) {
      return <Skeleton.List lines={5} />;
    }

    return (
      <>
        {isFetching && !shouldPollCalculations && cursors.length === 1 ? (
          <Skeleton.List lines={5} />
        ) : (
          <CalculationRunList
            calculationRuns={calculationRuns}
            isFetchingCalculationsRunList={isFetching}
            onScroll={onScroll}
            simulatorConfig={simulatorConfig}
          />
        )}

        {!calculationRuns.length && !isFetching ? (
          <NoResultsContainer data-testid="no-results-container">
            <Illustrations.Solo
              css={{ marginBottom: '20px' }}
              type="EmptyStateSearch"
            />

            <h5>No results available</h5>
            <span>
              Please refine your filters or update the search parameters
            </span>
          </NoResultsContainer>
        ) : null}
      </>
    );
  };

  return (
    <CalculationRunsContainer>
      {renderFilters()}
      {renderRuns()}
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
    margin: 0 0 8px;
  }

  span {
    width: 495px;
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
