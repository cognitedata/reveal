import React, { useCallback } from 'react';

import styled from 'styled-components';

import { v4 as uuid } from 'uuid';

import { Body, Icon, Modal, Button, Tooltip, toast } from '@cognite/cogs.js';

import { translationKeys } from '../common';
import { TOAST_POSITION } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import { IndustryCanvasContextType } from '../IndustryCanvasContext';
import { CanvasVisibility } from '../services/IndustryCanvasService';
import { SerializedCanvasDocument } from '../types';
import { UserProfile } from '../UserProfileProvider';
import { getCanvasLink } from '../utils/getCanvasLink';
import {
  getCanvasVisibilityIcon,
  getCanvasVisibilityBodyText,
  getCanvasVisibilityToggleText,
} from '../utils/getCanvasVisibility';

type CanvasVisibilityModalProps = Pick<
  IndustryCanvasContextType,
  'saveCanvas' | 'isSavingCanvas'
> & {
  canvas: SerializedCanvasDocument | undefined;
  onCancel: VoidFunction;
  userProfile: UserProfile;
};

const CanvasVisibilityModal: React.FC<CanvasVisibilityModalProps> = ({
  canvas,
  onCancel,
  saveCanvas,
  isSavingCanvas,
  userProfile,
}) => {
  const { t } = useTranslation();

  const handleToggleVisibilityClick = useCallback(
    async (visibility?: string) => {
      if (canvas === undefined) {
        return;
      }

      const toggledVisibility =
        visibility === CanvasVisibility.PUBLIC
          ? CanvasVisibility.PRIVATE
          : CanvasVisibility.PUBLIC;
      await saveCanvas({ ...canvas, visibility: toggledVisibility });
    },
    [canvas, saveCanvas]
  );

  // Here check if canvas exists.
  if (canvas === undefined) return null;
  const isCanvasVisible = canvas !== undefined;
  const isCurrentUserCanvasOwner =
    userProfile.userIdentifier === canvas.createdBy;

  // Here we are sure that canvas exists.
  const { visibility } = canvas;

  const renderVisibilityToggleButton = () => {
    if (isSavingCanvas) {
      return <Button size="small" disabled icon="Loader" />;
    }

    if (isCurrentUserCanvasOwner) {
      return (
        <Button
          size="small"
          onClick={() => handleToggleVisibilityClick(visibility)}
          loading={isSavingCanvas}
        >
          {t(translationKeys.VISIBILITY_MODAL_TOGGLE_BUTTON, {
            visibilityToggleText: getCanvasVisibilityToggleText(t, visibility),
            defaultValue: 'Make {{visibilityToggleText}}',
          })}
        </Button>
      );
    }

    return (
      <Tooltip
        content={t(
          translationKeys.VISIBILITY_MODAL_TOGGLE_BUTTON_TOOLTIP,
          'Only the owner of the canvas can change the visibility setting.'
        )}
      >
        <Button
          disabled
          size="small"
          onClick={() => handleToggleVisibilityClick(visibility)}
          loading={isSavingCanvas}
        >
          {t(translationKeys.VISIBILITY_MODAL_TOGGLE_BUTTON, {
            visibilityToggleText: getCanvasVisibilityToggleText(t, visibility),
            defaultValue: 'Make {{visibilityToggleText}}',
          })}
        </Button>
      </Tooltip>
    );
  };

  return (
    <StyledModal
      visible={isCanvasVisible}
      title={t(translationKeys.VISIBILITY_MODAL_TITLE, {
        canvasTitle: canvas?.name,
        defaultValue: 'Sharing canvas; "{{canvasTitle}}"',
      })}
      onCancel={onCancel}
      onOk={onCancel}
      okText="Done"
      additionalActions={
        // Here we can not disable Copy URL button for private canvases, limited by cogs.
        // We need to write a custom footer for the action buttons to do that.
        isCurrentUserCanvasOwner
          ? {
              children: `${t(translationKeys.VISIBILITY_COPY_URL, 'Copy URL')}`,
              icon: 'Link',
              iconPlacement: 'left',
              onClick: () => {
                navigator.clipboard.writeText(
                  `${window.location.origin}${getCanvasLink(
                    canvas?.externalId
                  )}`
                );
                // TODO: This needs to be refactored.
                // It is not convenient to copy that code block everytime toast is needed.
                // Here using toast is also not the best idea since the message stays behind the modal shade.
                toast.success(
                  <div>
                    <b>
                      {t(
                        translationKeys.CANVAS_LINK_COPIED_TITLE,
                        'Canvas link copied'
                      )}
                    </b>
                    <p>
                      {t(
                        translationKeys.CANVAS_LINK_COPIED_SUB_TITLE,
                        'Canvas link successfully copied to your clipboard'
                      )}
                    </p>
                  </div>,
                  {
                    toastId: `canvas-link-copied-${uuid()}`,
                    position: TOAST_POSITION,
                  }
                );
              },
            }
          : undefined
      }
    >
      <VisibilityToggleWrapper>
        <VisibilityToggleTextWrapper>
          {!isSavingCanvas && (
            <>
              <Icon type={getCanvasVisibilityIcon(visibility)} />
              <Body level={2}>
                {getCanvasVisibilityBodyText(t, visibility)}
              </Body>
            </>
          )}
        </VisibilityToggleTextWrapper>
        {renderVisibilityToggleButton()}
      </VisibilityToggleWrapper>
    </StyledModal>
  );
};

export default CanvasVisibilityModal;

const StyledModal = styled(Modal)`
  .cogs-modal-footer {
    .cogs.cogs-button.cogs-button--type-ghost {
      color: var(--cogs-text-icon--interactive--default);
    }
  }

  .cogs-modal-footer {
    .cogs-modal-footer-buttons {
      .cogs-modal-cancel-button {
        display: none;
      }
    }
  }
`;

const VisibilityToggleWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;

  .cogs.cogs-button {
    flex-shrink: 0;
  }
`;

const VisibilityToggleTextWrapper = styled.div`
  display: flex;
  align-items: center;

  i {
    margin-right: 5px;
  }
`;
