import { Button } from '@cognite/cogs.js';
import styled from 'styled-components';

export const BlankPopupContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  height: 100%;
`;

export const FullWidthButton = styled(Button)`
  width: 100%;
`;
