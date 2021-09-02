import React from 'react';
import {
  AuthConsumer,
  AuthContext,
  useAuthContext,
} from '@cognite/react-container';
import { Drawer } from '@cognite/react-comments';
import { Asset, CogniteClient } from '@cognite/sdk';
import { CommentTarget } from '@cognite/comment-service-types';
import { Body } from '@cognite/cogs.js';

import { Container } from '../elements';
import sidecar from '../../utils/sidecar';

import { CardContainer, Elevation, Warning } from './elements';

const Comments: React.FC = () => (
  <AuthConsumer>
    {({ client }: AuthContext) =>
      client ? <CommentsPageWrapper client={client} /> : null
    }
  </AuthConsumer>
);
interface DataWrapperProps {
  client: CogniteClient;
}
const CommentsPageWrapper: React.FC<DataWrapperProps> = ({
  client,
}: DataWrapperProps) => {
  const [data, setData] = React.useState<Asset[]>([]);
  const [errorMessage, setErrorMessage] = React.useState('');

  const fetchData = async () => {
    try {
      const assets = await client.assets.list({
        filter: { source: 'test-items' },
      });
      if (assets.items) {
        setData(assets.items);
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  React.useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only run once

  if (!data && !errorMessage) {
    return null;
  }

  return <CommentsPage data={data} error={errorMessage} />;
};

interface Props {
  data?: Asset[];
  error?: string;
}
export const CommentsPage: React.FC<Props> = ({ data, error }) => {
  const [target, setTarget] = React.useState<CommentTarget | undefined>();
  const { authState } = useAuthContext();

  const handleCardClick = (field: number) => () => {
    setTarget({ id: `${field}`, targetType: 'asset' });
  };

  const handleClose = () => {
    setTarget(undefined);
  };

  return (
    <Container>
      {target && authState && (
        <Drawer
          visible={!!target}
          target={target}
          handleClose={handleClose}
          serviceUrl={sidecar.commentServiceBaseUrl}
          scope={['fas-demo']}
        />
      )}

      {error && (
        <Warning>There was an error loading your data: {error}</Warning>
      )}

      {data && (
        <CardContainer>
          {data.map((asset) => {
            return (
              <Elevation
                className="z-4"
                key={asset.id}
                onClick={handleCardClick(asset.id)}
              >
                <Body>
                  <div>Asset ID: {asset.id}</div>
                  <div>Asset name: {asset.name}</div>
                </Body>
              </Elevation>
            );
          })}
        </CardContainer>
      )}
    </Container>
  );
};

export default Comments;
