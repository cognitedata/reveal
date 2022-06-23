import React, { useMemo } from 'react';

import { Button } from '@cognite/cogs.js';

import { useTranslation } from 'hooks/useTranslation';
import { SHARE_MODAL_REMOVE_BUTTON_TEXT } from 'pages/authorized/favorites/modals/constants';
import { FlexColumn, FlexGrow } from 'styles/layout';

import {
  SharedWithHeader,
  SharedWithUserRow,
  SharedWithUserIcon,
  SharedWithUserName,
  SharedWithUserEmail,
  OwnerIndicator,
} from './elements';
import { SharedUser } from './types';
import { getFormattedUsers } from './utils';

export interface Props {
  users: SharedUser[];
  onRemove: (userId: string) => void;
}

export const SharedUsersList: React.FC<Props> = ({ users, onRemove }) => {
  const { t } = useTranslation();

  const sharedUsers = useMemo(() => getFormattedUsers(users), [users]);

  return (
    <>
      <SharedWithHeader>Shared with ({sharedUsers.length})</SharedWithHeader>
      {sharedUsers.map((user, index) => (
        <SharedWithUserRow key={user.id}>
          <SharedWithUserIcon>{user.iconCode}</SharedWithUserIcon>
          <FlexColumn>
            <SharedWithUserName data-testid="shared-with-username">
              {user.fullName}
              {index === 0 && <OwnerIndicator>Owner</OwnerIndicator>}
            </SharedWithUserName>
            <SharedWithUserEmail>{user.email}</SharedWithUserEmail>
          </FlexColumn>
          <FlexGrow />

          {index > 0 && (
            <Button
              type="ghost"
              onClick={() => onRemove(user.id)}
              aria-label={t(SHARE_MODAL_REMOVE_BUTTON_TEXT)}
              data-testid="shared-user-remove-btn"
            >
              {t(SHARE_MODAL_REMOVE_BUTTON_TEXT)}
            </Button>
          )}
        </SharedWithUserRow>
      ))}
    </>
  );
};
