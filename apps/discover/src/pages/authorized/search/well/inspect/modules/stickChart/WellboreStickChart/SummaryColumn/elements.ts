import styled from 'styled-components/macro';

import { Button } from '@cognite/cogs.js';

import { FlexColumn, FlexRow, sizes } from 'styles/layout';
import { DURATION } from 'styles/transition';

import { BodyColumn } from '../../../common/Events/elements';

export const SummaryColumnWrapper = styled(BodyColumn)`
  width: 400px;
  overflow: hidden;
`;

export const SummariesWrapper = styled(FlexColumn)`
  overflow-y: scroll;

  ::-webkit-scrollbar {
    width: ${sizes.small};
    height: ${sizes.small};
  }
  ::-webkit-scrollbar-track {
    background: var(--cogs-greyscale-grey2);
  }
  ::-webkit-scrollbar-thumb {
    background: var(--cogs-greyscale-grey3);
    border-radius: ${sizes.small};
  }
  ::-webkit-scrollbar-thumb:hover {
    background: var(--cogs-greyscale-grey4);
  }
`;

export const SummaryContainer = styled(FlexRow)`
  padding: ${sizes.small};
  gap: ${sizes.normal};
  &:not(:last-child) {
    border-bottom: 1px solid var(--cogs-greyscale-grey3);
  }
`;

export const SummarySectionColumn = styled.span``;

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

export const SummarySectionContent = styled.div`
  white-space: initial;
  font-size: 12px;
  line-height: ${sizes.normal};
  margin-top: ${sizes.small};
  color: #000000;
  opacity: 90%;

  &:not(:last-child) {
    margin-bottom: 12px;
  }
`;

export const SummaryColumnEmptyStateSpacer = styled.div`
  height: 32px;
`;

export const SecondaryText = styled(SummarySectionContent)`
  margin-top: -10px;
  color: var(--cogs-greyscale-grey8);
`;

export const Depth = styled(SecondaryText)`
  &:before {
    content: '@';
  }
`;

export const EventText = styled(SecondaryText)`
  color: #000000;
  opacity: 90%;
`;
