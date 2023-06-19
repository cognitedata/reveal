import React, { useEffect } from 'react';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, notification } from 'antd';
import _ from 'lodash';

import { Button } from '@cognite/cogs.js';

import { deleteSchedule } from '../../utils/api';
import { allSchedulesKey } from '../../utils/queryKeys';

type Props = {
  id: number;
};

export default function DeleteScheduleButton({ id }: Props) {
  const client = useQueryClient();
  const {
    mutate: doDelete,
    isLoading,
    isSuccess,
    isError,
  } = useMutation(deleteSchedule, {
    onSuccess() {
      client.invalidateQueries([allSchedulesKey]);
    },
  });

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
      icon={isLoading ? 'Loader' : 'Delete'}
      onClick={(e) => {
        e.stopPropagation();
        Modal.confirm({
          title: 'Are you sure?',
          content: 'Are you sure you want to delete this schedule?',
          onOk: () => {
            doDelete(id);
          },
          onCancel: _.noop,
          okText: 'Delete',
        });
      }}
    />
  );
}
