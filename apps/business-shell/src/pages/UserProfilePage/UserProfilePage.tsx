import {
  useTypedTranslation as useTranslation,
  getLanguage,
  selectLanguage,
} from '@cognite/cdf-i18n-utils';
import {
  Language,
  UserProfilePage as SharedUserProfilePage,
} from '@cognite/user-profile-components';

import { useTracker } from '../../app/common/metrics';
import { useUserInfo } from '../../hooks/useUserInfo';

const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'de', label: 'Deutsch' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'it', label: 'Italiano' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'nb', label: 'Norsk' },
  { code: 'pt', label: 'Português' },
  { code: 'sv', label: 'Svenska' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
  { code: 'ja', label: '日本語' },
];

const selectedLanguage =
  SUPPORTED_LANGUAGES.find((language) => language.code === getLanguage()) ||
  SUPPORTED_LANGUAGES[0];

export const UserProfilePage = (): JSX.Element => {
  const { t } = useTranslation();
  const { data, isLoading } = useUserInfo();
  const { name, email } = data || {};
  const { track } = useTracker();

  const handleLanguageChange = (language: Language | undefined) => {
    selectLanguage(language?.code || 'en');
  };

  return (
    <SharedUserProfilePage
      userInfo={{ name, email }}
      isUserInfoLoading={isLoading}
      selectedLanguage={selectedLanguage}
      supportedLanguages={SUPPORTED_LANGUAGES}
      onLanguageChange={handleLanguageChange}
      sidebarLocale={{
        personalInfoTabBtnText: t('PERSONAL_INFO_TAB_BTN_TEXT'),
        languageTabBtnText: t('LANGUAGE_TAB_BTN_TEXT'),
      }}
      personalInfoTabLocale={{
        title: t('PERSONAL_INFO_TAB_TITLE'),
        nameFieldLabel: t('NAME_FIELD_LABEL'),
        nameFieldHelpText: t('NAME_FIELD_HELP_TEXT'),
        emailFieldLabel: t('EMAIL_FIELD_LABEL'),
        emailFieldHelpText: t('EMAIL_FIELD_HELP_TEXT'),
      }}
      profileHeaderLocale={{
        backBtnText: t('BACK_TO_PREV_BTN_TEXT'),
      }}
      languageTabLocale={{
        title: t('LANGUAGE_TAB_TITLE'),
        languageFieldLabel: t('LANGUAGE_FIELD_LABEL'),
      }}
      onTrackEvent={(eventName, metaData) => {
        track(`BusinessShell.UserProfilePage.${eventName}`, metaData);
      }}
    />
  );
};
