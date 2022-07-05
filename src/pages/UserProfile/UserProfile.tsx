import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Collapse,
  Display,
  Flex,
  Icon,
  Row,
  Select,
} from '@cognite/cogs.js';
import { useUserInfo } from '@cognite/sdk-react-query-hooks';
import { makeDefaultTranslations, translationKeys } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import PageTitle from 'components/PageTitle/PageTitle';
import Locale from 'models/charts/user-preferences/classes/Locale';
import I18N from 'models/charts/user-preferences/classes/I18N';
import Config from 'models/charts/config/classes/Config';
import UserPreferences from 'models/charts/user-preferences/classes/UserPreferences';
import { pick } from 'lodash';
import { parseJwt } from 'models/charts/login/utils/parseJwt';
import Login from 'models/charts/login/classes/Login';
import Firebase from 'models/firebase/classes/Firebase';

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

const defaultTranslations = makeDefaultTranslations(
  'Charts User settings',
  'Logout',
  'Cognite Charts Version',
  'Select Language',
  'Select the preferred language of the application.',
  'Select Locale',
  'Select how dates and numbers are displayed in the application.',
  'Select Default Start Page Layout',
  'Grid',
  'List',
  'Example',
  'Language'
);

const UserProfile = () => {
  const [availableLanguages, setAvailableLanguages] = useState(
    I18N.initialOptions
  );
  const [locale, setLocale] = useState(() => Locale.currentOption);

  const { ready: translationsReady } = useTranslation(undefined, {
    useSuspense: false,
  });
  const t = {
    ...defaultTranslations,
    ...useTranslations(translationKeys(defaultTranslations), 'UserProfile').t,
  };
  const { data: user } = useUserInfo();

  useEffect(() => {
    if (translationsReady) {
      I18N.fetchAvailableLanguages().then((options) =>
        setAvailableLanguages(options)
      );
    }
  }, [translationsReady]);

  const pageLayoutTranslations = pick(t, ['Grid', 'List']);
  const startPageLayoutOptions = UserPreferences.startPageLayoutOptions(
    pageLayoutTranslations
  );

  const [startPageLayout, setStartPageLayout] = useState(() =>
    UserPreferences.startPageLayoutOption(pageLayoutTranslations)
  );

  return (
    <>
      <PageTitle title="User Settings" />
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
              {t['Cognite Charts Version']} {Config.version.substring(0, 7)}
            </p>
          </article>
        </UserProfileWrap>
        <LangAreaWrap>
          <article>
            <h3>{t['Select Language']}</h3>
            <p>{t['Select the preferred language of the application.']}</p>
          </article>
          <article className="lang-col">
            <Select
              disabled={!translationsReady}
              value={
                translationsReady
                  ? availableLanguages.find(
                      (option) => option.value === I18N.currentLanguage
                    )
                  : availableLanguages[0]
              }
              icon={translationsReady ? '' : 'Loader'}
              onChange={(option: typeof availableLanguages[number]) =>
                I18N.changeLanguage(option.value)
              }
              options={availableLanguages}
            />
          </article>
        </LangAreaWrap>
        <LangAreaWrap>
          <article>
            <h3>{t['Select Locale']}</h3>
            <p>
              {
                t[
                  'Select how dates and numbers are displayed in the application.'
                ]
              }
            </p>
          </article>
          <article className="lang-col">
            <Row cols={2}>
              <div>
                <Select
                  value={locale}
                  onChange={(option: typeof locale) => {
                    Locale.setLocale(option.value);
                    setLocale(option);
                  }}
                  options={Locale.options}
                />
              </div>
              <div>
                {t.Example}: {dayjs().format('LLLL')}
              </div>
            </Row>
          </article>
        </LangAreaWrap>
        <LangAreaWrap>
          <article>
            <h3>{t['Select Default Start Page Layout']}</h3>
          </article>
          <article className="lang-col">
            <Row cols={2}>
              <div>
                <Select
                  value={startPageLayout}
                  onChange={(option: typeof startPageLayoutOptions[number]) => {
                    UserPreferences.startPageLayout = option.value;
                    setStartPageLayout(option);
                  }}
                  options={startPageLayoutOptions}
                />
              </div>
            </Row>
          </article>
        </LangAreaWrap>

        <Collapse>
          <Collapse.Panel header="Advanced information">
            <Display level={3}>User Information</Display>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            <Display level={3}>Firebase User Information</Display>
            <pre>{JSON.stringify(Firebase.currentUser, null, 2)}</pre>
            <Display level={3}>Firebase Token Information</Display>
            <pre>{JSON.stringify(parseJwt(Firebase.token), null, 2)}</pre>
            <Display level={3}>CDF Token Information</Display>
            <pre>{JSON.stringify(parseJwt(Login.cdfToken), null, 2)}</pre>
            {Login.accessToken && (
              <>
                <Display level={3}>Azure AD Token Information</Display>
                <pre>
                  {JSON.stringify(parseJwt(Login.accessToken), null, 2)}
                </pre>
              </>
            )}
          </Collapse.Panel>
        </Collapse>
      </div>
    </>
  );
};

export default UserProfile;
