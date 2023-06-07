import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

export const PrimaryButton = styled.button`
  background-color: ${Colors['midblue-3'].hex()};
  color: ${Colors.white.hex()};
  padding: 8px 16px;
  border-radius: 5px;
  border: none;
  line-height: 20px;
  cursor: pointer;
`;
