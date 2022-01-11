import { useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from '@cognite/react-i18n';
import { Button, Flex, Icon, Select } from '@cognite/cogs.js';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';

const UserProfileWrap = styled(Flex)`
  width: 100%;
  box-shadow: rgb(0 0 0 / 10%) 0px -3px 16px;
  margin: 0 0 1rem;

  > article {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;

    &.last-col {
      margin-left: auto;
      min-width: 12rem;
      text-align: center;

      > p {
        margin: 1rem 0 0;
      }
    }

    &.col-user {
      padding: 2rem 0;
      justify-content: center;
    }

    .tags {
      color: var(--cogs-greyscale-grey6);
    }
  }
`;

const LangAreaWrap = styled(Flex)`
  width: 100%;

  > article {
    padding: 2rem;
    border: 1px solid var(--cogs-greyscale-grey2);

    &.lang-col {
      flex: 1 1 auto;
    }

    .cogs-select {
      max-width: 15rem;
    }
  }
`;

type LangOption = 'en' | 'en-US' | 'ja-JP' | 'ja' | 'jp';
type SelectLangOption = { value: LangOption; label: string };

const UserProfile = () => {
  const { t, i18n } = useTranslation('global');
  const { data: user } = useUserInfo();

  const langOptions: SelectLangOption[] = [
    { value: 'en', label: 'English' },
    { value: 'ja-JP', label: 'Japanese' },
  ];

  const detectedLanguage = langOptions.find(
    (obj) => obj.value === localStorage.getItem('chartsCurrentLanguage')
  );

  const [selectedLang, setSelectedLang] = useState<SelectLangOption>(
    detectedLanguage || langOptions[0]
  );

  const changeLanguage = (targetLang: SelectLangOption) => {
    localStorage.setItem('chartsCurrentLanguage', targetLang.value);
    setSelectedLang(targetLang);
    i18n.changeLanguage(targetLang.value);
  };

  return (
    <div id="user-settings" style={{ padding: 16, width: '100%' }}>
      <UserProfileWrap element="section">
        <article>
          <Icon type="Cognite" size={128} />
        </article>
        <article className="col-user">
          <h3 className="cogs-title-3">
            {t('userProfileView.pageTitle', 'Charts User settings')}
          </h3>
          <p className="tags">{user?.displayName}</p>
        </article>
        <article className="last-col">
          <Button type="tertiary">
            {t('userProfileView.logout', 'Logout')}
          </Button>
          <p className="tags">
            {t('userProfileView.appVersion', 'Cognite Charts Version')}{' '}
            {process.env.REACT_APP_VERSION_NAME || 'local'}
          </p>
        </article>
      </UserProfileWrap>
      <LangAreaWrap>
        <article>
          <h3>{t('userProfileView.selectLanguage', 'Select Language')}</h3>
          <p>
            {t(
              'userProfileView.selectLanguageDesc',
              'Select the preferred language of the application.'
            )}
          </p>
        </article>
        <article className="lang-col">
          <p>{t('userProfileView.langDropdownTitle', 'Language')}</p>
          <Select
            value={[selectedLang]}
            onChange={(option: SelectLangOption) => changeLanguage(option)}
            options={langOptions}
          />
        </article>
      </LangAreaWrap>
    </div>
  );
};

export default UserProfile;
