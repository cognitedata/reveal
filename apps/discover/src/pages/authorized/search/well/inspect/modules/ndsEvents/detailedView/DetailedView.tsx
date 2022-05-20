import React from 'react';

import head from 'lodash/head';

import { OverlayNavigation } from 'components/OverlayNavigation';

import { WellboreNavigationPanel } from '../../common/WellboreNavigationPanel';

import { DetailedViewProps } from './types';

export const DetailedView: React.FC<DetailedViewProps> = ({
  data,
  detailedViewNdsData,
  setDetailedViewNdsData,
}) => {
  const currentWellboreName = head(detailedViewNdsData)?.wellboreName;

  const clearDetailedViewNdsData = () => setDetailedViewNdsData(undefined);

  return (
    <OverlayNavigation mount={Boolean(detailedViewNdsData)}>
      <WellboreNavigationPanel
        data={data}
        currentWellboreName={currentWellboreName}
        onClickBack={clearDetailedViewNdsData}
        onNavigate={setDetailedViewNdsData}
      />
    </OverlayNavigation>
  );
};
