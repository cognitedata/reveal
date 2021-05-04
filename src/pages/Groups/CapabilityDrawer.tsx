import React from 'react';
import { Drawer } from 'antd';

type Props = {
  onClose: () => void;
  onOk?: () => void;
};
export default function CapabilityDrawer({ onClose }: Props) {
  return (
    <Drawer visible width={720} onClose={onClose}>
      <p>hello</p>
    </Drawer>
  );
}
