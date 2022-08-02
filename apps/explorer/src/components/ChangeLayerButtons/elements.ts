import { Title } from '@cognite/cogs.js';
import styled from 'styled-components';
import { sizes } from 'styles/layout';
import layers from 'utils/zindex';

export const LayerButtonWrapper = styled.div`
  position: absolute;
  z-index: ${layers.OVERLAY_MIDDLE};
  background: white;
  bottom: ${sizes.normal};
  right: ${sizes.normal};
`;

export const LayerText = styled(Title)`
  text-align: center;
`;

export const Divider = styled.div`
  align-self: stretch;
  border-top: 2px solid #d9d9d9;
  margin: ${sizes.extraSmall};
`;
