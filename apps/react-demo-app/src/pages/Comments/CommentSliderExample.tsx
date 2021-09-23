import * as React from 'react';
import { Slider as CommentSlider, BaseUrls } from '@cognite/react-comments';
import { Title } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';

import { BaseContainer, Container } from '../elements';

import { Cards } from './Cards';

interface Props extends BaseUrls {
  data: Asset[];
}
export const CommentSliderExample: React.FC<Props> = ({
  data,
  commentServiceBaseUrl,
  userManagementServiceBaseUrl,
}) => {
  return (
    <BaseContainer>
      <CommentSlider
        scope={['fas-demo']}
        commentServiceBaseUrl={commentServiceBaseUrl}
        userManagementServiceBaseUrl={userManagementServiceBaseUrl}
      >
        {({ setCommentTarget }) => {
          return (
            <Container>
              <Title>Comments in a slider:</Title>
              <Cards setCommentTarget={setCommentTarget} assets={data} />
            </Container>
          );
        }}
      </CommentSlider>
    </BaseContainer>
  );
};
