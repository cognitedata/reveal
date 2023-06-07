import styled from 'styled-components';

import { Body } from '@cognite/cogs.js';

export const FormLabel = styled(Body)<{ required?: boolean }>`
  margin-bottom: 6px;
  margin-right: 4px;

  ${(props) =>
    props.required &&
    `  &:after {
    content: ' *';
    color: var(--cogs-red);
  }`}
`;
