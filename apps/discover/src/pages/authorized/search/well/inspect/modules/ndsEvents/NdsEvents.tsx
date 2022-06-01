import { useNdsAggregatesByWellboreIdsQuery } from 'domain/wells/service/nds/queries/useNdsAggregatesByWellboreIdsQuery';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreIds';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores';

import React, { useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import { OptionType, SegmentedControl } from '@cognite/cogs.js';

import EmptyState from 'components/EmptyState';
import { MultiSelectCategorized } from 'components/Filters';
import { MultiSelectOptionType } from 'components/Filters/MultiSelect/types';
import {
  MultiSelectCategorizedOption,
  Category,
} from 'components/Filters/MultiSelectCategorized/types';
import { useDeepEffect, useDeepMemo } from 'hooks/useDeep';

import { DetailedView } from './detailedView';
import { NdsControlWrapper } from './elements';
import { NdsTable } from './table';
import { NdsTreemap } from './treemap';
import { NdsView } from './types';
import { useNdsData } from './useNdsData';
import { generateNdsFilterDataFromAggregate } from './utils/generateNdsFilterDataFromAggregate';
import { generateNdsTreemapData } from './utils/generateNdsTreemapData';

type SelectedView = 'treemap' | 'table';
const SELECT_TITLE = 'Risk type & subtype';

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

  const [riskTypeFilters, setRiskTypeFilters] = useState<
    MultiSelectCategorizedOption[]
  >([]);
  const [selected, setSelected] =
    useState<
      Record<Category, OptionType<MultiSelectOptionType>[] | undefined>
    >();
  console.log(selected);

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

        <MultiSelectCategorized
          title={SELECT_TITLE}
          width={300}
          options={riskTypeFilters}
          onValueChange={setSelected}
        />
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
