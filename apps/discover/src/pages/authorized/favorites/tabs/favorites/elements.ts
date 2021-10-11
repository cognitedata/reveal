import styled from 'styled-components/macro';

import InlineLink from 'components/inlineLink';
import { FlexColumn, sizes } from 'styles/layout';

export const ToggleContainer = styled.div`
  margin-right: 38px;

  & .cogs-switch {
    align-items: center;
    flex-direction: row-reverse;
  }

  & .switch-ui {
    margin-right: 0;
  }
`;

export const ToggleLabel = styled.div`
  font-size: 12px;
  white-space: nowrap;
`;

export const SummaryWrapper = styled(FlexColumn)`
  margin-top: ${sizes.medium};
  margin-bottom: ${sizes.medium};
  align-items: flex-start;

  // Needed because we need to size according to a parent element
  width: calc(100vw - 1120px);
`;

export const MetadataWrapper = styled(FlexColumn)`
  margin-top: ${sizes.normal};
  margin-bottom: ${sizes.normal};
`;

export const FilePathWrapper = styled(FlexColumn)`
  margin-bottom: ${sizes.normal};
`;
export const StyledInlineLink = styled(InlineLink)`
  text-decoration: underline;
  margin-bottom: ${sizes.small};
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;

export const FilePathContainer = styled.div`
  max-width: 80%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin-bottom: ${sizes.small};
`;

export const P = styled.span`
  max-width: 80%;
  margin-top: 0;
  padding-top: 0;
  margin-bottom: ${sizes.small};
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 4; /* number of lines to show */
  -webkit-box-orient: vertical;
`;

export const TabBar = styled.div`
  margin-top: ${sizes.large};
  padding-left: ${sizes.extraLarge};
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
  height: 48px;
`;

export const TabContent = styled.div`
  white-space: nowrap;
`;
