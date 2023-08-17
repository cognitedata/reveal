import React, { useMemo } from 'react';

import styled from 'styled-components';

import { RESPONSIVE_BREAKPOINT } from '../../common/constants';
import { Language, UserInfo, VerticalTab } from '../../common/types';
import { LanguageTab } from '../../components/language-tab/LanguageTab';
import { PersonalInfoTab } from '../../components/personal-info-tab/PersonalInfoTab';
import { ProfilePageHeader } from '../../components/profile-page-header/ProfilePageHeader';
import { VerticalTabs } from '../../components/vertical-tabs/VerticalTabs';
import { useActiveTabKey } from '../../hooks/useActiveTabKey';
import { OnTrackEvent } from '../../metrics';

export type SidebarLocale = {
  // TODO: provide detailed descriptions
  personalInfoTabBtnText: string;
  languageTabBtnText: string;
};

export type LanguageTabLocale = {
  // TODO: provide detailed descriptions
  title: string;
  languageFieldLabel: string;
};

export type PersonalInfoTabLocale = {
  // TODO: provide detailed descriptions
  title: string;
  nameFieldLabel: string;
  nameFieldHelpText: string;
  emailFieldLabel: string;
  emailFieldHelpText: string;
};

export type ProfileHeaderLocale = {
  // TODO: provide detailed descriptions
  backBtnText?: string;
};

export type UserProfilePageProps = {
  userInfo?: UserInfo;
  isUserInfoLoading?: boolean;
  selectedLanguage: Language;
  supportedLanguages: Language[];
  onLanguageChange: (language: Language | undefined) => void;
  sidebarLocale?: SidebarLocale;
  languageTabLocale?: LanguageTabLocale;
  personalInfoTabLocale?: PersonalInfoTabLocale;
  profileHeaderLocale?: ProfileHeaderLocale;
  onTrackEvent?: OnTrackEvent;
  additionalTabsCategoryLabel?: string;
  additionalTabs?: VerticalTab[];
  onBackBtnClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export const UserProfilePage = ({
  userInfo,
  isUserInfoLoading,
  selectedLanguage,
  supportedLanguages,
  onLanguageChange,
  sidebarLocale,
  languageTabLocale,
  personalInfoTabLocale,
  profileHeaderLocale,
  onTrackEvent,
  additionalTabsCategoryLabel,
  additionalTabs,
  onBackBtnClick,
}: UserProfilePageProps): JSX.Element => {
  const name = userInfo?.name ?? '';
  const email = userInfo?.email ?? '';
  const profilePicture = userInfo?.profilePicture ?? '';

  const builtinTabs: VerticalTab[] = useMemo(() => {
    return [
      {
        key: 'info',
        icon: 'User',
        title: sidebarLocale?.personalInfoTabBtnText || 'Personal info',
        content: (
          <PersonalInfoTab
            userInfo={{ email, name }}
            isUserInfoLoading={isUserInfoLoading}
            title={personalInfoTabLocale?.title}
            nameFieldLabel={personalInfoTabLocale?.nameFieldLabel}
            nameFieldHelpText={personalInfoTabLocale?.nameFieldHelpText}
            emailFieldLabel={personalInfoTabLocale?.emailFieldLabel}
            emailFieldHelpText={personalInfoTabLocale?.emailFieldHelpText}
          />
        ),
      },
      {
        key: 'language',
        icon: 'Language',
        title: sidebarLocale?.languageTabBtnText || 'Language',
        content: (
          <LanguageTab
            selectedLanguage={selectedLanguage}
            supportedLanguages={supportedLanguages}
            onLanguageChange={onLanguageChange}
            title={languageTabLocale?.title}
            languageFieldLabel={languageTabLocale?.languageFieldLabel}
            onTrackEvent={onTrackEvent}
          />
        ),
      },
    ];
  }, [
    email,
    isUserInfoLoading,
    languageTabLocale?.languageFieldLabel,
    languageTabLocale?.title,
    name,
    onLanguageChange,
    onTrackEvent,
    personalInfoTabLocale?.emailFieldHelpText,
    personalInfoTabLocale?.emailFieldLabel,
    personalInfoTabLocale?.nameFieldHelpText,
    personalInfoTabLocale?.nameFieldLabel,
    personalInfoTabLocale?.title,
    selectedLanguage,
    sidebarLocale?.languageTabBtnText,
    sidebarLocale?.personalInfoTabBtnText,
    supportedLanguages,
  ]);

  const profileTabs: VerticalTab[] = useMemo(() => {
    return [...builtinTabs, ...(additionalTabs ?? [])];
  }, [builtinTabs, additionalTabs]);

  const [activeTabKey, setActiveTabKey] = useActiveTabKey(
    profileTabs.map(({ key }) => key)
  );

  const handleChange = (key: string) => {
    setActiveTabKey(key);
  };

  return (
    <Page>
      <ProfilePageHeader
        userInfo={{ name, profilePicture }}
        backBtnText={profileHeaderLocale?.backBtnText}
        onBackBtnClick={onBackBtnClick}
      />
      <ContentSection>
        <Content>
          <ProfileTabs>
            <VerticalTabs
              activeKey={activeTabKey}
              onChange={handleChange}
              builtinTabs={builtinTabs}
              additionalTabs={additionalTabs}
              additionalTabsCategoryLabel={additionalTabsCategoryLabel}
              onTrackEvent={onTrackEvent}
            />
          </ProfileTabs>

          <TabContent>
            {profileTabs.find(({ key }) => key === activeTabKey)?.content ||
              profileTabs[0].content}
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

  @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
    padding: 0;
    padding-bottom: 32px;
  }
`;

const Content = styled.div`
  display: grid;
  gap: 48px;
  grid-template-columns: [start] 264px [one] 1fr [end];
  width: 960px;

  @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
`;

const ProfileTabs = styled.div`
  grid-column: start / one;
`;

const TabContent = styled.div`
  grid-column: one / end;
  padding: 0 16px;
`;
