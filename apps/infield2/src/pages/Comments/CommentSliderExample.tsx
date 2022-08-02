import * as React from 'react';
import { Slider as CommentSlider, BaseUrls } from '@cognite/react-comments';
import { Title } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';

import { BaseContainer, Container } from '../elements';

import { Cards } from './Cards';

interface Props extends BaseUrls {
  data: Asset[];
  fasAppId?: string;
}
export const CommentSliderExample: React.FC<Props> = ({
  data,
  commentServiceBaseUrl,
  userManagementServiceBaseUrl,
  fasAppId,
}) => {
  return (
    <BaseContainer>
      <CommentSlider
        scope={['infield2']}
        commentServiceBaseUrl={commentServiceBaseUrl}
        userManagementServiceBaseUrl={userManagementServiceBaseUrl}
        fasAppId={fasAppId}
      >
        {({ setCommentTarget, commentTarget }) => {
          return (
            <Container>
              <Title>Comments in a slider:</Title>
              {commentTarget && <p>Active comments: {commentTarget.id}</p>}
              <Cards setCommentTarget={setCommentTarget} assets={data} />
            </Container>
          );
        }}
      </CommentSlider>
    </BaseContainer>
  );
};
