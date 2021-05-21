import * as React from 'react';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import { Asset, CogniteClient } from '@cognite/sdk';
import { Title, Body, A } from '@cognite/cogs.js';
import { useTranslation, Trans } from 'react-i18next';

import { Elevation, Content } from './elements';
import { Container, Code } from '../elements';

const CogniteSDKPageWrapper: React.FC = () => (
  <AuthConsumer>
    {({ client }: AuthContext) =>
      client ? <CogniteSDKDataWrapper client={client} /> : null
    }
  </AuthConsumer>
);

interface DataWrapperProps {
  client: CogniteClient;
}
const CogniteSDKDataWrapper: React.FC<DataWrapperProps> = ({
  client,
}: DataWrapperProps) => {
  const [data, setData] = React.useState<Asset>();

  const fetchData = async () => {
    const assets = await client.assets.list();

    if (assets.items) {
      setData(assets.items[0]);
    }
  };

  React.useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run once

  if (!data) {
    return null;
  }

  return <CogniteSDKPage data={data} />;
};

interface Props {
  data: Asset;
}
export const CogniteSDKPage: React.FC<Props> = ({ data }: Props) => {
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
      {data && (
        <Elevation className="z-4">
          <Body>
            Your first data:
            <div>Asset ID: {data.id}</div>
            <div>Asset name: {data.name}</div>
          </Body>
        </Elevation>
      )}
    </Container>
  );
};

export default CogniteSDKPageWrapper;
