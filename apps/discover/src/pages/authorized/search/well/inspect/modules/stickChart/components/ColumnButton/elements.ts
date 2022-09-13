import styled from 'styled-components/macro';

import { sizes } from 'styles/layout';

export const ColumnButtonWrapper = styled.div`
  margin: auto;
  margin-top: ${sizes.extraSmall};
  button {
    width: fit-content;
    font-size: 12px;
  }
`;
