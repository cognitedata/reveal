import { NdsRiskTypesSelection } from 'domain/wells/nds/internal/types';
import { NptCodesSelection } from 'domain/wells/npt/internal/types';
import { useWellInspectWellbores } from 'domain/wells/well/internal/hooks/useWellInspectWellbores';

import React, { useCallback, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import { BooleanMap, toBooleanMap } from 'utils/booleanMap';

import { PerfMetrics } from '@cognite/metrics';

import EmptyState from 'components/EmptyState';
import {
  PerformanceMetricsObserver,
  PerformanceObserved,
} from 'components/Performance';
import { useWellInspectSelection } from 'modules/wellInspect/selectors';

import { WellboreCasingsViewsWrapper } from './elements';
import { FilterBar } from './filters';
import { useMaxDepths } from './hooks/useMaxDepths';
import { useWellboreStickChartColumns } from './hooks/useWellboreStickChartData';
import { ChartColumn } from './types';
import { getWellboreData } from './utils/getWellboreData';
import { WellboreStickChart } from './WellboreStickChart';
import {
  DEFAULT_COLUMN_ORDER,
  DEFAULT_VISIBLE_COLUMNS,
} from './WellboreStickChart/constants';

const StickChart: React.FC = () => {
  const wellbores = useWellInspectWellbores();
  const { selectedWellboreIds } = useWellInspectSelection();

  const { data: maxDepths, isLoading } = useMaxDepths();

  const getWellboreStickChartColumns = useWellboreStickChartColumns();

  const [columnVisibility, setColumnVisibility] = useState(
    toBooleanMap(DEFAULT_VISIBLE_COLUMNS)
  );
  const [columnOrder, setColumnOrder] = useState(DEFAULT_COLUMN_ORDER);

  const [nptCodesSelecton, setNptCodesSelection] =
    useState<NptCodesSelection>();

  const [ndsRiskTypesSelection, setNdsRiskTypesSelection] =
    useState<NdsRiskTypesSelection>();

  const [summaryVisibility, setSummaryVisibility] = useState<BooleanMap>({});

  const [measurementTypesSelection, setMeasurementTypesSelection] =
    useState<BooleanMap>();

  const handleColumnVisibilityChange = useCallback(
    (column: ChartColumn, visibility: boolean) => {
      setColumnVisibility((columnVisibility) => ({
        ...columnVisibility,
        [column]: visibility,
      }));
    },
    []
  );

  const handlePerformanceObserved = ({ mutations }: PerformanceObserved) => {
    if (mutations) {
      PerfMetrics.trackPerfEnd('STICK_CHART_PAGE_LOAD');
    }
  };

  if (isEmpty(maxDepths)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <PerformanceMetricsObserver onChange={handlePerformanceObserved}>
      <FilterBar
        columnOrder={columnOrder}
        onNptCodesChange={setNptCodesSelection}
        onNdsCodesChange={setNdsRiskTypesSelection}
        onSummaryVisibilityChange={setSummaryVisibility}
        onMeasurementTypesChange={setMeasurementTypesSelection}
        onRearrange={setColumnOrder}
        onColumnVisibilityChange={handleColumnVisibilityChange}
      />

      <WellboreCasingsViewsWrapper>
        {wellbores.map((wellbore) => {
          const { matchingId } = wellbore;

          return (
            <WellboreStickChart
              key={matchingId}
              {...getWellboreData(wellbore)}
              {...getWellboreStickChartColumns(matchingId)}
              isWellboreSelected={Boolean(selectedWellboreIds[matchingId])}
              maxDepth={maxDepths[matchingId]}
              columnVisibility={columnVisibility}
              columnOrder={columnOrder}
              nptCodesSelecton={nptCodesSelecton}
              ndsRiskTypesSelection={ndsRiskTypesSelection}
              summaryVisibility={summaryVisibility}
              measurementTypesSelection={measurementTypesSelection}
            />
          );
        })}
      </WellboreCasingsViewsWrapper>
    </PerformanceMetricsObserver>
  );
};

export default StickChart;
