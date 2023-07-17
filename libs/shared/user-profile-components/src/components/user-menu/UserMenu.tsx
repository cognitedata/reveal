import { PropsWithChildren } from 'react';

import styled from 'styled-components';

import { Avatar, Body, Divider, Flex, Loader, Menu } from '@cognite/cogs.js';

import { UserInfo } from '../../common/types';
import { OnTrackEvent, manageAccountClickEvent } from '../../metrics';

export type UserMenuProps = PropsWithChildren & {
  userInfo?: UserInfo;
  isUserInfoLoading?: boolean;
  onManageAccountClick: () => void;
  onLogoutClick: () => void;
  menuTitle?: string;
  menuItemManageAccountBtnText?: string;
  menuItemLogoutBtnText?: string;
  onTrackEvent?: OnTrackEvent;
};

export const UserMenu = ({
  userInfo,
  isUserInfoLoading,
  onManageAccountClick,
  onLogoutClick,
  menuTitle = 'Account',
  menuItemManageAccountBtnText = 'Manage Account',
  menuItemLogoutBtnText = 'Sign out',
  onTrackEvent,
  children,
}: UserMenuProps): JSX.Element => {
  const { name = '', email = '', profilePicture = '' } = userInfo || {};

  return (
    <StyledUserMenu>
      <Menu.Header>{menuTitle}</Menu.Header>
      <UserDetailsMenuItem>
        {isUserInfoLoading && <Loader />}
        {!isUserInfoLoading && (
          <>
            <Avatar text={name} image={profilePicture} />
            <Flex direction="column" justifyContent="center">
              <Body level={2}>{name}</Body>
              {!!email && (
                <Body level={2} muted>
                  {email}
                </Body>
              )}
            </Flex>
          </>
        )}
      </UserDetailsMenuItem>
      <Menu.Item
        icon="ExternalLink"
        onClick={() => {
          onTrackEvent?.(manageAccountClickEvent);
          onManageAccountClick();
        }}
      >
        {menuItemManageAccountBtnText}
      </Menu.Item>
      <Divider />
      {children && <>{children}</>}
      {children && <Divider />}
      <Menu.Item icon="Logout" onClick={onLogoutClick}>
        {menuItemLogoutBtnText}
      </Menu.Item>
    </StyledUserMenu>
  );
};

const StyledUserMenu = styled(Menu)`
  min-width: 312px !important;
  max-width: unset !important;
`;

const UserDetailsMenuItem = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
`;
