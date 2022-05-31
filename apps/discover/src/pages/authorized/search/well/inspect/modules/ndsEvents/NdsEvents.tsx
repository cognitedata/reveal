import { useNdsAggregatesByWellboreIdsQuery } from 'domain/wells/service/nds/queries/useNdsAggregatesByWellboreIdsQuery';

import React, { useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import { SegmentedControl } from '@cognite/cogs.js';

import EmptyState from 'components/EmptyState';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';
import {
  useWellInspectSelectedWellboreIds,
  useWellInspectSelectedWellbores,
} from 'modules/wellInspect/hooks/useWellInspect';

import { DetailedView } from './detailedView';
import { NdsControlWrapper } from './elements';
import { NdsTable } from './table';
import { NdsTreemap } from './treemap';
import { FilterData, NdsView } from './types';
import { useNdsData } from './useNdsData';
import { generateNdsFilterDataFromAggregate } from './utils/generateNdsFilterDataFromAggregate';
import { generateNdsTreemapData } from './utils/generateNdsTreemapData';

type SelectedView = 'treemap' | 'table';

const NdsEvents: React.FC = () => {
  // data
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const selectedWellbores = useWellInspectSelectedWellbores();
  const { data: ndsAggregates } =
    useNdsAggregatesByWellboreIdsQuery(wellboreIds);
  const { data, isLoading } = useNdsData();

  const treemapData = useDeepMemo(
    () => generateNdsTreemapData(selectedWellbores, data),
    [selectedWellbores, data]
  );

  // state
  const [selectedView, setSelectedView] = useState<SelectedView>('treemap');
  const [detailedViewNdsData, setDetailedViewNdsData] = useState<NdsView[]>();

  const [riskTypeFilters, setRiskTypeFilters] = useState<FilterData[]>([]);
  console.log(riskTypeFilters);

  useDeepEffect(() => {
    if (ndsAggregates) {
      setRiskTypeFilters(generateNdsFilterDataFromAggregate(ndsAggregates));
    }
  }, [ndsAggregates]);

  if (isEmpty(data)) {
    return <EmptyState isLoading={isLoading} />;
  }

  return (
    <>
      <NdsControlWrapper>
        <SegmentedControl
          currentKey={selectedView}
          onButtonClicked={(view) => setSelectedView(view as SelectedView)}
        >
          <SegmentedControl.Button key="treemap">
            Treemap
          </SegmentedControl.Button>
          <SegmentedControl.Button key="table">Table</SegmentedControl.Button>
        </SegmentedControl>
      </NdsControlWrapper>

      {selectedView === 'treemap' && <NdsTreemap data={treemapData} />}

      {selectedView === 'table' && (
        <NdsTable data={data} onClickView={setDetailedViewNdsData} />
      )}

      <DetailedView
        data={data}
        detailedViewNdsData={detailedViewNdsData}
        setDetailedViewNdsData={setDetailedViewNdsData}
      />
    </>
  );
};

export default NdsEvents;
