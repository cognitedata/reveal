/**
 * Elements for CSV Modal
 */

import styled from 'styled-components';

import { Icon, Input } from '@cognite/cogs.js';

export const ExampleText = styled.p`
  font-size: 10px;
  color: #555;
`;

export const FullWidthInput = styled(Input)`
  width: 100%;
`;

export const Label = styled.label`
  font-weight: 500;
`;

export const FieldContainer = styled.div`
  margin-top: 20px;
`;

export const BottomContainer = styled.div`
  margin-top: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StatusContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const StatusText = styled.div`
  display: flex;
  align-items: center;
`;

export const StatusIcon = styled(Icon)`
  margin-right: 5px;
`;
