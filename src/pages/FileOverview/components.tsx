import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  width: 100%;
  height: calc(100vh - 180px);
  flex-direction: column;
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  margin-top: 20px;
  box-sizing: border-box;
`;

export const TitleRowWrapper = styled.div`
  h1 {
    margin: 0;
  }
  margin: 16px 0px;
  padding-left: 16px;
  border-bottom: 1px solid ${Colors['greyscale-grey3'].hex()};
  padding-bottom: 10px;
  display: flex;
`;

export const NameWrapper = styled.div`
  display: flex;
  align-items: center;
`;

export const NameHeader = styled.h1`
  color: inherit;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const TabTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
`;
