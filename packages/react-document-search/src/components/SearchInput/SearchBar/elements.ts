import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';

export const SearchBarTextWrapper = styled.div`
  margin-left: 24px;
`;

export const SearchBarIconWrapper = styled(Icon).attrs({
  style: { position: 'absolute', left: '8px' },
})``;
