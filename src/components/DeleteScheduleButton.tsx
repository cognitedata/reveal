import React, { useEffect } from 'react';
import { Button } from '@cognite/cogs.js';
import { Modal } from 'antd';
import { useMutation, useQueryCache } from 'react-query';
import { deleteSchedule } from 'utils/api';

type Props = {
  id: number;
};

// @ts-ignore
export default function DeleteScheduleButton({ id }: Props) {
  const queryCache = useQueryCache();
  const [doDelete, { isLoading, isSuccess }] = useMutation(deleteSchedule, {
    onSuccess() {
      queryCache.invalidateQueries('/functions/schedules');
    },
  });

  useEffect(() => {
    if (isSuccess) {
      Modal.success({
        title: 'Schedule deleted',
        content: `Schedule ${id} deleted successfully`,
      });
    }
  }, [isSuccess, id]);

  return (
    <Button
      icon={isLoading ? 'Loading' : 'Delete'}
      onClick={e => {
        e.stopPropagation();
        Modal.confirm({
          title: 'Are you sure?',
          content: 'Are you sure you want to delete this schedule?',
          onOk: () => {
            doDelete(id);
          },
          onCancel: () => {},
          okText: 'Delete',
        });
      }}
    />
  );
}
