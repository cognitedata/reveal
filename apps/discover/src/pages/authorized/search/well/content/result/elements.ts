import styled from 'styled-components/macro';

import { FlexColumn, FlexRow, sizes } from 'styles/layout';

const TABLE_ROW_HEIGHT = 50;

export const WellsContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const OverlayCellPadding = styled.div`
  padding-right: ${sizes.small};
`;

export const WelboreResultsTableWrapper = styled.div`
  & div[role='row'] > div:first-of-type {
    width: 60px;
  }
`;

export const SearchResultsContainer = styled.div`
  height: 100%;
  width: 100%;
`;

export const WellBoreGroupCoumn = styled(FlexColumn)``;

export const OtherWellboresRow = styled(FlexRow)`
  margin-left: 30px;
  gap: 5px;
`;

export const ExpandCollapseIcon = styled.div`
  padding-left: 12px;
  padding-top: 8px;
`;

export const OtherWellboresSectionHeader = styled(FlexRow)`
  padding: 8px;
  gap: 5px;
`;

export const TooltipContainer = styled.div`
  padding: 4px;
`;

export const Message = styled.div`
  line-height: ${TABLE_ROW_HEIGHT}px;
  padding: 0 12px;
`;
