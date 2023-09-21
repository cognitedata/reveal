import React from 'react';

import { Button, Chip, Colors, Icon, Tooltip } from '@cognite/cogs.js';

import { translationKeys } from '../../../common';
import { useFileInfo } from '../../../hooks/useFileInfo';
import { useTranslation } from '../../../hooks/useTranslation';
import * as ContextualTooltip from '../ContextualTooltip';

type FileTooltipProps = {
  id: number;
  isCurrentFile?: boolean;
  onAddFileClick: () => void;
  onViewClick: () => void;
};

const FileTooltip: React.FC<FileTooltipProps> = ({
  id,
  isCurrentFile = false,
  onAddFileClick,
  onViewClick,
}) => {
  const { data: fileInfo, isLoading } = useFileInfo(id);
  const { t } = useTranslation();

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
            <Tooltip
              content={t(
                translationKeys.TOOLTIP_FILE_ADD_TO_CANVAS,
                'Add file to canvas'
              )}
            >
              <Button
                aria-label={t(
                  translationKeys.TOOLTIP_FILE_ADD_TO_CANVAS,
                  'Add file to canvas'
                )}
                icon="Add"
                onClick={onAddFileClick}
                inverted
              />
            </Tooltip>
          </ContextualTooltip.ButtonWrapper>

          <ContextualTooltip.ButtonWrapper>
            <Tooltip
              content={t(
                translationKeys.OPEN_IN_DATA_EXPLORER,
                'Open in Data Explorer'
              )}
            >
              <Button
                aria-label={t(
                  translationKeys.OPEN_IN_DATA_EXPLORER,
                  'Open in Data Explorer'
                )}
                icon="ExternalLink"
                onClick={onViewClick}
                inverted
              />
            </Tooltip>
          </ContextualTooltip.ButtonWrapper>
        </ContextualTooltip.ButtonsContainer>
      </ContextualTooltip.Header>
      {isCurrentFile && (
        // Without this div, the Chip will inherit the width of the ContextualTooltip.Container
        <div>
          <Chip
            label="Current file"
            type="default"
            size="x-small"
            prominence="strong"
          />
        </div>
      )}
    </ContextualTooltip.Container>
  );
};

export default FileTooltip;
