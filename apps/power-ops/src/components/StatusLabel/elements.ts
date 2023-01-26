import { Chip } from '@cognite/cogs.js-v9';
import styled from 'styled-components';

export const StyledChip = styled(Chip)`
  width: 89px;
  justify-content: center;
`;

export const CustomFooter = styled.div`
  display: flex;
  width: 100%;
  justify-content: flex-end;
  margin-top: 30px;
`;

export const InfoSpan = styled('span')`
  display: block;
  max-height: 500px;
  white-space: pre-line;
  overflow: auto;
`;
