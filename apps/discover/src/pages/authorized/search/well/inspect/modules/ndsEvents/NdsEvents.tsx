import { useNdsAggregatesByWellboreIdsQuery } from 'domain/wells/service/nds/queries/useNdsAggregatesByWellboreIdsQuery';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreIds';
import { useWellInspectSelectedWellbores } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellbores';

import React, { useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import { OptionType } from '@cognite/cogs.js';

import EmptyState from 'components/EmptyState';
import { MultiSelectCategorized } from 'components/Filters';
import { MultiSelectOptionType } from 'components/Filters/MultiSelect/types';
import {
  MultiSelectCategorizedOption,
  Category,
} from 'components/Filters/MultiSelectCategorized/types';
import { useDeepEffect } from 'hooks/useDeep';

import { ViewModeControl } from '../common/ViewModeControl';

import { NdsViewModes } from './constans';
import { DetailedView } from './detailedView';
import { NdsControlWrapper } from './elements';
import { NdsTable } from './table';
import { NdsTreemap } from './treemap';
import { NdsView } from './types';
import { useNdsData } from './useNdsData';
import { generateNdsFilterDataFromAggregate } from './utils/generateNdsFilterDataFromAggregate';
import { generateNdsTreemapData } from './utils/generateNdsTreemapData';

const SELECT_TITLE = 'Risk type & subtype';

const NdsEvents: React.FC = () => {
  // data
  const wellboreIds = useWellInspectSelectedWellboreIds();
  const selectedWellbores = useWellInspectSelectedWellbores();
  const { data: ndsAggregates } =
    useNdsAggregatesByWellboreIdsQuery(wellboreIds);
  const { data, isLoading } = useNdsData();

  const treemapData = useMemo(
    () => generateNdsTreemapData(selectedWellbores, data),
    [selectedWellbores, data]
  );

  // state
  const [selectedViewMode, setSelectedViewMode] = useState<NdsViewModes>(
    NdsViewModes.Treemap
  );
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
        <ViewModeControl
          views={Object.values(NdsViewModes)}
          selectedView={selectedViewMode}
          onChangeView={setSelectedViewMode}
        />
        <MultiSelectCategorized
          title={SELECT_TITLE}
          width={300}
          options={riskTypeFilters}
          onValueChange={setSelected}
        />
      </NdsControlWrapper>

      {selectedViewMode === NdsViewModes.Treemap && (
        <NdsTreemap data={treemapData} onClickTile={setDetailedViewNdsData} />
      )}

      {selectedViewMode === NdsViewModes.Table && (
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
