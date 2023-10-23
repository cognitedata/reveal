import React, { useCallback, useEffect, useState } from 'react';

import styled from 'styled-components';

import differenceWith from 'lodash/differenceWith';
import { v4 as uuid } from 'uuid';

import { Body, Icon, Modal, Button, Tooltip, toast } from '@cognite/cogs.js';

import { translationKeys } from '../common';
import { TOAST_POSITION } from '../constants';
import { UserSearch } from '../containers';
import { useAuth2InvitationsMutation } from '../hooks/use-mutation/useAuth2InvitationsMutation';
import { useAuth2RevokeInvitationsMutation } from '../hooks/use-mutation/useAuth2RevokeInvitationsMutation';
import { useAuth2InvitationsByResource } from '../hooks/use-query/useAuth2InvitationsByResource';
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
import { isCogniteIdPUsedToSignIn } from '../utils/isCogniteIdPUsedToSignIn';

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
  const isCogniteIdP = isCogniteIdPUsedToSignIn();

  const { t } = useTranslation();

  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);

  const { invitationsByResource = [], isFetched } =
    useAuth2InvitationsByResource({
      externalId: canvas?.externalId,
      isEnabled: isCogniteIdP && canvas?.externalId !== undefined,
    });

  const { mutate: revokeInvitation } = useAuth2RevokeInvitationsMutation({
    externalId: canvas?.externalId,
  });
  const { mutate: sendInvitation } = useAuth2InvitationsMutation({
    externalId: canvas?.externalId,
  });

  useEffect(() => {
    if (isFetched) {
      setSelectedUsers(invitationsByResource);
    }
    // We can not put 'invitationsByResource' in dep array here, it creates an update loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetched]);

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
  if (canvas === undefined) {
    return null;
  }

  // If canvas is passed to the modal it means modal should be visible.
  const isCanvasVisible = canvas !== undefined;
  const isCurrentUserCanvasOwner =
    userProfile.userIdentifier === canvas.createdBy;

  // Here we are sure that canvas exists.
  const { visibility } = canvas;

  const handleUserSelected = (user: UserProfile) => {
    // Here doesn't allow to add the same user or the canvas owner again.
    if (
      (selectedUsers !== undefined &&
        selectedUsers.findIndex(
          (selectedUser) => selectedUser.userIdentifier === user.userIdentifier
        ) >= 0) ||
      user.userIdentifier === canvas.createdBy
    ) {
      toast.warning(
        <div>
          <b>
            {t(
              translationKeys.VISIBILITY_MODAL_DUPLICATE_USER_TOAST_TITLE,
              'User is already selected'
            )}
          </b>
          <p>
            {t(
              translationKeys.VISIBILITY_MODAL_DUPLICATE_USER_TOAST_SUBTITLE,
              'You can not select a user multiple times for share.'
            )}
          </p>
        </div>,
        {
          toastId: `add-share-user-${user.userIdentifier}`,
          position: TOAST_POSITION,
        }
      );
      return;
    }

    if (selectedUsers !== undefined) {
      setSelectedUsers([...selectedUsers, user]);
    } else {
      setSelectedUsers([user]);
    }
  };

  const handleUserRemoved = (userId: string) => {
    if (selectedUsers === undefined) {
      return;
    }

    // For now, only the canvas owner can remove/uninvite users.
    // Later we can add that users can uninvite themselves from the canvases that they are shared with.
    if (!isCurrentUserCanvasOwner) {
      // Maybe add a toast message here.
      return;
    }

    const removedUserIndex = selectedUsers.findIndex(
      (user) => user.userIdentifier === userId
    );

    selectedUsers.splice(removedUserIndex, 1);
    setSelectedUsers([...selectedUsers]);
  };

  const handleOkClick = () => {
    // Here find the diffs for invite/uninvite flows
    if (isCogniteIdP) {
      const removedUsers = differenceWith(
        invitationsByResource,
        selectedUsers,
        (baseUser, comparedUser) =>
          baseUser.userIdentifier === comparedUser.userIdentifier
      );
      if (removedUsers.length > 0) {
        revokeInvitation({
          externalId: canvas.externalId,
          userIdsToUninvite: removedUsers.map((user) => user.userIdentifier),
        });
      }

      const newUsers = differenceWith(
        selectedUsers,
        invitationsByResource,
        (baseUser, comparedUser) =>
          baseUser.userIdentifier === comparedUser.userIdentifier
      );
      if (newUsers.length > 0) {
        sendInvitation({
          externalId: canvas.externalId,
          title: canvas.name,
          canvasUrl: window.location.href,
          userIdsToInvite: newUsers.map((user) => user.userIdentifier),
          sendEmail: true, //this should be 'true' if we want to send emails to the users.
        });
      }
    }

    onCancel();
  };

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
        defaultValue: 'Sharing "{{canvasTitle}}"',
      })}
      onCancel={onCancel}
      onOk={handleOkClick}
      okText="Done"
      size="small"
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
      {isCogniteIdP && (
        <UserSearch
          key={canvas.externalId}
          activeCanvas={canvas}
          selectedUsers={selectedUsers}
          onUserRemoved={handleUserRemoved}
          onUserSelected={handleUserSelected}
        />
      )}
      <VisibilityToggleWrapper>
        <VisibilityToggleTextWrapper>
          {!isSavingCanvas && (
            <>
              <div className="icon-wrapper">
                <Icon type={getCanvasVisibilityIcon(visibility)} />
              </div>
              <Body level={2}>
                {getCanvasVisibilityBodyText(t, visibility)}
              </Body>
            </>
          )}
        </VisibilityToggleTextWrapper>
        <div className="toggle-button-wrapper">
          {renderVisibilityToggleButton()}
        </div>
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
  height: 40px;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;

  .toggle-button-wrapper {
    margin: auto 0;
    margin-left: 10px;
    flex-shrink: 0;
  }
`;

const VisibilityToggleTextWrapper = styled.div`
  display: flex;
  align-items: center;

  .icon-wrapper {
    width: 16px;
    margin-right: 5px;
  }

  i {
    margin-right: 5px;
  }
`;
