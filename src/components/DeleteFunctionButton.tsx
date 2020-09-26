import React, { useEffect, useRef } from 'react';
import { Modal } from 'antd';
import { Button } from '@cognite/cogs.js';
import { useMutation, useQueryCache } from 'react-query';
import { deleteFunction } from 'utils/api';

type Props = {
  id: number;
};

export default function DeleteFunctionButton({ id }: Props) {
  const queryCache = useQueryCache();
  const [
    deleteFn,
    { isLoading: isDeleting, isSuccess: isDeleted, isError },
  ] = useMutation(deleteFunction, {
    onSuccess() {
      queryCache.invalidateQueries('/functions');
    },
  });
  const modal = useRef<() => void>();
  useEffect(() => {
    if (isDeleting) {
      modal.current = Modal.info({
        title: 'Deleting function',
        content: `Deleting function ${id}.`,
      }).destroy;
    }
  }, [isDeleting, id]);

  useEffect(() => {
    if (isDeleted) {
      if (modal.current) {
        modal.current();
      }
      Modal.success({
        title: 'Deleting function',
        content: `Function ${id} deleted successfully.`,
      });
    }
  }, [isDeleted, id]);

  useEffect(() => {
    if (isError) {
      if (modal.current) {
        modal.current();
      }
      Modal.error({
        title: 'Deleting function',
        content: `An error occured when trying to delete function ${id}.`,
      });
    }
  }, [isError, id]);

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
