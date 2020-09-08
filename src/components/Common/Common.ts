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
`;

export const ButtonRow = styled.div`
  display: flex;
  align-items: stretch;

  & > * {
    margin-right: 6px;
    margin-bottom: 6px;
    display: inline-flex;
  }
  .spacer {
    flex: 1;
  }
  & > *:nth-last-child(1) {
    margin-left: 0px;
  }
`;

const HorizontalDivider = styled.div`
  width: 100%;
  height: 2px;
  margin-top: 8px;
  margin-bottom: 8px;
  background: ${Colors['greyscale-grey3'].hex()};
`;

const VerticalDivider = styled.div`
  height: 100%;
  height: 2px;
  margin-left: 8px;
  margin-right: 8px;
  background: ${Colors['greyscale-grey3'].hex()};
`;

export const Divider = {
  Vertical: VerticalDivider,
  Horizontal: HorizontalDivider,
};
