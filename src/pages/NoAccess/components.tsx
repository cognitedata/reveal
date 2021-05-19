import styled from 'styled-components';
import { Colors } from '@cognite/cogs.js';

export const Warning = styled.div`
  font-size: 16px;
  color: ${Colors['yellow-1'].hex()};
  font-weight: bold;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  svg {
    margin-right: 1em;
  }
`;

export const Instructions = styled.div`
  margin-bottom: 28px;
`;

export const AccessInfoWrapper = styled.div`
  background-color: white;
  padding: 14px;
  margin: 14px;
  border-radius: 4px;
`;

export const AccessInfo = styled.div`
  padding: 7px 14px;
  width: 100%;
  p:last-child {
    margin-bottom: 0;
  }
  strong {
    font-weight: bold;
  }
`;
