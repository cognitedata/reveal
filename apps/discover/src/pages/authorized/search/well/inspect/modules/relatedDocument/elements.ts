import styled from 'styled-components/macro';

import {
  TagRow,
  TagWrapper,
} from 'pages/authorized/search/document/header/elements';
import { Flex, FlexRow, sizes, FlexColumn } from 'styles/layout';

export const FlexContainer = styled(Flex)`
  gap: 8px;
`;

export const Header = styled.div`
  > ${TagRow} {
    margin-top: 0;
    margin-bottom: ${sizes.normal};
  }
  > * ${TagWrapper} {
    margin-top: ${sizes.normal};
    margin-bottom: 0;
  }
`;

export const ResultsContainer = styled(FlexColumn)`
  height: 100%;
  padding-right: ${(props: { fullWidth: boolean }) =>
    props.fullWidth ? '0' : sizes.normal};
  overflow: hidden;
`;

export const IconSeparator = styled(Flex)`
  width: 2px;
  height: 20px;
  background: var(--cogs-greyscale-grey3);
  border-radius: 4px;
  margin: 0px ${sizes.small};
  align-self: center;
`;

export const WidgetContainer = styled(Flex)`
  border-left: 1px solid var(--cogs-color-strokes-default);
  height: 100%;
  padding-left: ${sizes.normal};
  overflow-y: auto;
`;

export const DocumentTypeWidget = styled(FlexColumn)`
  background: var(--cogs-greyscale-grey1);
  border: 2px solid rgba(51, 51, 51, 0.02);
  box-sizing: border-box;
  border-radius: 12px;
  width: 100%;
  padding: ${sizes.normal};
  overflow-y: auto;
`;

export const DocTypeHeader = styled(FlexRow)`
  margin-bottom: ${sizes.extraSmall};
  height: 20px;
`;

export const DocTypeHeaderLabel = styled(Flex)`
  color: var(--cogs-greyscale-grey9);
  font-weight: 600;
  font-size: var(--cogs-t6-font-size);
  line-height: var(--cogs-t6-line-height);
  letter-spacing: var(--cogs-t6-letter-spacing);
`;

export const DocTypeCount = styled(Flex)`
  color: var(--cogs-greyscale-grey7);
  font-size: var(--cogs-b3-font-size);
  line-height: var(--cogs-b3-line-height);
  letter-spacing: -2.5e-5em;
  height: 18px;
`;

export const TableBulkActionsHolder = styled(Flex)`
  position: relative;
`;

export const HeaderSearchWrapper = styled(FlexRow)`
  padding-top: ${sizes.normal};
  .tippy-box {
    max-width: none !important; // Overwrite tippy's max width for SyntaxHelper
  }
`;

export const InputContainer = styled.div`
  width: 250px;
  & > * .input-wrapper {
    width: 100%;
  }
  & > * input {
    width: 100%;
  }
`;

export const WarningWrapper = styled.div`
  margin-top: 20px;
`;
