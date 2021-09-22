import styled from 'styled-components';

export const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100vh - 105px);
  box-sizing: border-box;
`;

export const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  box-sizing: border-box;
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
