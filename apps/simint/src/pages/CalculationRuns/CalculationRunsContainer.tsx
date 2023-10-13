import type { UIEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { Range } from 'react-date-range';
import { useMatch, useNavigate, useSearch } from 'react-location';
import { useSelector } from 'react-redux';

import { formatISO, sub } from 'date-fns';
import uniq from 'lodash/uniq';

import {
  useGetCalculationRunListV2Query,
  useGetModelFileListV2Query,
  useGetSimulatorsListV2Query,
} from '@cognite/simconfig-api-sdk/rtk';
import type {
  CalculationRun,
  CalculationRunMetadata,
  GetCalculationRunListV2ApiArg,
  SimulatorConfigDetails,
} from '@cognite/simconfig-api-sdk/rtk';

import type { AppLocationGenerics } from '../../routes';
import {
  selectBaseUrl,
  selectProject,
} from '../../store/simconfigApiProperties/selectors';
import { createCdfLink } from '../../utils/createCdfLink';

import { CalculationRuns } from './CalculationRuns';

const POLLING_INTERVAL = 2000;

export function CalculationRunsContainer() {
  const [calculationRuns, setCalculationRuns] = useState<CalculationRun[]>([]);

  const [shouldPollCalculations, setShouldPollCalculations] =
    useState<boolean>(false);
  const [cursors, setCursors] = useState(['']);
  const project = useSelector(selectProject);
  const nextCursor = cursors[cursors.length - 1];
  const searchFilters: Partial<GetCalculationRunListV2ApiArg> =
    useSearch<AppLocationGenerics>();
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

  // determine if the project has any runs at all
  const { data: simulatorsList, isLoading: isLoadingHasRuns } =
    useGetSimulatorsListV2Query(
      { project, hasDataSetDetails: true },
      {
        // only run this query if the query for filtered calculation runs has returned 0
        skip:
          isLoadingCalculationsRunList ||
          (calculationsRunList?.calculationRunList ?? []).length > 0,
      }
    );
  const hasRunsInProject = simulatorsList?.simulators?.some(
    (simulator) =>
      simulator.calculationsRuns !== undefined && simulator.calculationsRuns > 0
  );

  const { data: modelFileList } = useGetModelFileListV2Query({ project });

  const simulatorKeys = definitions?.simulatorsConfig?.reduce(
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

  // Change in simulator should trigger the change in modelFiles
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

  const baseUrl = useSelector(selectBaseUrl);
  const firstModelFile = modelFileList && modelFileList.modelFileList[0];
  const createRoutineUrl = firstModelFile
    ? createCdfLink(
        `/model-library/models/${encodeURIComponent(
          firstModelFile.source
        )}/${encodeURIComponent(
          firstModelFile.metadata.modelName
        )}/calculations`,
        baseUrl
      )
    : createCdfLink(`/model-library`, baseUrl);

  return (
    <CalculationRuns
      calculationNames={calculationNames}
      calculationRuns={calculationRuns}
      createRoutineUrl={createRoutineUrl}
      cursors={cursors}
      filteredModelFiles={filteredModelFiles}
      hasRunsInProject={hasRunsInProject}
      isFetching={isFetchingCalculationsRunList}
      isLoading={isLoadingCalculationsRunList || isLoadingHasRuns}
      onDateChange={handleDateChange}
      onSearchParamsSet={setSearchParams}
      onScroll={handleScroll}
      runStatus={runStatus}
      runTypes={runTypes}
      searchFilters={searchFilters}
      shouldPollCalculations={shouldPollCalculations}
      simulatorKeys={simulatorKeys}
      simulatorConfig={definitions?.simulatorsConfig ?? []}
    />
  );
}

const initialDateRange = {
  eventStartTime: formatISO(sub(new Date(), { days: 7 })),
  eventEndTime: formatISO(new Date()),
};
