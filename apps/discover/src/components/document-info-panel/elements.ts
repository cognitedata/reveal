import styled from 'styled-components/macro';

import { Icon } from '@cognite/cogs.js';

import { Label, TitleStyle } from 'components/metadataTable/elements';
import { Label as TmpLabel } from 'components/tmp-label';
import { Ellipsis, sizes } from 'styles/layout';

export const PathContainer = styled.div`
  background-color: #f3f3f3;
  margin-top: ${sizes.extraSmall};
  padding: 5px 8px;
  cursor: ${(props: any) => (props.showCursor ? 'pointer' : 'default')};
  border-radius: ${sizes.extraSmall};
`;

export const PathHeader = styled(Label)`
  margin-bottom: 0px !important;
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
`;

export const CopyIcon = styled(Icon)`
  svg {
    height: ${sizes.normal};
    width: ${sizes.normal};
    color: var(--cogs-greyscale-grey7);
  }

  &:hover svg {
    color: var(--cogs-greyscale-grey9);
  }
`;

export const DocumentAssetsContainer = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DocumentAssetsHeader = styled(Label)`
  margin-bottom: ${sizes.extraSmall};
`;

export const DocumentAssetNamesContainer = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const DocumentAssetsHiddenCount = styled(TmpLabel)`
  position: absolute;
  left: ${(props: { left: number }) => props.left + 8}px;
  background-color: #e1e1e1 !important;
`;

export const DocumentAssetNone = styled.div`
  line-height: var(--cogs-t5-line-height);
  display: flex;
  color: var(--cogs-greyscale-grey6);
`;
