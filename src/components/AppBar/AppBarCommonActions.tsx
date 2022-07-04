import { Avatar, Icon, Menu, TopBar } from '@cognite/cogs.js';
import Config from 'models/charts/config/classes/Config';
import { MouseEventHandler } from 'react';
import { makeDefaultTranslations, translationKeys } from 'utils/translations';

const defaultTranslations = makeDefaultTranslations(
  'Help',
  'Early Adopter Group on Cognite Hub',
  'Privacy policy',
  'Feedback',
  'Account',
  'Profile',
  'Logout'
);

type Props = {
  userName: string;
  onFeedbackClick: MouseEventHandler<HTMLElement>;
  onProfileClick: MouseEventHandler<HTMLElement>;
  onLogoutClick: MouseEventHandler<HTMLElement>;
  translations?: typeof defaultTranslations;
};

function AppBarCommonActions({
  onFeedbackClick,
  onProfileClick,
  onLogoutClick,
  userName,
  translations,
}: Props) {
  const t = { ...defaultTranslations, ...translations };
  return (
    <TopBar.Actions
      className="downloadChartHide"
      actions={[
        {
          key: 'help',
          name: t.Help,
          component: (
            <span className="downloadChartHide">
              <Icon type="Help" />
            </span>
          ),
          menu: (
            <Menu>
              <Menu.Item
                href={Config.cogniteHubGroupUrl}
                style={{
                  color: 'var(--cogs-text-color)',
                }} // @ts-ignore Cogs does not have the correct typing for this element
                target="_blank"
              >
                {t['Early Adopter Group on Cognite Hub']}
              </Menu.Item>
              <Menu.Item
                href={Config.privacyPolicyUrl}
                style={{
                  color: 'var(--cogs-text-color)',
                }} // @ts-ignore Cogs does not have the correct typing for this element
                target="_blank"
              >
                {t['Privacy policy']}
              </Menu.Item>
              <Menu.Item onClick={onFeedbackClick}>{t.Feedback}</Menu.Item>
              <Menu.Footer>v {Config.version.substring(0, 7)}</Menu.Footer>
            </Menu>
          ),
        },
        {
          key: 'avatar',
          component: <Avatar text={userName} />,
          menu: (
            <Menu style={{ minWidth: '140px' }}>
              <Menu.Header>{t.Account}</Menu.Header>
              <Menu.Item
                style={{ color: 'var(--cogs-text-color)' }}
                onClick={onProfileClick}
              >
                {t.Profile}
              </Menu.Item>
              <Menu.Item onClick={onLogoutClick}>{t.Logout}</Menu.Item>
            </Menu>
          ),
        },
      ]}
    />
  );
}

AppBarCommonActions.defaultTranslations = defaultTranslations;
AppBarCommonActions.translationKeys = translationKeys(defaultTranslations);
AppBarCommonActions.translationNamespace = 'AppBarCommonActions';
AppBarCommonActions.displayName = 'AppBarCommonActions';

export default AppBarCommonActions;
