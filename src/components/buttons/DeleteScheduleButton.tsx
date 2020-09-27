import React, { useEffect } from 'react';
import { Button } from '@cognite/cogs.js';
import { Modal, notification } from 'antd';
import { useMutation, useQueryCache } from 'react-query';
import { deleteSchedule } from 'utils/api';

type Props = {
  id: number;
};

export default function DeleteScheduleButton({ id }: Props) {
  const queryCache = useQueryCache();
  const [doDelete, { isLoading, isSuccess, isError }] = useMutation(
    deleteSchedule,
    {
      onSuccess() {
        queryCache.invalidateQueries('/functions/schedules');
      },
    }
  );

  useEffect(() => {
    if (isSuccess) {
      notification.success({
        message: 'Success',
        description: `Schedule ${id} deleted successfully`,
      });
    }
  }, [isSuccess, id]);
  useEffect(() => {
    if (isError) {
      notification.error({
        message: 'Error',
        description: `An error occured when trying to delete schedule ${id}`,
        key: 'schedules',
      });
    }
  }, [isError, id]);

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
