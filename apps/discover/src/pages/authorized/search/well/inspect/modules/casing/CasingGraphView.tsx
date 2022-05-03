import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';

import EmptyState from 'components/EmptyState';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellInspectSelectedWells } from 'modules/wellInspect/hooks/useWellInspect';
import {
  useCasingsForTable,
  useNptEventsForCasings,
  useNdsEventsForCasings,
} from 'modules/wellSearch/selectors';

import CasingView from './CasingView/CasingView';
import { SideModes } from './CasingView/types';
import { CasingViewListWrapper } from './elements';
import { getFortmattedCasingData } from './helper';

interface Props {
  scrollRef: React.RefObject<HTMLDivElement>;
  sideMode: SideModes;
}

export const CasingGraphView: React.FC<Props> = ({ scrollRef, sideMode }) => {
  const { data: preferredUnit } = useUserPreferencesMeasurement();

  const { casings, isLoading } = useCasingsForTable();

  const wells = useWellInspectSelectedWells();
  const { isLoading: isNptEventsLoading, events: nptEvents } =
    useNptEventsForCasings();
  const { isLoading: isNdsEventsLoading, events: ndsEvents } =
    useNdsEventsForCasings();

  const groupedCasings = useMemo(
    () => keyBy(getFortmattedCasingData(casings || [], preferredUnit), 'key'),
    [casings, preferredUnit]
  );

  if (isEmpty(wells)) {
    return <EmptyState />;
  }

  return (
    <CasingViewListWrapper ref={scrollRef}>
      {isLoading && <EmptyState isLoading={isLoading} />}
      {!isLoading &&
        wells.map((well) =>
          well.wellbores.map((wellbore) => {
            const data = groupedCasings[wellbore.id];
            return (
              <CasingView
                key={`${well.id}-${wellbore.id}-KEY`}
                wellName={well.name}
                wellboreName={wellbore?.name || wellbore?.description || ''}
                waterDepth={isEmpty(data) ? 0 : data.waterDepth}
                rkbLevel={isEmpty(data) ? 0 : data.rkbLevel}
                casings={isEmpty(data) ? [] : data.casings}
                unit={preferredUnit}
                nptEvents={nptEvents[wellbore.id]}
                ndsEvents={ndsEvents[wellbore.id]}
                isNptEventsLoading={isNptEventsLoading || isNdsEventsLoading}
                sideMode={sideMode}
              />
            );
          })
        )}
    </CasingViewListWrapper>
  );
};

export default CasingGraphView;
