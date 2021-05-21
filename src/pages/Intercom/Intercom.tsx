import { useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { Title, Body } from '@cognite/cogs.js';
import { AuthConsumer } from '@cognite/react-container';

import { intercomHelper } from '@cognite/intercom-helper';

import { Content } from './elements';
import { Container, Code } from '../elements';

const IntercomPageWrapper: React.FC = () => (
  <AuthConsumer>{() => <IntercomPage />}</AuthConsumer>
);

export const IntercomPage: React.FC = () => {
  const { t } = useTranslation('Intercom');

  useEffect(() => {
    intercomHelper.show(true);

    return () => {
      intercomHelper.show(false);
    };
  }, []);

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
