import { useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Title, Body } from '@cognite/cogs.js';
import { AuthConsumer } from '@cognite/react-container';
import { intercomHelper } from '@cognite/intercom-helper';

import { Container, Code } from '../elements';

import { Content } from './elements';

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
                The easiest way is to simply use the implementation from the
                container of <Code>@cognite/react-container</Code>. By default
                intercom is enabled so you will not have to do anything!
              </li>
              <li>
                If you are hiding the launcher of intercom through the{' '}
                <Code>hide_default_launcher</Code> set in sidecar, you can use
                the method <Code>intercomHelper.show</Code> from the{' '}
                <Code>@cognite/intercom-helper</Code> linked to a button event
                to show or hide intercom from your page.
              </li>
              <li>
                If you are showing the launcher of intercom, you can use the
                method <Code>intercomHelper.addEvent</Code> to execute actions
                whenever your user hides or shows intercom.
              </li>
            </ol>
          </Content>

          <Title>How to manually implement Intercom?</Title>
          <Content>
            <ol>
              <li>
                If you want your own implentation of intercom, there are several
                things you still have to do. First off you should disable
                intercom through the <Code>disableIntercom</Code> option in
                sidecar before it is sent to the container of{' '}
                <Code>@cognite/react-container</Code>.
              </li>
              <li>
                Then everything can be done through the{' '}
                <Code>@cognite/intercom-helper</Code> package.
              </li>
              <li>
                You must call the method <Code>intercomInitialization</Code> and
                after that the <Code>boot</Code> method. This will setup
                intercom so it will be available on your website.
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
