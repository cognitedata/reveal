import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { PlusButton, MinusButton } from 'components/Buttons';
import { sizes } from 'styles/layout';

export const MAP_ZOOM_IN_TOOLTIP = 'Zoom in';
export const MAP_ZOOM_OUT_TOOLTIP = 'Zoom out';

const NavigationButtonsContainer = styled.div`
  border-radius: 8px;
  flex-direction: column;
  display: flex;
  padding: 2px;
  top: 50%;
  transform: translateY(-50%);
  margin-right: ${sizes.normal};
  box-shadow: var(--cogs-z-4);

  position: absolute;
  right: 0px;
  z-index: ${layers.MAP_RIGHT_BUTTONS};
  background: var(--cogs-white);
`;

const Separator = styled.div`
  height: 1px;
  margin: ${sizes.extraSmall};
  background: var(--cogs-greyscale-grey4);
`;

interface Props {
  map: any;
}

export const MapNavigationPanel: React.FC<Props> = ({ map }) => {
  const handleZoomIn = () => {
    if (map) map.zoomIn();
  };

  const handleZoomOut = () => {
    if (map) map.zoomOut();
  };

  const { t } = useTranslation('Search');

  const zoomLevel = map ? map.getZoom() : 5;

  return useMemo(
    () => (
      <NavigationButtonsContainer>
        <PlusButton
          margin={false}
          type="ghost"
          tooltip={MAP_ZOOM_IN_TOOLTIP}
          tooltipPlacement="left"
          disabled={zoomLevel > 12}
          onClick={handleZoomIn}
          data-testid="map-zoom-in"
          aria-label="Zoom in"
        />

        <Separator />

        <MinusButton
          type="ghost"
          margin={false}
          tooltip={t(MAP_ZOOM_OUT_TOOLTIP)}
          tooltipPlacement="left"
          disabled={zoomLevel < 4}
          onClick={handleZoomOut}
          data-testid="map-zoom-out"
          aria-label="Zoom out"
        />
      </NavigationButtonsContainer>
    ),
    [zoomLevel, map]
  );
};
