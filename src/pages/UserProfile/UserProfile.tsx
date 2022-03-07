import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Icon, Select } from '@cognite/cogs.js';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import { useEffect, useState } from 'react';

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

const fallbackOptions = [
  { value: 'en', label: 'English' },
  { value: 'ja', label: '日本' },
];

type LocizeLanguages = Record<
  string,
  {
    name: string;
    nativeName: string;
    isReferenceLanguage: boolean;
    translated: {
      latest: number;
    };
  }
>;

const isProduction = process.env.REACT_APP_ENV === 'production';

const defaultTranslations = makeDefaultTranslations(
  'Charts User settings',
  'Logout',
  'Cognite Charts Version',
  'Select Language',
  'Select the preferred language of the application.',
  'Language'
);

const UserProfile = () => {
  const [availableLanguages, setAvailableLanguages] = useState(fallbackOptions);

  const { i18n, ready } = useTranslation(undefined, { useSuspense: false });
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'UserProfile').t,
  };
  const { data: user } = useUserInfo();

  useEffect(() => {
    if (ready) {
      const backend = isProduction
        ? i18n.services.backendConnector.backend.backends[1]
        : i18n.services.backendConnector.backend.backends[0];
      backend.getLanguages((err: any, languages: LocizeLanguages) => {
        if (err) return;
        setAvailableLanguages(
          Object.keys(languages).map((key) => ({
            value: key,
            label: languages[key].nativeName,
          }))
        );
      });
    }
    return () => {};
  }, [ready, i18n.services.backendConnector.backend.backends]);

  return (
    <div id="user-settings" style={{ padding: 16, width: '100%' }}>
      <UserProfileWrap element="section">
        <article>
          <Icon type="Cognite" size={128} />
        </article>
        <article className="col-user">
          <h3 className="cogs-title-3">{t['Charts User settings']}</h3>
          <p className="tags">{user?.displayName}</p>
        </article>
        <article className="last-col">
          <Button type="tertiary">{t.Logout}</Button>
          <p className="tags">
            {t['Cognite Charts Version']}{' '}
            {process.env.REACT_APP_VERSION_NAME || 'local'}
          </p>
        </article>
      </UserProfileWrap>
      <LangAreaWrap>
        <article>
          <h3>{t['Select Language']}</h3>
          <p>{t['Select the preferred language of the application.']}</p>
        </article>
        <article className="lang-col">
          <p>{t.Language}</p>
          <Select
            disabled={!ready}
            value={
              ready
                ? availableLanguages.find(
                    (option) => option.value === i18n.language
                  )
                : availableLanguages[0]
            }
            icon={ready ? '' : 'Loader'}
            onChange={(option: typeof availableLanguages[0]) =>
              i18n.changeLanguage(option.value)
            }
            options={availableLanguages}
          />
        </article>
      </LangAreaWrap>
    </div>
  );
};

export default UserProfile;
