import styled from 'styled-components';

import { Colors } from '@cognite/cogs.js';

export const ErrorPageContent = styled.div`
  margin: 80px 50px;
`;

export const Instructions = styled.div`
  margin-bottom: 28px;
`;

export const InfoWrapper = styled.div`
  background-color: white;
  padding: 14px;
  margin: 14px;
  border-radius: 4px;
`;

export const ErrorInfo = styled.div`
  color: ${Colors['text-icon--strong']};
  padding: 7px 14px;

  p:last-child {
    margin-bottom: 0;
  }
`;
