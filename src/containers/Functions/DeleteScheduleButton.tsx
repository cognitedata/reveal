import React from 'react';
import { Button, Modal} from 'antd';


type Props = {
  id: number
};

export default function DeleteScheduleButton ({ id }: Props) {
  return (
    <Button
      icon="Delete"
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
