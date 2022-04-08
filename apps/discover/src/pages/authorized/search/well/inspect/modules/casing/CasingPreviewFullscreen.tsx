import React from 'react';

import { OverlayNavigation } from 'components/overlay-navigation';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useNptEventsForCasings } from 'modules/wellSearch/selectors';

import { SingleCasingContainer } from '../events/Npt/elements';
import {
  NavigationPanel,
  NavigationPanelData,
} from '../events/Npt/graph/SelectedWellboreView/NavigationPanel';

import CasingView from './CasingView/CasingView';
import { SideModes } from './CasingView/types';
import { FormattedCasings } from './interfaces';

interface Props {
  onClose: () => void;
  casing: FormattedCasings;
  sideMode: SideModes;
}

export const CasingPreviewFullscreen: React.FC<Props> = ({
  onClose,
  casing,
  sideMode,
}) => {
  const { isLoading: isEventsLoading, events } = useNptEventsForCasings();
  const { data: preferredUnit } = useUserPreferencesMeasurement();

  const navigationPanelData = {
    wellboreName: casing.wellboreName,
    wellName: casing.wellName,
  } as NavigationPanelData;

  return (
    <OverlayNavigation backgroundInvisibleMount mount>
      <NavigationPanel
        data={navigationPanelData}
        onCloseSelectedWellboreView={onClose}
        disableNavigation
      />
      <SingleCasingContainer>
        <CasingView
          key={`${casing.key}-casing-key`}
          wellName={casing.wellName}
          wellboreName={casing.wellboreName}
          casings={casing.casings}
          unit={preferredUnit}
          events={events[casing.key]}
          isEventsLoading={isEventsLoading}
          sideMode={sideMode}
        />
      </SingleCasingContainer>
    </OverlayNavigation>
  );
};
