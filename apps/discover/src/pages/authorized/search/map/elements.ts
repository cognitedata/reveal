import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { MapOverlayPadding } from 'pages/authorized/search/elements';
import { sizes } from 'styles/layout';

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
