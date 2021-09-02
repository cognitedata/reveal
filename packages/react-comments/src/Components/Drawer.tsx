import * as React from 'react';
import { Button, Drawer as CogsDrawer, DrawerProps } from '@cognite/cogs.js';

import { ListComments, ListCommentsProps } from './ListComments';

const Footer: React.FC<{
  handleClick: () => void;
}> = ({ handleClick }) => {
  return (
    <div className="cogs-drawer-footer-buttons">
      <Button type="primary" onClick={handleClick}>
        Close
      </Button>
    </div>
  );
};

interface Props extends ListCommentsProps {
  handleClose: () => void;
  visible: boolean;
  drawerProps?: Partial<DrawerProps>;
}
export const Drawer: React.FC<Props> = ({
  handleClose,
  visible,
  drawerProps,
  ...rest
}) => {
  return (
    <CogsDrawer
      footer={<Footer handleClick={handleClose} />}
      visible={visible}
      width={420}
      onCancel={handleClose}
      onOk={handleClose}
      {...drawerProps}
    >
      {rest.target ? <ListComments {...rest} /> : null}
    </CogsDrawer>
  );
};
