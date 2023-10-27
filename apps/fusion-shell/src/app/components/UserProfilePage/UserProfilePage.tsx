import { getLanguage, selectLanguage } from '@cognite/cdf-i18n-utils';
import { trackEvent } from '@cognite/cdf-route-tracker';
import {
  Language,
  UserProfilePage as UserProfilePageComponent,
} from '@cognite/user-profile-components';

import { useTranslation } from '../../../i18n';
import { useUserInformation } from '../../utils/hooks';

export const UserProfilePage = (): JSX.Element => {
  const { data: userInfo, isInitialLoading } = useUserInformation();
  const name = userInfo?.displayName ?? '';
  const email = userInfo?.mail ?? '';
  const profilePicture = userInfo?.profilePicture;

  const { t } = useTranslation();

  return (
    <UserProfilePageComponent
      isUserInfoLoading={isInitialLoading}
      userInfo={{ name, email, profilePicture }}
      onLanguageChange={(language) => {
        selectLanguage(language?.code || 'en');
      }}
      selectedLanguage={
        SUPPORTED_LANGUAGES.find(
          (language) => language.code === getLanguage()
        ) || SUPPORTED_LANGUAGES[0]
      }
      supportedLanguages={SUPPORTED_LANGUAGES as Language[]}
      languageTabLocale={{
        languageFieldLabel: t('language-field-label'),
      }}
      sidebarLocale={{
        languageTabBtnText: t('profile-tab-language-title'),
        personalInfoTabBtnText: t('profile-tab-info-title'),
      }}
      personalInfoTabLocale={{
        emailFieldHelpText: t('email-field-help-text'),
        emailFieldLabel: t('email-field-label'),
        nameFieldHelpText: t('name-field-help-text'),
        nameFieldLabel: t('name-field-label'),
      }}
      profileHeaderLocale={{
        backBtnText: t('profile-header-back-btn-text'),
      }}
      onTrackEvent={(eventName, metaData) => {
        trackEvent(`CdfHubNavigation.UserMenu.${eventName}`, metaData);
      }}
    />
  );
};

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pt', label: 'Português' },
  { code: 'sv', label: 'Svenska' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
];
