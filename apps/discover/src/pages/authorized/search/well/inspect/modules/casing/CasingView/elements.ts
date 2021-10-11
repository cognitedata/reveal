import styled from 'styled-components/macro';

import mainPalette from 'styles/default.palette';

export const CasingViewListWrapper = styled.div`
  height: calc(100% - 4px);
  white-space: nowrap;
`;

export const CasingViewWrapper = styled.div`
  height: calc(100% - 32px);
  display: inline-block;
  margin-right: 10px;
`;

export const WellName = styled.div`
  color: ${mainPalette.black};
  font-weight: bold;
  padding-bottom: 14px;
  padding-left: 6px;
  font-size: 15px;
`;

export const CenterLine = styled.div`
  display: inline-block;
  width: 20px;
  height: 100%;
`;

export const RightGutter = styled.div`
  display: inline-block;
  font-size: 15px;
  text-transform: lowercase;
  visibility: hidden;
`;
