/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import React, { useState } from 'react';
import { Modal, Form, Checkbox, Alert } from 'antd';
import { FileInfo } from '@cognite/sdk';
import { useQuery } from 'react-query';
import { getFile } from 'utils/api';
import { CogFunction } from 'types';
import { filesKey } from 'utils/queryKeys';

type Props = {
  id: number;
  onCancel: () => void;
  onDelete: (id: number, fileId?: number) => void;
};

export default function DeleteFunctionModal({ id, onCancel, onDelete }: Props) {
  const [deleteFile, setDeleteFile] = useState(false);

  const { data: cogFunction } = useQuery<CogFunction>(`/functions/${id}`);
  const name = cogFunction?.name;
  const fileId = cogFunction?.fileId;
  const { data: file, isSuccess: fileFound } = useQuery<FileInfo>(
    filesKey({ id: fileId! }),
    getFile,
    {
      enabled: !!fileId,
      retry: 0,
    }
  );
  return (
    <div onClick={e => e.stopPropagation()}>
      <Modal
        title="Are you sure?"
        visible
        okText="Delete"
        onOk={() => {
          onDelete(id, deleteFile ? fileId : undefined);
          onCancel();
        }}
        onCancel={() => {
          onCancel();
        }}
      >
        <Alert
          type="warning"
          message={
            <p>
              Are you sure you want to delete the function{' '}
              <strong>{name}</strong> (ID {id})?
            </p>
          }
        />

        {fileFound && (
          <>
            <p>
              You can also delete the file assosiated with the function by
              checking the box below
            </p>
            <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <Form.Item label="Delete file">
                <Checkbox
                  checked={deleteFile}
                  onChange={({ target: { checked } }) =>
                    setDeleteFile(!!fileId && checked)
                  }
                >
                  <strong>{file?.name}</strong> (ID {fileId})
                </Checkbox>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
}
