import { BenchmarkingFilterType } from '@cognite/power-ops-api-types';
import BenchmarkingFiltersContainer from 'components/BenchmarkingFilters/BenchmarkingFiltersContainer';
import { DayAheadBenchmarkingChartContainer } from 'components/DayAheadBenchmarkingChart/DayAheadBenchmarkingChartContainer';
import { BenchmarkingTypeOption } from 'types';
import { useState } from 'react';

import { Main } from './elements';

export const MethodPerformanceContainer = ({
  priceAreaId,
}: {
  priceAreaId: string;
}) => {
  const [filter, setFilter] = useState<BenchmarkingFilterType>();
  const [type, setType] = useState<BenchmarkingTypeOption>('');
  const [showFirstRuns, setShowFirstRuns] = useState<boolean>(false);

  return (
    <Main>
      <BenchmarkingFiltersContainer
        priceAreaId={priceAreaId}
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
