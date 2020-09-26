import React from 'react';
import { Button } from '@cognite/cogs.js';
import { Modal } from 'antd';

type Props = {
  id: number;
};

// @ts-ignore
export default function DeleteScheduleButton({ id }: Props) {
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
          content: 'Are you sure you want to delete this schedule?',
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
