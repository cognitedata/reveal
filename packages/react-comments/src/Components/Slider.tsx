import * as React from 'react';
import { CommentTarget } from '@cognite/comment-service-types';
import { CollapsablePanel } from '@cognite/cogs.js';

import { ListComments, ListCommentsProps } from './ListComments';
import { Header } from './Header';

export type SetCommentTarget = (target: CommentTarget | undefined) => void;

type Props = {
  children: ({
    setCommentTarget,
  }: {
    setCommentTarget: SetCommentTarget;
    commentTarget?: CommentTarget;
  }) => React.ReactElement | null;
} & Omit<ListCommentsProps, 'target'>;
export const Slider: React.FC<Props> = ({ children, ...rest }) => {
  const [commentTarget, setCommentTarget] = React.useState<
    CommentTarget | undefined
  >();

  const handleCloseCommentsDrawer = () => {
    setCommentTarget(undefined);
  };

  return (
    <CollapsablePanel
      sidePanelRight={
        <>
          <Header handleClose={handleCloseCommentsDrawer} />
          <ListComments target={commentTarget || { id: '' }} {...rest} />
        </>
      }
      sidePanelRightVisible={!!commentTarget}
    >
      {children({ setCommentTarget, commentTarget })}
    </CollapsablePanel>
  );
};
