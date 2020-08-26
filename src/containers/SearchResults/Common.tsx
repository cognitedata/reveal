import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

export const List = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;
export const Content = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;
export const Preview = styled.div`
  padding-left: 16px;
  width: 360px;
  overflow-y: auto;
  margin-left: 16px;
  border-left: 2px solid ${Colors['greyscale-grey3'].hex()};
`;
