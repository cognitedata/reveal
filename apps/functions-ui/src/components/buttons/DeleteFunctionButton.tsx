import React, { useState, useEffect } from 'react';

import DeleteFunctionModal from '@functions-ui/components/FunctionModals/DeleteFunctionModal';
import { deleteFunction } from '@functions-ui/utils/api';
import { useFunction } from '@functions-ui/utils/hooks';
import { allFunctionsKey } from '@functions-ui/utils/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';

import { Button } from '@cognite/cogs.js';

type Props = {
  id: number;
};

const NOTIFICATION_KEY = `delete-notifications`;

export default function DeleteFunctionButton({ id }: Props) {
  const client = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const { data } = useFunction(id);
  const name = data?.name;

  const {
    mutate: deleteFn,
    isLoading: isDeleting,
    isSuccess: isDeleted,
    isError,
  } = useMutation(deleteFunction, {
    onSuccess() {
      client.invalidateQueries([allFunctionsKey]);
    },
  });

  useEffect(() => {
    if (isDeleting) {
      notification.info({
        message: 'Deleting function',
        description: (
          <>
            Deleting function <strong>{name}</strong> ({id})
          </>
        ),
        key: NOTIFICATION_KEY,
      });
    }
  }, [isDeleting, id, name]);

  useEffect(() => {
    if (isDeleted) {
      notification.success({
        message: 'Function deleted',
        description: (
          <>
            Function <strong>{name}</strong> ({id}) deleted successfully
          </>
        ),
        key: NOTIFICATION_KEY,
      });
    }
  }, [isDeleted, id, name]);

  useEffect(() => {
    if (isError) {
      notification.error({
        message: 'Deleting function',
        description: (
          <>
            An error occured when trying to delete function{' '}
            <strong>{name}</strong> (${id})
          </>
        ),
        key: NOTIFICATION_KEY,
      });
    }
  }, [isError, id, name]);

  return (
    <>
      <Button
        icon="Delete"
        size="small"
        style={{
          marginLeft: '8px',
          justifyContent: 'center',
        }}
        onClick={(e) => {
          e.stopPropagation();
          setShowModal(true);
        }}
      />
      {showModal && (
        <DeleteFunctionModal
          id={id}
          onCancel={() => setShowModal(false)}
          onDelete={(functionId: number, fileId?: number) => {
            deleteFn({ id: functionId, fileId });
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}
