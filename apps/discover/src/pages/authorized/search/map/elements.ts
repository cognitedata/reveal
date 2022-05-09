import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { MapOverlayPadding } from 'pages/authorized/search/elements';
import { Flex, FlexRow, sizes } from 'styles/layout';

export const Spacer = styled.div`
  flex-grow: 1;
  pointer-events: none;
`;

export const TopButtonMenuContainer = styled(MapOverlayPadding)`
  justify-content: flex-end;
  position: absolute;
  margin-top: ${sizes.normal};
  z-index: ${layers.MAP_TOP_BUTTONS};
  display: flex;
  right: 0;
  width: 100%;
  padding-right: ${sizes.small};
  padding-left: ${sizes.normal};

  > div {
    margin-right: ${sizes.small};
    white-space: nowrap;
  }

  > div.isHidden {
    opacity: 0;
    pointer-events: none;
  }
`;

export const MapWrapper = styled.div`
  height: 100%;
  display: flex;
  width: 100%;
`;

export const MapContainer = styled.div`
  z-index: ${layers.MAP};
  height: 100%;
  width: 100%;
  padding: 0;
  border: none;
  position: relative;
  border-left: 1px solid var(--cogs-color-strokes-default);
  margin-bottom: -30px; // <-- quick fix: Couldn't get the map to behave properly in its container.
`;

export const MapDocumentPreviewContainer = styled.div`
  position: absolute;
  z-index: ${layers.MAP_DOCUMENT_PREVIEW};
`;

export const MapBlockExpander = styled.div`
  position: absolute;
  background: transparent;
  z-index: ${layers.MAP_EXPANDER};
  height: 100%;
  width: 60px;
`;

export const FloatingActionsWrapper = styled.div`
  padding: ${sizes.extraSmall};
  background-color: var(--cogs-white);
  border-radius: ${sizes.small};
  display: flex;
  flex-direction: row;
  z-index: ${layers.MAP_TOP_BUTTONS};

  .cogs-btn-primary {
    margin-right: ${sizes.extraSmall};
  }
`;

export const DialogHeader = styled(FlexRow)`
  height: 44px;
  display: flex;
  align-items: center;
  padding: 0 ${sizes.extraSmall};
`;

export const DialogHeaderLabel = styled(Flex)`
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--cogs-greyscale-grey9);
  font-size: var(--cogs-t5-font-size);
  line-height: var(--cogs-t5-line-height);
  letter-spacing: var(--cogs-t5-letter-spacing);
`;

export const DialogFooter = styled(FlexRow)`
  justify-content: flex-end;
  .cogs-btn {
    margin-left: 10px;
    border-radius: 6px;
  }
  .cogs-btn-ghost {
    color: var(--cogs-red-2);
  }
`;
