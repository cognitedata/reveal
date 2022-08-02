import * as React from 'react';
import { Loader } from '@cognite/cogs.js';
import { AuthConsumer, AuthContext } from '@cognite/react-container';
import { CogniteClient } from '@cognite/sdk';

import { useFetchAssets } from '../../queries/useFetchAssets';
import sidecar from '../../utils/sidecar';

import { CommentDrawerExample } from './CommentDrawerExample';
import { Warning } from './elements';

const CommentDrawerPage: React.FC = () => (
  <AuthConsumer>
    {({ client }: AuthContext) =>
      client ? <CommentDrawer client={client} /> : null
    }
  </AuthConsumer>
);
interface Props {
  client: CogniteClient;
}
export const CommentDrawer: React.FC<Props> = ({ client }) => {
  const { data, error, isLoading } = useFetchAssets({ client });
  // console.log('States:', { data, error });

  if (isLoading) {
    return <Loader />;
  }

  if (!data) {
    return <Warning>There was an unknown error loading your data</Warning>;
  }

  if (error) {
    return <Warning>There was an error loading your data: {error}</Warning>;
  }

  return (
    <CommentDrawerExample
      data={data}
      commentServiceBaseUrl={sidecar.commentServiceBaseUrl}
      userManagementServiceBaseUrl={sidecar.userManagementServiceBaseUrl}
      fasAppId={sidecar.aadApplicationId}
    />
  );
};

export default CommentDrawerPage;
