import React from 'react';

import { OverlayNavigation } from 'components/OverlayNavigation';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import {
  useNptEventsForCasings,
  useNdsEventsForCasings,
} from 'modules/wellSearch/selectors';

import { SingleCasingContainer } from '../events/Npt/elements';
import {
  NavigationPanel,
  NavigationPanelData,
} from '../events/Npt/graph/SelectedWellboreNptView/NavigationPanel';

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
  const { isLoading: isNptEventsLoading, events: nptEvents } =
    useNptEventsForCasings();
  const { isLoading: isNdsEventsLoading, events: ndsEvents } =
    useNdsEventsForCasings();
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
          waterDepth={casing.waterDepth}
          rkbLevel={casing.rkbLevel}
          casings={casing.casings}
          unit={preferredUnit}
          nptEvents={nptEvents[casing.key]}
          ndsEvents={ndsEvents[casing.key]}
          isNptEventsLoading={isNptEventsLoading}
          isNdsEventsLoading={isNdsEventsLoading}
          sideMode={sideMode}
        />
      </SingleCasingContainer>
    </OverlayNavigation>
  );
};
