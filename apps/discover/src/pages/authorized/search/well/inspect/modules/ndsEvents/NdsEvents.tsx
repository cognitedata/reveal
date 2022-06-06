import { getEmptyNdsAggregatesMerged } from 'domain/wells/dataLayer/nds/utils/getEmptyNdsAggregatesMerged';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores';

import React, { useEffect, useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import { mergeUniqueArray } from 'utils/merge';

import EmptyState from 'components/EmptyState';
import { useDeepMemo } from 'hooks/useDeep';

import { ViewModeControl } from '../common/ViewModeControl';

import { EMPTY_APPLIED_FILTERS, NdsViewModes } from './constants';
import { DetailedView } from './detailedView';
import { FiltersBar } from './elements';
import { Filters } from './filters';
import { NdsTable } from './table';
import { NdsTreemap } from './treemap';
import { AppliedFilters, FilterValues, NdsView } from './types';
import { useNdsData } from './useNdsData';
import { generateNdsTreemapData } from './utils/generateNdsTreemapData';
import { getFilteredNdsData } from './utils/getFilteredNdsData';
import { getNdsAggregateForWellbore } from './utils/getNdsAggregateForWellbore';

const NdsEvents: React.FC = () => {
  // data
  const { isLoading, data, ndsAggregates } = useNdsData();
  const wellbores = useWellInspectSelectedWellbores();

  // state
  const [filteredData, setFilteredData] = useState<NdsView[]>(data);
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilters>(
    EMPTY_APPLIED_FILTERS
  );
  const [selectedViewMode, setSelectedViewMode] = useState<NdsViewModes>(
    NdsViewModes.Treemap
  );
  const [detailedViewNdsData, setDetailedViewNdsData] = useState<NdsView[]>();

  const treemapData = useMemo(
    () => generateNdsTreemapData(wellbores, filteredData),
    [wellbores, filteredData]
  );

  const filtersData = useDeepMemo(
    () =>
      Object.values(ndsAggregates).reduce(
        mergeUniqueArray,
        getEmptyNdsAggregatesMerged()
      ),
    [ndsAggregates]
  );

  const detailedViewNdsAggregate = useMemo(
    () => getNdsAggregateForWellbore(detailedViewNdsData || [], ndsAggregates),
    [detailedViewNdsData]
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
    setFilteredData(data);
  }, [data]);

  useEffect(() => {
    const filteredData = getFilteredNdsData(data, appliedFilters);
    setFilteredData(filteredData);
  }, [appliedFilters]);

  useEffect(() => {
    const { riskTypesAndSubtypes, severities, probabilities } = filtersData;
    setAppliedFilters({
      riskType: riskTypesAndSubtypes,
      severity: severities,
      probability: probabilities,
    });
  }, [data, filtersData]);

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <>
      <FiltersBar>
        <ViewModeControl
          views={Object.values(NdsViewModes)}
          selectedView={selectedViewMode}
          onChangeView={setSelectedViewMode}
        />

        <Filters
          {...filtersData}
          appliedFilters={appliedFilters}
          onChangeFilter={handleChangeFilter}
        />
      </FiltersBar>

      {selectedViewMode === NdsViewModes.Treemap && (
        <NdsTreemap data={treemapData} onClickTile={setDetailedViewNdsData} />
      )}

      {selectedViewMode === NdsViewModes.Table && (
        <NdsTable data={filteredData} onClickView={setDetailedViewNdsData} />
      )}

      <DetailedView
        data={filteredData}
        detailedViewNdsData={detailedViewNdsData}
        setDetailedViewNdsData={setDetailedViewNdsData}
        ndsAggregate={detailedViewNdsAggregate}
      />
    </>
  );
};

export default NdsEvents;
