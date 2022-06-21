import { A, TopBar, TopBarLogoProps } from '@cognite/cogs.js';
import { ComponentProps } from 'react';
import {
  getTranslationsForComponent,
  makeDefaultTranslations,
  translationKeys,
} from 'utils/translations';
import AppBarCommonActions from './AppBarCommonActions';

const defaultTranslations = makeDefaultTranslations(
  'Cognite Charts',
  ...AppBarCommonActions.translationKeys
);

type Props = {
  onLogoClick: TopBarLogoProps['onLogoClick'];
  userName: ComponentProps<typeof AppBarCommonActions>['userName'];
  onFeedbackClick: ComponentProps<
    typeof AppBarCommonActions
  >['onFeedbackClick'];
  onProfileClick: ComponentProps<typeof AppBarCommonActions>['onProfileClick'];
  onLogoutClick: ComponentProps<typeof AppBarCommonActions>['onLogoutClick'];
  translations?: typeof defaultTranslations;
};

const AppBar = ({
  onLogoClick,
  translations,
  onFeedbackClick,
  onProfileClick,
  onLogoutClick,
  userName,
}: Props) => {
  const t = { ...defaultTranslations, ...translations };
  return (
    <TopBar style={{ backgroundColor: '#FFF' }}>
      <TopBar.Left>
        <A onClick={onLogoClick} style={{ color: 'var(--cogs-text-color)' }}>
          <TopBar.Logo
            title={t['Cognite Charts']}
            onLogoClick={onLogoClick}
            style={{ cursor: 'pointer' }}
          />
        </A>
        <div id="appbar-left" style={{ flexGrow: 1 }} />
      </TopBar.Left>
      <TopBar.Right>
        <div id="appbar-right" />
        <AppBarCommonActions
          onFeedbackClick={onFeedbackClick}
          onProfileClick={onProfileClick}
          onLogoutClick={onLogoutClick}
          userName={userName}
          translations={getTranslationsForComponent(t, AppBarCommonActions)}
        />
      </TopBar.Right>
    </TopBar>
  );
};

AppBar.defaultTranslations = defaultTranslations;
AppBar.translationKeys = translationKeys(defaultTranslations);
AppBar.translationNamespace = 'AppBar';

export default AppBar;
