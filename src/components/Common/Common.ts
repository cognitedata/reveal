import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

export type onResourceSelectedParams = {
  assetId?: number;
  fileId?: number;
  timeseriesId?: number;
};

export const Wrapper = styled.div`
  width: 100%;
  flex: 1;
  padding: 24px;
  overflow: auto;
  background: ${Colors['greyscale-grey1'].hex()};

  dl,
  dt {
    background: ${Colors['greyscale-grey1'].hex()};
    border-color: ${Colors['greyscale-grey4'].hex()};
  }

  .button-row {
    & > * {
      margin-right: 6px;
      margin-bottom: 6px;
      display: inline-flex;
    }
    & > *:nth-last-child(1) {
      margin-left: 0px;
    }
  }
`;
