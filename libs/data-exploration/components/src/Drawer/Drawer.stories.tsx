import React from 'react';

import { Button } from '@cognite/cogs.js';

import { useDialog } from '@data-exploration-lib/core';

import { Drawer } from './Drawer';

export default {
  title: 'Component/Drawer',
  component: Drawer,
};
export const Example = () => {
  const { open, isOpen, close } = useDialog();
  return (
    <>
      <Button onClick={open}>Open</Button>
      <Drawer visible={isOpen} onClose={close}>
        Some text here
      </Drawer>
    </>
  );
};
