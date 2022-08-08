import React, { useEffect, useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';

import { Loading } from 'components/Loading';

import { DetailedView } from '../../../ndsEvents/components/DetailedView';
import { NdsView } from '../../../ndsEvents/types';
import { useNdsData } from '../../../ndsEvents/useNdsData';
import { getNdsAggregateForWellbore } from '../../../ndsEvents/utils/getNdsAggregateForWellbore';

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
        : []
    );
  }, [selectedWellboreId, ndsEvents]);

  if (isLoading || isEmpty(ndsAggregates)) {
    return <Loading />;
  }

  return (
    <DetailedView
      data={ndsEvents}
      ndsAggregate={detailedViewNdsAggregate}
      onBackClick={onBackClick}
    />
  );
};
