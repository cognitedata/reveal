import React, { useMemo, useState } from 'react';

import head from 'lodash/head';

import { OverlayNavigation } from 'components/OverlayNavigation';

import { ViewModeControl } from '../../common/ViewModeControl';
import { WellboreNavigationPanel } from '../../common/WellboreNavigationPanel';
import { NdsTreemap } from '../treemap';
import { getRiskTypeTreemapData } from '../utils/getRiskTypeTreemapData';
import { getSubtypeTreemapData } from '../utils/getSubtypeTreemapData';

import { NdsDetailedViewModes } from './constants';
import { DetailedViewContent, ViewModeControlWrapper } from './elements';
import { DetailedViewTable } from './table';
import { DetailedViewProps } from './types';

export const DetailedView: React.FC<DetailedViewProps> = ({
  data,
  detailedViewNdsData,
  setDetailedViewNdsData,
}) => {
  const [selectedViewMode, setSelectedViewMode] =
    useState<NdsDetailedViewModes>(NdsDetailedViewModes.RiskType);

  const currentWellboreName = head(detailedViewNdsData)?.wellboreName;

  const clearDetailedViewNdsData = () => setDetailedViewNdsData(undefined);

  const riskTypeTreemapData = useMemo(
    () => getRiskTypeTreemapData(detailedViewNdsData || []),
    [detailedViewNdsData]
  );

  const subtypeTreemapData = useMemo(
    () => getSubtypeTreemapData(detailedViewNdsData || []),
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

      <ViewModeControlWrapper>
        <ViewModeControl
          views={Object.values(NdsDetailedViewModes)}
          selectedView={selectedViewMode}
          onChangeView={setSelectedViewMode}
        />
      </ViewModeControlWrapper>

      <DetailedViewContent>
        {selectedViewMode === NdsDetailedViewModes.RiskType && (
          <NdsTreemap data={riskTypeTreemapData} />
        )}

        {selectedViewMode === NdsDetailedViewModes.Subtype && (
          <NdsTreemap data={subtypeTreemapData} />
        )}

        {selectedViewMode === NdsDetailedViewModes.Table && (
          <DetailedViewTable data={detailedViewNdsData || []} />
        )}
      </DetailedViewContent>
    </OverlayNavigation>
  );
};
