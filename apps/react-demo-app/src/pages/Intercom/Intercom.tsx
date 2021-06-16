import React, { useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Title, Body } from '@cognite/cogs.js';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import {
  intercomHelper,
  intercomInitialization,
} from '@cognite/intercom-helper';
import sidecar from 'utils/sidecar';

import { Container, Code } from '../elements';

import { Content } from './elements';

const IntercomPageWrapper: React.FC = () => (
  <AuthConsumer>
    {({ authState }: AuthContext) =>
      authState ? <IntercomWrapper authState={authState} /> : null
    }
  </AuthConsumer>
);

interface DataWrapperProps {
  authState: any;
}
const IntercomWrapper: React.FC<DataWrapperProps> = ({
  authState,
}: DataWrapperProps) => {
  if (!authState.authenticated || !authState.token) {
    return null;
  }

  const { appsApiBaseUrl, intercom } = sidecar;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    intercomInitialization(intercom).then(() => {
      intercomHelper.boot({
        app_id: intercom,
        name: 'user',
        email: 'user',
        user_id: 'user',
        hide_default_launcher: false,
      });
      intercomHelper.identityVerification({
        appsApiUrl: appsApiBaseUrl,
        headers: { Authorization: `Bearer ${authState.token}` },
      });
    });

    return () => {
      intercomHelper.shutdown();
    };
  }, []);

  return <IntercomPage />;
};

export const IntercomPage: React.FC = () => {
  const { t } = useTranslation('Intercom');

  return (
    <Container>
      <Body>
        <Trans t={t} i18nKey="info-intercom">
          <Title>How to implement Intercom?</Title>
          <Content>
            <ol>
              <li>
                The intercom package is a pure javascript package from
                <Code>@cognite/intercom-helper</Code>
              </li>
              <li>
                To start things off you have to call the method
                <Code>intercomInitialization</Code> and after that the
                <Code>boot</Code> method. This will setup intercom so it will be
                available on your website
              </li>
              <li>
                The <Code>indentityVerification</Code> method must also be
                called to ensure your users cannot pretend to be another.
              </li>
            </ol>
          </Content>
        </Trans>
      </Body>
    </Container>
  );
};

export default IntercomPageWrapper;
