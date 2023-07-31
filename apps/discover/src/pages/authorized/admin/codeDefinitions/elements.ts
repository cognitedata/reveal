import styled from 'styled-components/macro';

import { FlexColumn, FlexRow } from 'styles/layout';

export const Wrapper = styled(FlexRow)`
  height: 100%;
`;

export const CodeDefinitionsWrapper = styled(FlexColumn)`
  max-width: 850px;
  height: 100%;
`;
export const LeftPanel = styled(FlexColumn)`
  width: 400px;
  height: 100%;
  border-right: 1px solid var(--cogs-color-strokes-default);
  background: rgba(250, 250, 250, 1);
  padding: 32px 15px;
`;

export const RightPanel = styled(FlexColumn)`
  padding: 40px 16px;
  align-items: center;
`;

export const BreadcrumbWrapper = styled(FlexRow)`
  align-items: center;
  padding-bottom: 16px;
`;

export const EmptyStateWrapper = styled.div`
  margin-top: 100px;
`;

export const CodeDefinitionItemWrapper = styled(FlexRow)<{ hasLabel: boolean }>`
  padding-bottom: 5px;
  justify-content: space-between;
  width: 80%;
  flex-shrink: 0;
  // we are setting the height so the UI doesn't "jump" when helper text shows up
  height: ${(props: { hasLabel: boolean }) =>
    props.hasLabel ? '85px' : '60px'};
`;

export const TitleWrapper = styled.div`
  padding-bottom: 56px;
`;

export const CodeDefinitionsListWrapper = styled(FlexColumn)`
  overflow: auto;
`;
