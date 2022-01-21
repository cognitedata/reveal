import type { UIEvent } from 'react';
import { useEffect, useState } from 'react';
import type { Range } from 'react-date-range';
import { useMatch, useSearch } from 'react-location';
import { useSelector } from 'react-redux';

import { sub } from 'date-fns';
import styled from 'styled-components/macro';

import type { OptionType } from '@cognite/cogs.js';
import { AutoComplete, DateRange, Graphic, Skeleton } from '@cognite/cogs.js';
import {
  useGetCalculationRunListQuery,
  useGetModelFileListQuery,
} from '@cognite/simconfig-api-sdk/rtk';
import type {
  CalculationRun,
  GetCalculationRunListApiArg,
} from '@cognite/simconfig-api-sdk/rtk';

import { selectProject } from 'store/simconfigApiProperties/selectors';

import { CalculationRunsList } from './CalculationRunsList';
import { generateOptions } from './options';
import type { FilterOptionsProps, OptionGroupValues } from './types';

import type { AppLocationGenerics } from 'routes';

export function CalculationRuns() {
  const [selectedOptions, setSelectedOptions] = useState<FilterOptionsProps>({
    modelName: [],
    calculationType: [],
    calculationRunType: [],
    calculationRunStatus: [],
  });
  const [date, setDate] = useState<Range>({
    startDate: sub(new Date(), { days: 7 }),
    endDate: new Date(),
  });
  const [calculationRuns, setCalculationRuns] = useState<CalculationRun[]>([]);
  const [cursors, setCursors] = useState(['']);
  const project = useSelector(selectProject);
  const simulator = 'PROSPER';
  const nextCursor = cursors[cursors.length - 1];
  const eventStartTime = date.startDate?.getTime().toString() ?? '';
  const eventEndTime = date.endDate?.getTime().toString() ?? '';
  const [parameters, setParameters] = useState<GetCalculationRunListApiArg>({
    project,
    simulator,
    eventStartTime,
    eventEndTime,
  });

  const preAppliedFilters: Partial<GetCalculationRunListApiArg> =
    useSearch<AppLocationGenerics>();
  const {
    data: { definitions },
  } = useMatch<AppLocationGenerics>();

  useEffect(() => {
    if (preAppliedFilters.calculationType && preAppliedFilters.modelName) {
      setSelectedOptions((options) => ({
        ...options,
        modelName: {
          label: preAppliedFilters.modelName ?? '',
          value: { key: 'modelName', value: preAppliedFilters.modelName ?? '' },
        },
        calculationType: {
          label: preAppliedFilters.calculationType ?? '',
          value: {
            key: 'calculationType',
            value: preAppliedFilters.calculationType ?? '',
          },
        },
      }));
    }
  }, [preAppliedFilters]);

  const {
    data: calculationsRunList,
    isFetching: isFetchingCalculationsRunList,
  } = useGetCalculationRunListQuery({
    ...parameters,
    nextCursor,
  });

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
    if (!calculationsRunList?.calculationRunList) {
      return;
    }
    setCursors((cursors) => {
      setCalculationRuns((calculationRuns) =>
        cursors.length > 1
          ? [...calculationRuns, ...calculationsRunList.calculationRunList]
          : calculationsRunList.calculationRunList
      );
      return cursors;
    });
  }, [calculationsRunList, parameters]);

  useEffect(() => {
    const options = Object.values(selectedOptions)
      .map((option: OptionType<OptionGroupValues>) => {
        const { value } = option;
        if (value?.key && value.value) {
          return { [value.key]: value.value };
        }
        return {};
      })
      .filter((option) => Object.keys(option).length !== 0)
      .reduce((prev, current) => Object.assign(prev, current), {});
    setCursors(['']);
    setParameters((parameters) => ({
      ...parameters,
      ...options,
    }));
  }, [selectedOptions]);

  const handleDateChange = ({ startDate, endDate }: Range) => {
    setDate({
      startDate,
      endDate,
    });

    setParameters((parameters) => ({
      ...parameters,
      eventStartTime: String(startDate?.getTime()),
      eventEndTime: String(endDate?.getTime()),
    }));
  };

  const handleSelectChange = (
    option: OptionType<OptionGroupValues> | null,
    filterName: string
  ) => {
    setSelectedOptions({
      ...selectedOptions,
      [filterName]: option?.value ? option : [],
    });
    if (!option?.value) {
      setParameters((parameters) => ({
        ...parameters,
        [filterName]: undefined,
      }));
    }
  };

  return (
    <CalculationRunsContainer onScroll={handleScroll}>
      <CalculationsFilterContainer>
        <AutoComplete
          options={[
            {
              label: 'Model name',
              options: modelFileList?.modelFileList.map((model) => ({
                value: { key: 'modelName', value: model.name },
                label: model.name,
              })),
            },
          ]}
          placeholder="Model name"
          value={selectedOptions.modelName}
          isClearable
          onChange={(option: OptionType<OptionGroupValues> | null) => {
            handleSelectChange(option, 'modelName');
          }}
        />

        <AutoComplete
          options={generateOptions(
            'calculationType',
            'Calculations',
            definitions?.type.calculation
          )}
          placeholder="Calculation Type"
          placeholderSelectText="Selected Item"
          value={selectedOptions.calculationType}
          isClearable
          onChange={(option: OptionType<OptionGroupValues> | null) => {
            handleSelectChange(option, 'calculationType');
          }}
        />

        <AutoComplete
          options={generateOptions(
            'calculationRunType',
            'Run Type',
            definitions?.calculation.runType
          )}
          placeholder="Run Type"
          placeholderSelectText="Selected Item"
          value={selectedOptions.calculationRunType}
          isClearable
          onChange={(option: OptionType<OptionGroupValues> | null) => {
            handleSelectChange(option, 'calculationRunType');
          }}
        />

        <AutoComplete
          options={generateOptions(
            'calculationRunStatus',
            'Status',
            definitions?.calculation.runStatus
          )}
          placeholder="Run Status"
          value={selectedOptions.calculationRunStatus}
          isClearable
          onChange={(option: OptionType<OptionGroupValues> | null) => {
            handleSelectChange(option, 'calculationRunStatus');
          }}
        />

        <DateRange
          endDatePlaceholder="Select"
          format="YYYY.MM.DD"
          maxDate={new Date()}
          range={date}
          startDatePlaceholder="Interval"
          onChange={handleDateChange}
        />
      </CalculationsFilterContainer>
      <CalculationRunsList calculationRuns={calculationRuns} />

      {isFetchingCalculationsRunList && (
        <>
          <Skeleton.Rectangle height="50" width="100%" />
          <Skeleton.Rectangle height="50" width="100%" />
          <Skeleton.Rectangle height="50" width="100%" />
        </>
      )}

      {!calculationRuns.length && !isFetchingCalculationsRunList && (
        <EmptyResultsContainer>
          <Graphic type="Search" />
          <div>No results.</div>
        </EmptyResultsContainer>
      )}
    </CalculationRunsContainer>
  );
}

const EmptyResultsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 4em;
  align-items: center;
`;

const CalculationRunsContainer = styled.div`
  padding: 2em;
  min-height: 80vh;
  overflow-y: scroll;
  .rc-collapse {
    background-color: transparent;
  }
  .rc-collapse-content {
    background-color: var(--cogs-greyscale-grey2);
    padding-left: 2em;
  }
`;

const CalculationsFilterContainer = styled.form`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 45px;
  padding-left: 2em;
  padding-right: 3em;

  .cogs-select {
    margin-bottom: 1em;
  }
  .cogs-date-range--input {
    border: 2px solid var(--cogs-border-default);
    height: 36px;
  }
`;

export const RunDetailsTable = styled.table`
  border-collapse: collapse;
  width: 50%;
  caption {
    caption-side: top;
    color: var(--cogs-text-color);
    font-weight: bold;
  }
  td {
    border: 1px solid var(--cogs-border-default);
    padding: 6px 8px;
  }
`;
