import React, { useEffect } from 'react';
import { Modal, notification } from 'antd';
import { Button } from '@cognite/cogs.js';
import { useMutation, useQueryCache } from 'react-query';
import { deleteFunction } from 'utils/api';

type Props = {
  id: number;
  name: string;
};
const NOTIFICATION_KEY = 'delete-notifications';

// TODO: This function could also ask the user if the file asossiated
// with the function should be deleted
export default function DeleteFunctionButton({ id, name }: Props) {
  const queryCache = useQueryCache();
  const [
    deleteFn,
    { isLoading: isDeleting, isSuccess: isDeleted, isError },
  ] = useMutation(deleteFunction, {
    onSuccess() {
      queryCache.invalidateQueries('/functions');
    },
  });

  useEffect(() => {
    if (isDeleting) {
      notification.info({
        message: 'Deleting function',
        description: `Deleting function ${name} (${id}).`,
        key: NOTIFICATION_KEY,
      });
    }
  }, [isDeleting, id, name]);

  useEffect(() => {
    if (isDeleted) {
      notification.success({
        message: 'Function deleted',
        description: `Function ${name} (${id}) deleted successfully.`,
        key: NOTIFICATION_KEY,
      });
    }
  }, [isDeleted, id, name]);

  useEffect(() => {
    if (isError) {
      notification.error({
        message: 'Deleting function',
        description: `An error occured when trying to delete function ${name} (${id}).`,
        key: NOTIFICATION_KEY,
      });
    }
  }, [isError, id, name]);

  return (
    <>
      <Button
        icon={isDeleting ? 'Loading' : 'Delete'}
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
              deleteFn({ id });
            },
            onCancel: () => {},
            okText: 'Delete',
          });
        }}
      />
    </>
  );
}
