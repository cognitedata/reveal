import styled from 'styled-components';

import { Colors, Elevations } from '@cognite/cogs.js';

export const ErrorPageContent = styled.div`
  margin: 80px 50px;
`;

export const Instructions = styled.div`
  margin-bottom: 28px;
`;

export const InfoWrapper = styled.div`
  background-color: ${Colors['surface--muted']};
  padding: 14px;
  margin: 14px;
  border-radius: 4px;
  box-shadow: ${Elevations['elevation--surface--non-interactive']};
`;

export const ErrorInfo = styled.div`
  color: ${Colors['text-icon--strong']};
  padding: 7px 14px;

  p:last-child {
    margin-bottom: 0;
  }
`;
