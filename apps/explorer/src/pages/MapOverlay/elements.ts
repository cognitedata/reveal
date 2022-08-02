import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';
import { sizes } from 'styles/layout';
import layers from 'utils/zindex';

export const RoutingViewWrapper = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  z-index: ${layers.MAXIMUM};
  padding: 16px;
  background: rgba(0, 0, 0, 0.75);
`;

export const DivWithMarginTop = styled.div`
  margin-top: ${sizes.small};
`;

export const AbsoluteDisplayWrapper = styled.div`
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
  z-index: ${layers.OVERLAY}; ;
`;

export const FullWidthButton = styled(Button)`
  width: 100%;
`;
