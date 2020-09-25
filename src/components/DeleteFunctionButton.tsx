import React from 'react';
import { Modal } from 'antd';
import { Button } from '@cognite/cogs.js';

type Props = {
  id: number;
};

export default function DeleteFunctionButton({ id }: Props) {
  return (
    <Button
      icon="Delete"
      size="small"
      style={{
        marginLeft: '8px',
        justifyContent: 'center',
      }}
      onClick={e => {
        e.stopPropagation();
        Modal.confirm({
          title: 'Are you sure?',
          content: 'Are you sure you want to delete this function?',
          onOk: () => {
            console.log('TODO', id);
          },
          onCancel: () => {},
          okText: 'Delete',
        });
      }}
    />
  );
}
