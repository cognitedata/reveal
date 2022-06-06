import React, { useEffect, useMemo, useState } from 'react';

import head from 'lodash/head';
import isEmpty from 'lodash/isEmpty';

import { OverlayNavigation } from 'components/OverlayNavigation';

import { ViewModeControl } from '../../common/ViewModeControl';
import { WellboreNavigationPanel } from '../../common/WellboreNavigationPanel';
import { EMPTY_APPLIED_FILTERS } from '../constants';
import { Filters } from '../filters';
import { NdsTreemap } from '../treemap';
import { AppliedFilters, FilterValues, NdsView } from '../types';
import { getFilteredNdsData } from '../utils/getFilteredNdsData';
import { getRiskTypeTreemapData } from '../utils/getRiskTypeTreemapData';
import { getSubtypeTreemapData } from '../utils/getSubtypeTreemapData';

import { NdsDetailedViewModes } from './constants';
import { DetailedViewContent, FiltersBar } from './elements';
import { DetailedViewTable } from './table';
import { DetailedViewProps } from './types';

export const DetailedView: React.FC<DetailedViewProps> = ({
  data,
  detailedViewNdsData = [],
  setDetailedViewNdsData,
  ndsAggregate,
}) => {
  const [filteredData, setFilteredData] =
    useState<NdsView[]>(detailedViewNdsData);

  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(
    EMPTY_APPLIED_FILTERS
  );
  const [selectedViewMode, setSelectedViewMode] =
    useState<NdsDetailedViewModes>(NdsDetailedViewModes.RiskType);

  const currentWellboreName = head(detailedViewNdsData)?.wellboreName;

  const clearDetailedViewNdsData = () => setDetailedViewNdsData(undefined);

  const riskTypeTreemapData = useMemo(
    () => getRiskTypeTreemapData(filteredData),
    [filteredData]
  );

  const subtypeTreemapData = useMemo(
    () => getSubtypeTreemapData(filteredData),
    [filteredData]
  );

  const handleChangeFilter = (
    filter: keyof AppliedFilters,
    values: FilterValues
  ) => {
    setAppliedFilters((appliedFilters) => ({
      ...appliedFilters,
      [filter]: values,
    }));
  };

  useEffect(() => {
    const filteredData = getFilteredNdsData(data, appliedFilters);
    setFilteredData(filteredData);
  }, [appliedFilters]);

  useEffect(() => {
    const { riskTypesAndSubtypes, severities, probabilities } = ndsAggregate;
    setAppliedFilters({
      riskType: riskTypesAndSubtypes,
      severity: severities,
      probability: probabilities,
    });
  }, [data, ndsAggregate]);

  return (
    <OverlayNavigation mount={!isEmpty(detailedViewNdsData)}>
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

        <Filters
          {...ndsAggregate}
          appliedFilters={appliedFilters}
          onChangeFilter={handleChangeFilter}
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
