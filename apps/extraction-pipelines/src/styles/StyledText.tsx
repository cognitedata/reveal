import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';

export const Code = styled.code`
  padding: 0.1rem 0.2rem;
  background-color: ${Colors['greyscale-grey2'].hex()};
  border: 1px solid ${Colors['greyscale-grey3'].hex()};
`;
