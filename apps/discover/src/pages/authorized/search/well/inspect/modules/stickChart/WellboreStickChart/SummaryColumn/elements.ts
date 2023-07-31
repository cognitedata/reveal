import styled from 'styled-components/macro';

import { Button } from '@cognite/cogs.js';

import { FlexColumn, FlexRow, PrettyScrollBar, sizes } from 'styles/layout';
import { DURATION } from 'styles/transition';

import { Avatar } from '../../components/DetailCard/elements';

export const SummariesWrapper = styled(FlexColumn)`
  ${PrettyScrollBar};
  overflow-y: scroll;
`;

export const SummaryContainer = styled(FlexRow)`
  padding: ${sizes.small};
  gap: ${sizes.normal};
  &:not(:last-child) {
    border-bottom: 1px solid var(--cogs-greyscale-grey3);
  }
`;

export const SummarySectionColumn = styled.div`
  width: ${(props: { width?: number }) => `${props.width}px`};
`;

export const SummarySectionToggleButton = styled(Button)`
  font-size: 12px;
  line-height: ${sizes.normal};
  padding: 2px 6px !important;
  height: 20px;
  width: fit-content;
  border-radius: ${sizes.extraSmall};

  .cogs-icon {
    margin-left: ${sizes.extraSmall};
  }
`;

export const SummaryColumnSectionWrapper = styled(FlexColumn)`
  height: fit-content;

  :last-child {
    border-bottom: 0;
  }
  &:not(:first-child) {
    padding-top: ${sizes.small};
  }
  &:not(:last-child) {
    padding-bottom: ${sizes.small};
  }
`;

export const SummaryColumnSectionContentWrapper = styled.div`
  max-height: 0;
  transition: max-height ${DURATION.SLOW} ease-out;
  overflow: hidden;
  transition-delay: -220ms;

  ${(props: { $visible: boolean }) =>
    props.$visible &&
    `
    max-height: 100vh;
    transition: max-height ${DURATION.SLOW} ease-in;
  `}
`;

export const SummarySectionContent = styled(FlexColumn)`
  flex-wrap: wrap;
  white-space: initial;
  font-size: 12px;
  line-height: ${sizes.normal};
  margin-top: ${sizes.small};
  padding-left: 6px;
  color: #000000;
  opacity: 90%;

  &:not(:last-child) {
    margin-bottom: 12px;
  }
`;

export const SummaryColumnEmptyStateSpacer = styled.div`
  height: 32px;
`;

export const SecondaryText = styled.span`
  color: var(--cogs-text-secondary);
`;

export const Depth = styled(SecondaryText)`
  flex-direction: row;
  &:before {
    content: '@';
    margin-right: ${sizes.extraSmall};
  }
`;

export const EventSpecificationWrapper = styled(FlexRow)`
  margin-top: ${sizes.extraSmall};

  ${Avatar} {
    margin-top: 1px;
  }
  ${Depth} {
    margin-left: ${sizes.extraSmall};
  }
`;

export const HighlightedEventText = styled(SecondaryText)`
  color: #000000;
  opacity: 90%;
  margin: 0 ${sizes.extraSmall};
`;

export const EmptyStateText = styled.span`
  color: var(--cogs-text-secondary);
  font-weight: 500;
`;
