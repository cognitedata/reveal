import React from 'react';

import { Button, Colors, Icon, Tooltip } from '@cognite/cogs.js';

import { useFileInfo } from '../../../hooks/useFileInfo';
import * as ContextualTooltip from '../ContextualTooltip';

type FileTooltipProps = {
  id: number;
  onAddFileClick: () => void;
  onViewClick: () => void;
};

const FileTooltip: React.FC<FileTooltipProps> = ({
  id,
  onAddFileClick,
  onViewClick,
}) => {
  const { data: fileInfo, isLoading } = useFileInfo(id);

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  if (fileInfo === undefined) {
    // This should probably never happen
    return null;
  }

  return (
    <ContextualTooltip.Container>
      <ContextualTooltip.Header>
        <ContextualTooltip.InnerHeaderWrapper>
          <ContextualTooltip.StyledIcon
            type="Document"
            color={Colors['decorative--orange--300']}
          />
          <ContextualTooltip.Label>
            {fileInfo.name ?? fileInfo.externalId ?? fileInfo.id}
          </ContextualTooltip.Label>
        </ContextualTooltip.InnerHeaderWrapper>

        <ContextualTooltip.ButtonsContainer>
          <ContextualTooltip.ButtonWrapper>
            <Tooltip content="Add file to canvas">
              <Button icon="Add" onClick={onAddFileClick} inverted />
            </Tooltip>
          </ContextualTooltip.ButtonWrapper>

          <ContextualTooltip.ButtonWrapper>
            <Tooltip content="Open file in Data Explorer">
              <Button icon="ExternalLink" onClick={onViewClick} inverted />
            </Tooltip>
          </ContextualTooltip.ButtonWrapper>
        </ContextualTooltip.ButtonsContainer>
      </ContextualTooltip.Header>
    </ContextualTooltip.Container>
  );
};

export default FileTooltip;
