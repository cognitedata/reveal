import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import {
  useTypedTranslation as useTranslation,
  getLanguage,
  selectLanguage,
} from '@cognite/cdf-i18n-utils';
import { Colors, Title } from '@cognite/cogs.js';
import {
  LanguageTab,
  PersonalInfoTab,
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
        title: t('profile-tab-info-title', { defaultValue: 'Personal info' }),
      },
      {
        key: 'language',
        icon: 'Language',
        title: t('profile-tab-language-title', { defaultValue: 'Language' }),
      },
    ];
  }, [t]);

  return (
    <Page>
      <HeaderSection>
        <Header>
          <Title level={3}>{name}</Title>
        </Header>
      </HeaderSection>
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
              />
            ) : (
              <PersonalInfoTab loading={isLoading} userInfo={{ email, name }} />
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

const HeaderSection = styled.div`
  /* TODO: set a constant */
  height: 108px;
  width: 100%;

  background-color: ${Colors['surface--strong']};
  display: flex;
  justify-content: center;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
  width: 960px;
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
