import styled from 'styled-components';
import { Flex } from '@cognite/cogs.js';

export const SourceOptionContainer = styled(Flex)`
  width: 100%;
`;

export const EllipsesText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const SourceIconContainer = styled(Flex)`
  background-color: ${(props) => props.color};
  color: white;
  height: 24px;
  width: 24px;
  border-radius: 6px;
  margin-right: 8px;
  flex-shrink: 0;
`;
