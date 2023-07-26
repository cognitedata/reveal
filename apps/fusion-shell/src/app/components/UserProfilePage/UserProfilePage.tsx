import { getLanguage, selectLanguage } from '@cognite/cdf-i18n-utils';
import {
  Language,
  UserProfilePage as UserProfilePageComponent,
} from '@cognite/user-profile-components';

import { useTranslation } from '../../../i18n';
import { useUserInformation } from '../../utils/hooks';

export const UserProfilePage = (): JSX.Element => {
  const { data: userInfo, isInitialLoading } = useUserInformation();

  const { t } = useTranslation();

  const selectedLanguage = getLanguage() ?? 'en';
  const supportedLanguages = [
    {
      code: 'en',
      label: 'English | en',
    },
    {
      code: 'de',
      label: 'Deutsch | de',
    },
    {
      code: 'es',
      label: 'Español, Castellano | es',
    },
    {
      code: 'fr',
      label: 'Français, langue française | fr',
    },
    {
      code: 'it',
      label: 'Italiano | it',
    },
    {
      code: 'ja',
      label: '日本語 (にほんご／にっぽんご) | ja',
    },
    {
      code: 'ko',
      label: '한국어 (韓國語), 조선말 (朝鮮語) | ko',
    },
    {
      code: 'nl',
      label: 'Nederlands, Vlaams | nl',
    },
    {
      code: 'pt',
      label: 'Português | pt',
    },
    {
      code: 'sv',
      label: 'svenska | sv',
    },
    {
      code: 'zh',
      label: '中文 (Zhōngwén), 汉语, 漢語 | zh',
    },
  ];

  return (
    <UserProfilePageComponent
      isUserInfoLoading={isInitialLoading}
      userInfo={userInfo}
      onLanguageChange={(language) => {
        selectLanguage(language!.code);
      }}
      selectedLanguage={
        supportedLanguages.find(
          (lang) => lang.code === selectedLanguage
        ) as Language
      }
      supportedLanguages={supportedLanguages as Language[]}
      languageTabLocale={{
        languageFieldLabel: t('language-field-label'),
        title: t('language-tab-title'),
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
        title: t('personal-info-tab-title'),
      }}
    />
  );
};
