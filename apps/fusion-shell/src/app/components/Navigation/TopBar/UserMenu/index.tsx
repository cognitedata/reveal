import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { json } from '@codemirror/lang-json';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { logout } from '@cognite/cdf-sdk-singleton';
import { CodeSnippet, createLink } from '@cognite/cdf-utilities';
import {
  Avatar,
  Body,
  Button,
  Divider,
  Dropdown,
  Flex,
  Menu,
} from '@cognite/cogs.js';

import { useTranslation } from '../../../../../i18n';
import Modal from '../../../Modal';
import { LARGE_MODAL_WIDTH } from '../../../../utils/constants';
import { useTokenInspect, useUserInformation } from '../../../../utils/hooks';

const UserMenu = (): JSX.Element => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { data: userInfo } = useUserInformation();

  const { data: tokenInspect } = useTokenInspect();

  const [isAccessInfoModalOpen, setIsAccessInfoModalOpen] = useState(false);

  const name = userInfo?.displayName ?? userInfo?.user ?? '';
  const email = userInfo?.mail ?? userInfo?.email ?? '';
  const profilePicture = userInfo?.profilePicture;

  const editorExtensions = useMemo(() => [json()], []);
  const prettyToken = JSON.stringify(tokenInspect, null, 4);

  const avatar = profilePicture ? (
    <Avatar image={profilePicture} />
  ) : (
    <Avatar text={name} />
  );

  const handleLogout = async () => {
    trackEvent('Navigation.Logout.Click');
    logout();
  };

  return (
    <>
      <Dropdown
        hideOnSelect={{
          hideOnContentClick: true,
          hideOnOutsideClick: true,
        }}
        content={
          <StyledUserMenu>
            <Menu.Header>{t('title-account')}</Menu.Header>
            <UserDetailsMenuItem>
              {avatar}
              <Flex direction="column">
                <Body level={2}>{name}</Body>
                <Body level={2} muted>
                  {email}
                </Body>
              </Flex>
            </UserDetailsMenuItem>
            <Menu.Item
              onClick={() => {
                navigate(createLink('/profile'));
              }}
            >
              {t('manage-account')}
            </Menu.Item>
            <Divider />
            <Menu.Item onClick={() => setIsAccessInfoModalOpen(true)}>
              {t('label-access-info')}
            </Menu.Item>
            <Menu.Item
              icon="ExternalLink"
              iconPlacement="right"
              onClick={() => {
                trackEvent('Navigation.PrivacyPolicy.Click');
                window.open(
                  'https://www.cognite.com/en/policy',
                  '_blank',
                  'noopener noreferrer'
                );
              }}
            >
              {t('button-privacy-policy')}
            </Menu.Item>
            <Divider />
            <Menu.Item icon="Logout" onClick={handleLogout}>
              {t('button-sign-out')}
            </Menu.Item>
          </StyledUserMenu>
        }
      >
        {avatar}
      </Dropdown>
      <Modal
        footer={
          <Button onClick={() => setIsAccessInfoModalOpen(false)}>
            {t('tooltip-close')}
          </Button>
        }
        onCancel={() => setIsAccessInfoModalOpen(false)}
        title={t('label-access-info')}
        visible={isAccessInfoModalOpen}
        width={LARGE_MODAL_WIDTH}
      >
        <StyledAccessInfoModalContent>
          <CodeSnippet
            extensions={editorExtensions}
            lang="json"
            value={prettyToken}
          />
        </StyledAccessInfoModalContent>
      </Modal>
    </>
  );
};

const StyledUserMenu = styled(Menu)`
  .cogs-menu-divider {
    margin: 8px -8px;
  }
`;

const StyledAccessInfoModalContent = styled.div`
  flex-grow: 1;
  flex-basis: 0;
  min-height: 0;

  > div,
  .cm-theme,
  .cm-editor {
    height: 100%;
  }
`;

const UserDetailsMenuItem = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
`;

export default UserMenu;
