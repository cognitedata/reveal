import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import {
  useTypedTranslation as useTranslation,
  getLanguage,
  selectLanguage,
} from '@cognite/cdf-i18n-utils';
import {
  LanguageTab,
  PersonalInfoTab,
  ProfilePageHeader,
  VerticalTab,
  VerticalTabs,
} from '@cognite/user-profile-components';

import { useUserInfo } from '../../hooks/useUserInfo';

const PROFILE_TAB_KEYS = ['info', 'language'] as const;
type ProfileTabKey = (typeof PROFILE_TAB_KEYS)[number];

const getActiveTabKey = (tabParam?: string): ProfileTabKey => {
  if (PROFILE_TAB_KEYS.includes(tabParam as any)) {
    return tabParam as ProfileTabKey;
  }

  return 'info';
};

export const UserProfilePage = (): JSX.Element => {
  const { data = {}, isLoading } = useUserInfo();
  const { name, email } = data;

  const { t } = useTranslation();

  const [searchParams, setSearchParams] = useSearchParams();

  const activeTabKey = getActiveTabKey(searchParams.get('tab') ?? '');

  const handleChange = (key: ProfileTabKey) => {
    setSearchParams(
      (prev) => {
        prev.set('tab', key);
        return prev;
      },
      {
        replace: true,
      }
    );
  };

  const profileTabs: VerticalTab<ProfileTabKey>[] = useMemo(() => {
    return [
      {
        key: 'info',
        icon: 'User',
        title: t('PERSONAL_INFO_TAB_BTN_TEXT'),
      },
      {
        key: 'language',
        icon: 'Language',
        title: t('LANGUAGE_TAB_BTN_TEXT'),
      },
    ];
  }, [t]);

  return (
    <Page>
      <ProfilePageHeader name={name || ''} />
      <ContentSection>
        <Content>
          <ProfileTabs>
            <VerticalTabs
              activeKey={activeTabKey}
              onChange={handleChange}
              tabs={profileTabs}
            />
          </ProfileTabs>
          <TabContent>
            {activeTabKey === 'language' ? (
              <LanguageTab
                language={getLanguage() ?? 'en'}
                selectLanguage={selectLanguage}
                locale={{
                  translations: {
                    'language-tab-title': t('LANGUAGE_TAB_TITLE'),
                    'language-tab-subtitle': t('LANGUAGE_TAB_SUBTITLE'),
                    'language-field-label': t('LANGUAGE_FIELD_LABEL'),
                    'language-chinese-label':
                      '中文 (Zhōngwén), 汉语, 漢語 | zh',
                    'language-dutch-label': 'Nederlands, Vlaams | nl',
                    'language-english-label': 'English | en',
                    'language-french-label': 'Français, langue française | fr',
                    'language-german-label': 'Deutsch | de',
                    'language-italian-label': 'Italiano | it',
                    'language-japanese-label':
                      '日本語 (にほんご／にっぽんご) | ja',
                    'language-korean-label':
                      '한국어 (韓國語), 조선말 (朝鮮語) | ko',
                    'language-portuguese-label': 'Português | pt',
                    'language-spanish-label': 'Español, Castellano | es',
                    'language-swedish-label': 'svenska | sv',
                  },
                }}
              />
            ) : (
              <PersonalInfoTab
                loading={isLoading}
                userInfo={{ email, name }}
                locale={{
                  translations: {
                    'personal-info-tab-title': t('PERSONAL_INFO_TAB_TITLE'),
                    'personal-info-tab-subtitle': t(
                      'PERSONAL_INFO_TAB_SUBTITLE'
                    ),
                    'name-field-label': t('NAME_FIELD_LABEL'),
                    'name-field-help-text': t('NAME_FIELD_HELP_TEXT'),
                    'email-field-label': t('EMAIL_FIELD_LABEL'),
                    'email-field-help-text': t('EMAIL_FIELD_HELP_TEXT'),
                  },
                }}
              />
            )}
          </TabContent>
        </Content>
      </ContentSection>
    </Page>
  );
};

const Page = styled.div`
  height: 100%;
`;

const ContentSection = styled.div`
  padding: 32px 0;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Content = styled.div`
  display: grid;
  gap: 48px;
  grid-template-columns: [start] 264px [one] 1fr [end];
  width: 960px;
`;

const ProfileTabs = styled.div`
  grid-column: start / one;
`;

const TabContent = styled.div`
  grid-column: one / end;
`;
