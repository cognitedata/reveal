import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';
import { sizes } from 'styles/layout';

export const FieldWrapper = styled.div`
  margin-top: ${sizes.small};
  background: white;
  border-radius: 6px;
  padding: 10px 7px;
  line-height: normal;
  display: flex;
  justify-content: space-between;
`;

export const FullWidthButton = styled(Button)`
  width: 100%;
`;
