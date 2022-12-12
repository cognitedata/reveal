import { BenchmarkingFilterType } from '@cognite/power-ops-api-types';
import BenchmarkingFiltersContainer from 'components/BenchmarkingFilters/BenchmarkingFiltersContainer';
import { DayAheadBenchmarkingChartContainer } from 'components/DayAheadBenchmarkingChart/DayAheadBenchmarkingChartContainer';
import { BenchmarkingTypeOption } from 'types';
import { useState } from 'react';
import { CommonError } from 'components/CommonError/CommonError';
import { Flex, Loader } from '@cognite/cogs.js';
import { useFetchBenchmarkingFilters } from 'queries/useFetchBenchmarkingFilters';

import { Main } from './elements';

export const MethodPerformanceContainer = ({
  priceAreaId,
}: {
  priceAreaId: string;
}) => {
  const { data: benchmarkingFilters, status: fetchBenchmarkingFiltersStatus } =
    useFetchBenchmarkingFilters({
      priceAreaId: priceAreaId.split('_')[2],
      market: 'day-ahead',
    });

  const [filter, setFilter] = useState<BenchmarkingFilterType>();
  const [type, setType] = useState<BenchmarkingTypeOption>('');
  const [showFirstRuns, setShowFirstRuns] = useState<boolean>(false);

  if (fetchBenchmarkingFiltersStatus !== 'success') {
    return <Loader infoTitle="Loading filter values ..." darkMode={false} />;
  }

  return !benchmarkingFilters?.metrics.length ||
    !benchmarkingFilters?.waterCourses.length ? (
    <Main>
      <Flex
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
        <CommonError title="No data available">
          There is no benchmarking data
          <br />
          available in CDF for this project.
        </CommonError>
      </Flex>
    </Main>
  ) : (
    <Main>
      <BenchmarkingFiltersContainer
        priceAreaId={priceAreaId}
        benchmarkingFilters={benchmarkingFilters}
        showFirstRuns={showFirstRuns}
        onFilterChange={setFilter}
        onTypeChange={setType}
        onShowFirstRunsChange={setShowFirstRuns}
      />
      <DayAheadBenchmarkingChartContainer
        filter={filter}
        type={type}
        showFirstRuns={showFirstRuns}
      />
    </Main>
  );
};
