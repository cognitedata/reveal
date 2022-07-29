import styled from 'styled-components/macro';

import { FlexColumn, FlexRow, sizes } from 'styles/layout';

import { BodyColumn } from '../../../common/Events/elements';

export const SummaryColumnWrapper = styled(BodyColumn)`
  width: 350px;
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
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
`;

export const SummarySectionColumn = styled(FlexColumn)`
  &:not(:last-child) {
    margin-right: ${sizes.normal};
  }
`;

export const SummarySection = styled(FlexColumn)`
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
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

export const SummarySectionContent = styled.div`
  white-space: initial;
  font-size: 12px;
  line-height: ${sizes.normal};
  margin-top: ${sizes.extraSmall};
  color: #000000;
  opacity: 90%;

  &:not(:last-child) {
    margin-bottom: 12px;
  }
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
