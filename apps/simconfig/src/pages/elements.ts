import { Label } from '@cognite/cogs.js';
import styled from 'styled-components/macro';

export const Container = styled.div`
  padding: 24px;
  min-height: calc(100vh);
`;
export const CollapsableContainer = styled.div`
  height: calc(100vh);
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0 24px 0;
`;

export const CapitalizedLabel = styled(Label)`
  text-transform: capitalize;
`;
