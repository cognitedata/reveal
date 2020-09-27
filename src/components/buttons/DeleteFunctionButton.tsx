import React, { useState, useEffect } from 'react';
import { notification } from 'antd';
import { useMutation, useQueryCache, useQuery } from 'react-query';

import { Button } from '@cognite/cogs.js';
import { deleteFunction } from 'utils/api';
import DeleteFunctionModal from 'components/FunctionModals/DeleteFunctionModal';
import { CogFunction } from 'types';

type Props = {
  id: number;
};

const NOTIFICATION_KEY = `delete-notifications`;

export default function DeleteFunctionButton({ id }: Props) {
  const queryCache = useQueryCache();
  const [showModal, setShowModal] = useState(false);

  const { data } = useQuery<CogFunction>(`/functions/${id}`);
  const name = data?.name;

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
        onClick={e => {
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
