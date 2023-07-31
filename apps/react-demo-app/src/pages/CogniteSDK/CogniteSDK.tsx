import * as React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { Title, Body, A } from '@cognite/cogs.js';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import { CogniteClient } from '@cognite/sdk';

import { Container, Code } from '../elements';

import { Content } from './elements';

const CogniteSDKPageWrapper: React.FC = () => (
  <AuthConsumer>
    {({ client }: AuthContext) =>
      client ? <CogniteSDKPage client={client} /> : null
    }
  </AuthConsumer>
);

interface Props {
  client: CogniteClient;
}
export const CogniteSDKPage: React.FC<Props> = ({ client }) => {
  const { t } = useTranslation('CogniteSDK');

  return (
    <Container>
      <Body>
        <Trans t={t} i18nKey="info-authentication">
          <Title>How does Authentication work?</Title>
          <Content>
            <ol>
              <li>
                Wrap your application with the <Code>Container</Code> component
                from <Code> @cognite/react-container</Code>
              </li>
              <li>
                This will load the Tenant Selector if you are not authenticated
              </li>
              <li>
                Once authentication is complete (see
                <Code> @cognite/react-tenant-selector</Code> for more info) the
                Auth provider will give you a setup SDK Client and access to the
                token via the <Code> AuthConsumer</Code>
              </li>
            </ol>
          </Content>
        </Trans>
      </Body>

      <A
        isExternal
        href="https://github.com/cognitedata/cognite-sdk-js/blob/master/packages/stable/README.md"
        target="_blank"
        rel="noopener noreferrer"
      >
        How do I use the Cognite SDK?
      </A>

      {client && (
        <Body>
          SDK configured for project:{' '}
          <Code>
            {
              // @ts-expect-error private key
              client.projectName
            }
          </Code>
        </Body>
      )}
    </Container>
  );
};

export default CogniteSDKPageWrapper;
