import * as React from 'react';
import { Drawer as CogsDrawer } from '@cognite/cogs.js';

import { ListComments, ListCommentsProps } from './ListComments';

interface Props extends ListCommentsProps {
  handleClose: () => void;
  visible: boolean;
}
export const Drawer: React.FC<Props> = ({ handleClose, visible, ...rest }) => {
  return (
    <CogsDrawer
      visible={visible}
      width={420}
      onCancel={handleClose}
      onOk={handleClose}
    >
      {rest.target ? <ListComments {...rest} /> : null}
    </CogsDrawer>
  );
};
