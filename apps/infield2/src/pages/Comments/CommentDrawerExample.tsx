import * as React from 'react';
import { BaseUrls, Drawer as CommentDrawer } from '@cognite/react-comments';
import { Title } from '@cognite/cogs.js';
import { CommentTarget } from '@cognite/comment-service-types';
import { Asset } from '@cognite/sdk';

import { Container } from '../elements';

import { Cards } from './Cards';

interface Props extends BaseUrls {
  data: Asset[];
  fasAppId?: string;
}
export const CommentDrawerExample: React.FC<Props> = ({
  data,
  commentServiceBaseUrl,
  userManagementServiceBaseUrl,
  fasAppId,
}) => {
  const [target, setTarget] = React.useState<CommentTarget | undefined>();

  const handleClose = () => {
    setTarget(undefined);
  };

  return (
    <Container>
      <Title>Comments in a drawer:</Title>
      {target && (
        <CommentDrawer
          visible={!!target}
          target={target}
          handleClose={handleClose}
          scope={['infield2']}
          commentServiceBaseUrl={commentServiceBaseUrl}
          userManagementServiceBaseUrl={userManagementServiceBaseUrl}
          fasAppId={fasAppId}
        />
      )}

      <Cards setCommentTarget={setTarget} assets={data} />
    </Container>
  );
};
