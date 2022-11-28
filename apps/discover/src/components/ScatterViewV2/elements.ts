import isUndefined from 'lodash/isUndefined';
import styled from 'styled-components/macro';

import { Flex, FlexColumn, PrettyScrollBar, sizes } from 'styles/layout';

export const ScatterViewWrapper = styled(Flex)`
  height: 100%;
  width: 100%;
  padding: ${sizes.extraSmall};
`;

export const ScattersContainer = styled(FlexColumn)`
  flex-wrap: wrap;
  gap: 3px;
  align-content: flex-start;
  overflow-x: ${(props: { overflow: string }) => props.overflow};
  ${PrettyScrollBar}
`;

export const Scatter = styled.div`
  width: ${sizes.small};
  height: ${sizes.small};
  border-radius: 2px;
  ${(props: {
    color: string;
    $pointer: boolean;
    $highlighted: boolean;
    opacity?: number;
  }) => `
    background: ${props.color};
    cursor: ${props.$pointer ? 'pointer' : 'auto'};
    border: ${props.$highlighted ? '2px solid rgba(0,0,0, 0.15)' : 'none'};
    opacity: ${isUndefined(props.opacity) ? 1 : props.opacity};
  `}
`;

export const OverflowActionWrapper = styled.div`
  position: absolute;
  right: ${sizes.extraSmall};
  align-self: center;
`;
