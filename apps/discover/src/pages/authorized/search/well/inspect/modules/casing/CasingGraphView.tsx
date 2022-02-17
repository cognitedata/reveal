import React, { useMemo } from 'react';

import groupBy from 'lodash/groupBy';
import isEmpty from 'lodash/isEmpty';

import EmptyState from 'components/emptyState';
import { UserPreferredUnit } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellInspectSelectedWells } from 'modules/wellInspect/hooks/useWellInspect';
import {
  useCasingsForTable,
  useNptEventsForCasings,
} from 'modules/wellSearch/selectors';

import CasingView from './CasingView/CasingView';
import { CasingViewListWrapper } from './elements';
import { getFortmattedCasingData } from './helper';

type Props = {
  scrollRef: React.RefObject<HTMLDivElement>;
};

export const CasingGraphView: React.FC<Props> = ({ scrollRef }: Props) => {
  const { data: preferredUnit } = useUserPreferencesMeasurement();

  const { casings, isLoading } = useCasingsForTable();

  const wells = useWellInspectSelectedWells();
  const { isLoading: isEventsLoading, events } = useNptEventsForCasings();

  const formattedCasings = useMemo(
    () => getFortmattedCasingData(casings || [], preferredUnit),
    [casings, preferredUnit]
  );
  const groupedCasings = groupBy(formattedCasings, 'key');

  return (
    <CasingViewListWrapper ref={scrollRef}>
      {isLoading && <EmptyState isLoading={isLoading} />}
      {!isLoading &&
        wells.map((well) =>
          well.wellbores.map((wellbore) => {
            const rows = groupedCasings[wellbore.id];
            return (
              <CasingView
                key={`${well.id}-${wellbore.id}-KEY`}
                wellName={well.name}
                wellboreName={wellbore.description || ''}
                casings={isEmpty(rows) ? [] : rows[0].casings}
                unit={preferredUnit || UserPreferredUnit.FEET}
                events={events[wellbore.id]}
                isEventsLoading={isEventsLoading}
              />
            );
          })
        )}
    </CasingViewListWrapper>
  );
};

export default CasingGraphView;
