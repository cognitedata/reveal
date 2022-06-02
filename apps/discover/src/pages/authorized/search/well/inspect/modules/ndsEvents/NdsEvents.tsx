import { filterByRiskTypes } from 'domain/wells/dataLayer/nds/adapters/filterByRiskTypes';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores';

import React, { useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import { OptionType } from '@cognite/cogs.js';

import EmptyState from 'components/EmptyState';
import { MultiSelectCategorized } from 'components/Filters';
import { MultiSelectOptionType } from 'components/Filters/MultiSelect/types';
import { useDeepCallback, useDeepEffect } from 'hooks/useDeep';
import { FlexRow } from 'styles/layout';

import { ViewModeControl } from '../common/ViewModeControl';

import {
  FILTER_WIDTH,
  NdsViewModes,
  RISK_TYPE_FILTER_TITLE,
} from './constants';
import { DetailedView } from './detailedView';
import { NdsControlWrapper } from './elements';
import { NdsTable } from './table';
import { NdsTreemap } from './treemap';
import { NdsView } from './types';
import { useNdsData } from './useNdsData';
import { generateNdsTreemapData } from './utils/generateNdsTreemapData';
import { getNdsAggregateForWellbore } from './utils/getNdsAggregateForWellbore';

const NdsEvents: React.FC = () => {
  // data
  const { isLoading, data, ndsAggregates, riskTypeFilters } = useNdsData();
  const wellbores = useWellInspectSelectedWellbores();

  // state
  const [filteredData, setFilteredData] = useState<NdsView[]>(data);
  const [selectedViewMode, setSelectedViewMode] = useState<NdsViewModes>(
    NdsViewModes.Treemap
  );
  const [detailedViewNdsData, setDetailedViewNdsData] = useState<NdsView[]>();

  useDeepEffect(() => {
    setFilteredData(data);
  }, [data]);

  const treemapData = useMemo(
    () => generateNdsTreemapData(wellbores, filteredData),
    [wellbores, filteredData]
  );

  const detailedViewNdsAggregate = useMemo(
    () => getNdsAggregateForWellbore(detailedViewNdsData || [], ndsAggregates),
    [detailedViewNdsData]
  );

  const handleChangeRiskTypeFilter = useDeepCallback(
    (
      values: Record<string, OptionType<MultiSelectOptionType>[] | undefined>
    ) => {
      const riskTypes = Object.keys(values);
      const filteredData = filterByRiskTypes(data, riskTypes);
      setFilteredData(filteredData);
    },
    [data]
  );

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <>
      <FlexRow>
        <NdsControlWrapper>
          <ViewModeControl
            views={Object.values(NdsViewModes)}
            selectedView={selectedViewMode}
            onChangeView={setSelectedViewMode}
          />
        </NdsControlWrapper>

        <MultiSelectCategorized
          title={RISK_TYPE_FILTER_TITLE}
          width={FILTER_WIDTH}
          options={riskTypeFilters}
          onValueChange={handleChangeRiskTypeFilter}
        />
      </FlexRow>

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
