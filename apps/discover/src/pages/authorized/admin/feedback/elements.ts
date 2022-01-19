import styled from 'styled-components/macro';

import { Label } from '@cognite/cogs.js';

import { FlexRow, sizes } from 'styles/layout';

export const TabBar = styled(FlexRow)`
  background: var(--cogs-white);
  border-bottom: 1px solid var(--cogs-color-strokes-default);
  height: 68px;
  padding: ${sizes.normal};
  justify-content: space-between;
  align-items: center;
`;

export const EmptyCell = styled.span`
  color: var(--cogs-greyscale-grey6);
`;

export const DocumentFeedbackDetailsWrapper = styled.div`
  padding-top: ${sizes.normal};
  padding-right: ${sizes.large};
  padding-bottom: ${sizes.normal};
  padding-left: ${sizes.large};
`;

export const SensitiveWarning = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  padding: ${sizes.small};
  background: ${(props: { resolved: boolean }) =>
    props.resolved ? 'rgba(0, 0, 0, 0.05)' : 'rgba(213, 26, 70, 0.1)'};
  white-space: nowrap;
`;

export const SensitiveWarningText = styled.span`
  margin-right: ${sizes.normal};
`;

export const TableDropdown = styled.div`
  width: 100%;
`;

export const FeedbackContent = styled.div`
  overflow: hidden;
`;

export const SmallGreyLabel = styled(Label).attrs({
  size: 'small',
  variant: 'unknown',
})``;
