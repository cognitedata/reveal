import React, { useEffect, useMemo, useState } from 'react';

import { WhiteLoaderOverlay } from 'components/Loading';
import { EMPTY_ARRAY } from 'constants/empty';

import { DetailedView } from '../../ndsEvents/components/DetailedView';
import { NdsView } from '../../ndsEvents/types';
import { useNdsData } from '../../ndsEvents/useNdsData';
import { getNdsAggregateForWellbore } from '../../ndsEvents/utils/getNdsAggregateForWellbore';

interface WellboreNdsDetailedViewProps {
  selectedWellboreId?: string;
  onBackClick: () => void;
}

export const WellboreNdsDetailedView: React.FC<
  WellboreNdsDetailedViewProps
> = ({ selectedWellboreId, onBackClick }) => {
  // data
  const { isLoading, data: ndsEvents, ndsAggregates } = useNdsData();
  const [detailedViewNdsData, setDetailedViewNdsData] = useState<NdsView[]>([]);

  const detailedViewNdsAggregate = useMemo(
    () => getNdsAggregateForWellbore(detailedViewNdsData || [], ndsAggregates),
    [detailedViewNdsData, ndsAggregates]
  );

  useEffect(() => {
    setDetailedViewNdsData(
      selectedWellboreId
        ? ndsEvents.filter(
            (ndsEvent) => ndsEvent.wellboreMatchingId === selectedWellboreId
          )
        : EMPTY_ARRAY
    );
  }, [selectedWellboreId, ndsEvents]);

  return (
    <>
      <DetailedView
        data={ndsEvents}
        ndsAggregate={detailedViewNdsAggregate}
        isPreviousButtonDisabled={false}
        isNextButtonDisabled={false}
        onBackClick={onBackClick}
      />

      {isLoading && <WhiteLoaderOverlay />}
    </>
  );
};
