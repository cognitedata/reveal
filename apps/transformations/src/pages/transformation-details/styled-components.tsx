import { PropsWithChildren } from 'react';

import styled from 'styled-components';

import { Body, Colors, Icon } from '@cognite/cogs.js';

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

export const StyledPreviewTopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: auto;
  padding: 8px 18px 0 18px;
`;

export const StyledPreviewTitleContainer = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
`;

export const ErrorIcon = styled(Icon).attrs({
  type: 'ErrorFilled',
  size: 25,
})`
  color: ${Colors['text-icon--status-critical']};
`;

export const SuccessIcon = styled(Icon).attrs({
  type: 'CheckmarkFilled',
  size: 25,
})`
  color: ${Colors['text-icon--status-success']};
`;
export const WarningIcon = styled(Icon).attrs({
  type: 'WarningFilled',
  size: 25,
})`
  color: ${Colors['text-icon--status-warning']};
`;
export const InfoIcon = styled(Icon).attrs({
  type: 'InfoFilled',
  size: 25,
})`
  color: ${Colors['text-icon--status-neutral']};
`;

export const StyledPreviewTitle = styled(
  (
    props: PropsWithChildren<{
      $status: 'success' | 'critical' | 'warning' | 'neutral';
    }>
  ) => (
    <Body level={3} strong {...props}>
      {props.children}
    </Body>
  )
)`
  color: ${({ $status = 'success' }) => Colors[`text-icon--status-${$status}`]};
`;

export const StyledPreviewTabTitleContainer = styled.span`
  display: flex;
  align-items: center;
`;

export const RawTableIcon = styled(Icon)`
  margin-right: 6px;
  color: #2e8551;
`;
