import { useMemo } from 'react';

import styled from 'styled-components';

import { Language, UserInfo, VerticalTab } from '../../common/types';
import { LanguageTab } from '../../components/language-tab/LanguageTab';
import { PersonalInfoTab } from '../../components/personal-info-tab/PersonalInfoTab';
import { ProfilePageHeader } from '../../components/profile-page-header/ProfilePageHeader';
import { VerticalTabs } from '../../components/vertical-tabs/VerticalTabs';
import { ProfileTabKey, useActiveTabKey } from '../../hooks/useActiveTabKey';

export type SidebarLocale = {
  // TODO: provide detailed descriptions
  personalInfoTabBtnText: string;
  languageTabBtnText: string;
};

export type LanguageTabLocale = {
  // TODO: provide detailed descriptions
  title: string;
  subtitle: string;
  languageFieldLabel: string;
};

export type PersonalInfoTabLocale = {
  // TODO: provide detailed descriptions
  title: string;
  subtitle: string;
  nameFieldLabel: string;
  nameFieldHelpText: string;
  emailFieldLabel: string;
  emailFieldHelpText: string;
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
}: UserProfilePageProps): JSX.Element => {
  const name = userInfo?.name ?? '';
  const email = userInfo?.email ?? '';
  const profilePicture = userInfo?.profilePicture ?? '';

  const [activeTabKey, setActiveTabKey] = useActiveTabKey();

  const handleChange = (key: ProfileTabKey) => {
    setActiveTabKey(key);
  };

  const profileTabs: VerticalTab<ProfileTabKey>[] = useMemo(() => {
    return [
      {
        key: 'info',
        icon: 'User',
        title: sidebarLocale?.personalInfoTabBtnText || 'Personal info',
      },
      {
        key: 'language',
        icon: 'Language',
        title: sidebarLocale?.languageTabBtnText || 'Language',
      },
    ];
  }, [
    sidebarLocale?.languageTabBtnText,
    sidebarLocale?.personalInfoTabBtnText,
  ]);

  return (
    <Page>
      <ProfilePageHeader userInfo={{ name, profilePicture }} />
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
                selectedLanguage={selectedLanguage}
                supportedLanguages={supportedLanguages}
                onLanguageChange={onLanguageChange}
                title={languageTabLocale?.title}
                subtitle={languageTabLocale?.subtitle}
                languageFieldLabel={languageTabLocale?.languageFieldLabel}
              />
            ) : (
              <PersonalInfoTab
                userInfo={{ email, name }}
                isUserInfoLoading={isUserInfoLoading}
                title={personalInfoTabLocale?.title}
                subtitle={personalInfoTabLocale?.subtitle}
                nameFieldLabel={personalInfoTabLocale?.nameFieldLabel}
                nameFieldHelpText={personalInfoTabLocale?.nameFieldHelpText}
                emailFieldLabel={personalInfoTabLocale?.emailFieldLabel}
                emailFieldHelpText={personalInfoTabLocale?.emailFieldHelpText}
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
