import * as React from 'react';
import { CommentTarget } from '@cognite/comment-service-types';
import { ListComments } from '@cognite/react-comments';

import { ListCommentsProps } from './ListComments';
import CollapsablePanel from './collapsable-panel';
import { Header } from './Header';

export type SetCommentTarget = (target: CommentTarget | undefined) => void;

type Props = {
  children: ({
    setCommentTarget,
  }: {
    setCommentTarget: SetCommentTarget;
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
      {children({ setCommentTarget })}
    </CollapsablePanel>
  );
};
