import { useMemo, useState } from 'react';

import styled from 'styled-components';

import { json } from '@codemirror/lang-json';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { logout } from '@cognite/cdf-sdk-singleton';
import { CodeSnippet, createLink } from '@cognite/cdf-utilities';
import { Avatar, Button, Dropdown, Menu } from '@cognite/cogs.js';
import { UserMenu as SharedUserMenu } from '@cognite/user-profile-components';

import { useTranslation } from '../../../../../i18n';
import { LARGE_MODAL_WIDTH } from '../../../../utils/constants';
import { useTokenInspect, useUserInformation } from '../../../../utils/hooks';
import Modal from '../../../Modal';

const UserMenu = (): JSX.Element => {
  const { t } = useTranslation();

  const { data: userInfo } = useUserInformation();

  const { data: tokenInspect } = useTokenInspect();

  const [isAccessInfoModalOpen, setIsAccessInfoModalOpen] = useState(false);

  const name = userInfo?.displayName ?? '';
  const email = userInfo?.mail ?? '';
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
    <div data-testid="topbar-user-profile-area">
      <StyledDropdown
        appendTo={document.body}
        hideOnSelect={{
          hideOnContentClick: true,
          hideOnOutsideClick: true,
        }}
        content={
          <SharedUserMenu
            userInfo={{ name, email, profilePicture }}
            onLogoutClick={handleLogout}
            menuTitle={t('title-account')}
            menuItemManageAccountBtnText={t('manage-account')}
            menuItemLogoutBtnText={t('button-sign-out')}
            onTrackEvent={(eventName, metaData) => {
              trackEvent(`CdfHubNavigation.UserMenu.${eventName}`, metaData);
            }}
            profilePageRelativePath={createLink('/profile')}
          >
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
          </SharedUserMenu>
        }
      >
        {avatar}
      </StyledDropdown>
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
    </div>
  );
};

const StyledDropdown = styled(Dropdown)`
  .tippy-box {
    max-width: unset !important; /* tippy styles are inline so !important is necessary to override */
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

export default UserMenu;
