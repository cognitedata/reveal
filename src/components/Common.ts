import styled from 'styled-components';
import { lightGrey } from 'utils/Colors';

export type onResourceSelectedParams = {
  assetId?: number;
  fileId?: number;
  timeseriesId?: number;
};

export const SpacedRow = styled.div`
  display: flex;
  align-items: stretch;

  & > * {
    margin-right: 6px;
    display: inline-flex;
  }
  .spacer {
    flex: 1;
  }
  & > *:nth-last-child(1) {
    margin-right: 0px;
  }
`;

const HorizontalDivider = styled.div`
  width: 100%;
  height: 2px;
  margin-top: 8px;
  margin-bottom: 8px;
  background: ${lightGrey};
  display: inline-table;
`;

const VerticalDivider = styled.div`
  height: 100%;
  height: 2px;
  margin-left: 8px;
  margin-right: 8px;
  background: ${lightGrey};
  display: inline-table;
`;

export const Divider = {
  Vertical: VerticalDivider,
  Horizontal: HorizontalDivider,
};
