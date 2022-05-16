import React, { ReactNode, useState } from 'react';

import { Button } from '@cognite/cogs.js';
import { useTranslation } from '@cognite/react-i18n';

import { SearchUsers, UserOption } from 'components/search-users/SearchUsers';
import {
  SHARE_MODAL_BUTTON_TEXT,
  SHARE_MODAL_WIDTH,
} from 'pages/authorized/favorites/modals/constants';
import { FlexRow } from 'styles/layout';

import {
  BasicShareModalContainer,
  CustomModal,
  SearchUsersWrapper,
} from './elements';

export interface Props {
  isOpen: boolean;
  title: string;
  onCancel: () => void;
  onShare: (users: UserOption[]) => void;
  children: ReactNode;
}

export const BasicShareModal: React.FC<Props> = ({
  isOpen,
  title,
  onCancel,
  onShare,
  children,
}) => {
  const [selectedUsers, setSelectedUsers] = useState<UserOption[]>([]);
  const { t } = useTranslation();

  const handleOnConfirm = () => {
    onShare(selectedUsers);
    setSelectedUsers([]);
  };
  return (
    <CustomModal
      visible={isOpen}
      title={title || t(SHARE_MODAL_BUTTON_TEXT)}
      onCancel={onCancel}
      appElement={document.getElementById('root') || undefined}
      footer={null}
      okText={t(SHARE_MODAL_BUTTON_TEXT)}
      width={SHARE_MODAL_WIDTH}
    >
      <BasicShareModalContainer>
        <FlexRow>
          <SearchUsersWrapper data-testid="shared-user-input">
            <SearchUsers
              onUsersSelectedChange={(users) => {
                setSelectedUsers(users || []);
              }}
              selectedOptions={selectedUsers}
            />
          </SearchUsersWrapper>
          <Button
            type="primary"
            onClick={() => handleOnConfirm()}
            aria-label={t(SHARE_MODAL_BUTTON_TEXT)}
            data-testid="share-with-user-btn"
          >
            {t(SHARE_MODAL_BUTTON_TEXT)}
          </Button>
        </FlexRow>
        {children}
      </BasicShareModalContainer>
    </CustomModal>
  );
};
