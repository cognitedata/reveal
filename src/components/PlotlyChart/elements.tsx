import styled from 'styled-components/macro';
import { Icon } from '@cognite/cogs.js';

/* eslint-disable @cognite/no-number-z-index */
export const LoadingIcon = () => (
  <Icon
    type="Loader"
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

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`;
