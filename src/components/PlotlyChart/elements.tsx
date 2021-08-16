import styled from 'styled-components/macro';
import { Button, Icon } from '@cognite/cogs.js';
import Layers from 'utils/z-index';

/* eslint-disable @cognite/no-number-z-index */
export const LoadingIcon = () => (
  <Icon
    type="Loading"
    style={{
      top: 10,
      left: 10,
      position: 'relative',
      zIndex: 2,
      float: 'left',
    }}
  />
);

export const ChartingContainer = styled.div`
  height: 100%;
  width: 100%;

  & > .adjust-button {
    visibility: hidden;
  }

  &:hover > .adjust-button {
    visibility: visible;
  }
`;

export const PlotWrapper = styled.div`
  height: 100%;
  width: 100%;
  // Expanding the y-axis hitbox
  .nsdrag {
    width: 60px;
    transform: translateX(-17px);
  }
`;

export const AdjustButton = styled(Button)`
  position: absolute;
  background-color: white;
  top: 30px;
  left: ${(props: { left: number }) => props.left}%;
  margin-left: 40px;
  z-index: ${Layers.MAXIMUM};
  background: white;
`;
