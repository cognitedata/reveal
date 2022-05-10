import React, { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';

import EmptyState from 'components/EmptyState';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellInspectSelectedWells } from 'modules/wellInspect/hooks/useWellInspect';
import {
  useNptEventsForCasings,
  useNdsEventsForCasings,
} from 'modules/wellSearch/selectors';

import CasingView from './CasingView/CasingView';
import { CasingViewTypeProps } from './CasingView/interfaces';
import { SideModes } from './CasingView/types';
import { CasingViewListWrapper } from './elements';
import { getFortmattedCasingData } from './helper';
import { CasingData } from './interfaces';

type ReturnCasing = CasingViewTypeProps & { key: string };
interface PublicProps {
  casings: CasingData[];
  scrollRef: React.RefObject<HTMLDivElement>;
  sideMode: SideModes;
}
interface ViewProps extends Pick<PublicProps, 'scrollRef'> {
  data: ReturnCasing[];
}

const useData = ({ casings, sideMode, scrollRef }: PublicProps): ViewProps => {
  const { data: preferredUnit } = useUserPreferencesMeasurement();

  const wells = useWellInspectSelectedWells();
  const { isLoading: isNptEventsLoading, events: nptEvents } =
    useNptEventsForCasings();
  const { isLoading: isNdsEventsLoading, events: ndsEvents } =
    useNdsEventsForCasings();

  const groupedCasings = useMemo(
    () => keyBy(getFortmattedCasingData(casings || [], preferredUnit), 'key'),
    [casings, preferredUnit]
  );

  const normalizedWells = wells
    .map((well) =>
      well.wellbores.map((wellbore) => {
        const data = groupedCasings[wellbore.id];

        return {
          ...data,
          key: `${well.id}-${wellbore.id}-KEY`,
          wellName: well.name,
          wellboreName: wellbore?.name || wellbore?.description || '',
          waterDepth: isEmpty(data) ? 0 : data.waterDepth,
          rkbLevel: isEmpty(data) ? 0 : data.rkbLevel,
          casings: isEmpty(data) ? [] : data.casings,
          nptEvents: nptEvents[wellbore.id],
          ndsEvents: ndsEvents[wellbore.id],
          unit: preferredUnit,
          sideMode,
          isNptEventsLoading: isNptEventsLoading || isNdsEventsLoading,
        } as ReturnCasing;
      })
    )
    .flat();

  return {
    data: normalizedWells || [],
    scrollRef,
  };
};

export const CasingGraphView: React.FC<ViewProps> = ({ data, scrollRef }) => {
  if (isEmpty(data)) {
    return <EmptyState />;
  }

  return (
    <CasingViewListWrapper ref={scrollRef}>
      {data.map((wellbore) => {
        return <CasingView {...wellbore} key={wellbore.key} />;
      })}
    </CasingViewListWrapper>
  );
};

export const CasingGraph: React.FC<PublicProps> = (props) => {
  const data = useData(props);
  return <CasingGraphView {...data} />;
};
