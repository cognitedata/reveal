import { filterByRiskTypes } from 'domain/wells/dataLayer/nds/adapters/filterByRiskTypes';

import React, { useCallback, useMemo, useState } from 'react';

import head from 'lodash/head';

import { OptionType } from '@cognite/cogs.js';

import { MultiSelectCategorized } from 'components/Filters';
import { MultiSelectOptionType } from 'components/Filters/MultiSelect/types';
import { OverlayNavigation } from 'components/OverlayNavigation';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { ViewModeControl } from '../../common/ViewModeControl';
import { WellboreNavigationPanel } from '../../common/WellboreNavigationPanel';
import { FILTER_WIDTH, RISK_TYPE_FILTER_TITLE } from '../constants';
import { NdsTreemap } from '../treemap';
import { NdsView } from '../types';
import { generateNdsFilterDataFromAggregate } from '../utils/generateNdsFilterDataFromAggregate';
import { getRiskTypeTreemapData } from '../utils/getRiskTypeTreemapData';
import { getSubtypeTreemapData } from '../utils/getSubtypeTreemapData';

import { NdsDetailedViewModes } from './constants';
import { DetailedViewContent, FiltersBar } from './elements';
import { DetailedViewTable } from './table';
import { DetailedViewProps } from './types';

export const DetailedView: React.FC<DetailedViewProps> = ({
  data,
  detailedViewNdsData,
  setDetailedViewNdsData,
  ndsAggregate,
}) => {
  const [filteredData, setFilteredData] = useState<NdsView[]>(
    detailedViewNdsData || []
  );
  const [selectedViewMode, setSelectedViewMode] =
    useState<NdsDetailedViewModes>(NdsDetailedViewModes.RiskType);

  useDeepEffect(() => {
    setFilteredData(detailedViewNdsData || []);
  }, [detailedViewNdsData]);

  const currentWellboreName = head(detailedViewNdsData)?.wellboreName;

  const clearDetailedViewNdsData = () => setDetailedViewNdsData(undefined);

  const riskTypeFilters = useDeepMemo(
    () =>
      generateNdsFilterDataFromAggregate(ndsAggregate ? [ndsAggregate] : []),
    [ndsAggregate]
  );

  const riskTypeTreemapData = useMemo(
    () => getRiskTypeTreemapData(filteredData),
    [filteredData]
  );

  const subtypeTreemapData = useMemo(
    () => getSubtypeTreemapData(filteredData),
    [filteredData]
  );

  const handleChangeRiskTypeFilter = useCallback(
    (
      values: Record<string, OptionType<MultiSelectOptionType>[] | undefined>
    ) => {
      if (!detailedViewNdsData) return;

      const riskTypes = Object.keys(values);
      const filteredData = filterByRiskTypes(detailedViewNdsData, riskTypes);
      setFilteredData(filteredData);
    },
    [detailedViewNdsData]
  );

  return (
    <OverlayNavigation mount={Boolean(detailedViewNdsData)}>
      <WellboreNavigationPanel
        data={data}
        currentWellboreName={currentWellboreName}
        onClickBack={clearDetailedViewNdsData}
        onNavigate={setDetailedViewNdsData}
        onChangeData={setDetailedViewNdsData}
      />

      <FiltersBar>
        <ViewModeControl
          views={Object.values(NdsDetailedViewModes)}
          selectedView={selectedViewMode}
          onChangeView={setSelectedViewMode}
        />

        <MultiSelectCategorized
          title={RISK_TYPE_FILTER_TITLE}
          width={FILTER_WIDTH}
          options={riskTypeFilters}
          onValueChange={handleChangeRiskTypeFilter}
        />
      </FiltersBar>

      <DetailedViewContent>
        {selectedViewMode === NdsDetailedViewModes.RiskType && (
          <NdsTreemap data={riskTypeTreemapData} />
        )}

        {selectedViewMode === NdsDetailedViewModes.Subtype && (
          <NdsTreemap data={subtypeTreemapData} />
        )}

        {selectedViewMode === NdsDetailedViewModes.Table && (
          <DetailedViewTable data={filteredData} />
        )}
      </DetailedViewContent>
    </OverlayNavigation>
  );
};
