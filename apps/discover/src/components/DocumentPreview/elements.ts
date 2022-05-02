import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

import { Label, TitleStyle } from 'components/MetadataTable/elements';
import { Ellipsis, sizes } from 'styles/layout';

export const PathContainer = styled.div`
  background-color: #f3f3f3;
  margin-top: ${sizes.extraSmall};
  padding: 5px 8px;
  cursor: ${(props: any) => (props.showCursor ? 'pointer' : 'default')};
  border-radius: ${sizes.extraSmall};
`;

export const PathHeader = styled(Label)`
  margin-bottom: ${sizes.extraSmall} !important;
`;

export const PreviewHeader = styled(Label)`
  margin-bottom: ${sizes.extraSmall};
`;

export const PathText = styled(TitleStyle)`
  font-weight: 400;
  margin: 0;
  color: var(--cogs-greyscale-grey7);
  margin-right: ${sizes.normal};
  ${Ellipsis};
`;

export const ReportIssueText = styled(PathText)`
  text-decoration: underline;
  display: inline;
  cursor: pointer;
`;

export const FilePathContainer = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: ${sizes.small};
`;

export const CopyIcon = styled(Icon)`
  cursor: pointer;
  svg {
    height: ${sizes.normal};
    width: ${sizes.normal};
    color: var(--cogs-greyscale-grey7);
  }

  &:hover svg {
    color: var(--cogs-greyscale-grey9);
  }
`;
