import * as React from 'react';
import { Drawer as CogsDrawer } from '@cognite/cogs.js';
import { CommentTarget } from '@cognite/comment-service-types';

import { ListComments } from './ListComments';

interface Props {
  handleClose: () => void;
  serviceUrl: string;
  target?: CommentTarget;
  visible: boolean;
}
export const Drawer: React.FC<Props> = ({
  handleClose,
  serviceUrl,
  target,
  visible,
}) => {
  return (
    <CogsDrawer
      visible={visible}
      width={420}
      onCancel={handleClose}
      onOk={handleClose}
    >
      {target ? <ListComments target={target} serviceUrl={serviceUrl} /> : null}
    </CogsDrawer>
  );
};
