import { Flex, Icon, Body } from '@cognite/cogs.js';
import styled from 'styled-components';

export const Steps2Column = styled(Flex)`
  width: 50%;

  > h6 {
    margin-bottom: 0.5rem;
  }
`;

export const FlexGrow = styled.div`
  flex-grow: 1;
  width: 100%;
`;

export const ErrorIcon = styled(Icon)`
  color: var(--cogs-text-icon--status-critical);
`;

export const CenterAlignedBody = styled(Body)`
  text-align: center;
`;

export const PreviewStatus = styled.p<{ $variant?: string }>`
  vertical-align: middle;
  color: ${(props) => `var(--cogs-text-${props.$variant})`};

  > .cogs-icon {
    vertical-align: text-bottom;
    margin-right: 0.3rem;
  }
`;
