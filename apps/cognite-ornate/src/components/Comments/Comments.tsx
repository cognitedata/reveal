import { Button, Icon } from '@cognite/cogs.js';
import { CommentTarget } from '@cognite/comment-service-types';
import { ListComments } from '@cognite/react-comments';
import { useTranslation } from 'hooks/useTranslation';
import sidecar from 'utils/sidecar';

import { CommentsWrapper } from './elements';

export interface CommentsProps {
  target: CommentTarget;
  handleClose: () => void;
}
export const Comments = ({ target, handleClose }: CommentsProps) => {
  const { t } = useTranslation('WorkspaceHeader');

  return (
    <CommentsWrapper>
      <div className="header">
        <Button style={{ float: 'right' }} type="ghost" onClick={handleClose}>
          <Icon type="Close" />
        </Button>
        <p>{t('comments_title', 'Comments')}</p>
      </div>
      <ListComments
        target={target}
        scope={['fas-demo', 'fusion', 'ornate']}
        commentServiceBaseUrl={sidecar.commentServiceBaseUrl}
        userManagementServiceBaseUrl={sidecar.userManagementServiceBaseUrl}
        fasAppId={sidecar.aadApplicationId}
      />
    </CommentsWrapper>
  );
};
