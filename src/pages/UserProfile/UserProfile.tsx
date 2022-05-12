import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Collapse,
  Display,
  Flex,
  Icon,
  Select,
} from '@cognite/cogs.js';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import { useEffect, useState } from 'react';
import { useResetRecoilState } from 'recoil';
import chartAtom from 'models/chart/atom';
import { isProduction } from 'utils/environment';
import config from 'config/config';
import firebase from 'firebase/app';
import 'firebase/auth';

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

function parseJwt(token: string | null) {
  if (!token) return '';
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.stringify(JSON.parse(jsonPayload), null, 2);
}

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
  const resetChart = useResetRecoilState(chartAtom);

  useEffect(() => {
    resetChart();
  }, [resetChart]);

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
          <Button
            type="tertiary"
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            {t.Logout}
          </Button>
          <p className="tags">
            {t['Cognite Charts Version']} {config.version.substring(0, 7)}
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

      <Collapse>
        <Collapse.Panel header="Advanced information">
          <Display level={3}>User Information</Display>
          <pre>{JSON.stringify(user, null, 2)}</pre>
          <Display level={3}>Firebase User Information</Display>
          <pre>
            {JSON.stringify(firebase.auth()?.currentUser ?? {}, null, 2)}
          </pre>
          <Display level={3}>Firebase Token Information</Display>
          <pre>
            {parseJwt(localStorage.getItem('@cognite/charts/firebaseToken'))}
          </pre>
          <Display level={3}>CDF Token Information</Display>
          <pre>
            {parseJwt(localStorage.getItem('@cognite/charts/cdfToken'))}
          </pre>
          <Display level={3}>Azure AD Token Information</Display>
          <pre>
            {parseJwt(localStorage.getItem('@cognite/charts/azureAdToken'))}
          </pre>
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export default UserProfile;
