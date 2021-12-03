import React, { useEffect, useState } from 'react';

import { notification, Col, Input, Row, Modal, Alert } from 'antd';
import { Button, Icon } from '@cognite/cogs.js';

import { getContainer } from 'utils/utils';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import { trackEvent } from '@cognite/cdf-route-tracker';
import { useHistory, useParams } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import { useCreateTable } from 'hooks/sdk-queries';

export default function CreateTable({ database }: { database: string }) {
  const { appPath } = useParams<{ appPath: string }>();
  const history = useHistory();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');

  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');
  const { mutate, isSuccess, isLoading, isError, error, reset } =
    useCreateTable();

  useEffect(() => {
    if (isSuccess) {
      reset();
      notification.success({
        message: `Table was created!`,
        key: 'create-table',
      });
      history.push(createLink(`/${appPath}/${database}/${name}`));
      setName('');
      trackEvent('RAW.Explorer.Table.Table.Create');
      setVisible(false);
    }
  }, [name, isSuccess, reset, history, database, appPath]);

  return (
    <>
      {visible && (
        <Modal
          title={
            isLoading ? (
              <>
                Creating table <Icon type="Loader" />
              </>
            ) : (
              'Create table'
            )
          }
          visible
          onCancel={() => setVisible(false)}
          okText="Create"
          onOk={() => mutate({ database, table: name })}
          okButtonProps={{ disabled: isLoading }}
          cancelButtonProps={{ disabled: isLoading }}
          getContainer={getContainer}
        >
          <Row>
            <Col span={6}> Unique name</Col>
            <Col span={16}>
              <div>
                <Input
                  aria-label="Table name"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.currentTarget.value)}
                  placeholder="Please enter table name"
                  onPressEnter={() => mutate({ database, table: name })}
                />
              </div>
            </Col>
          </Row>

          {isError && (
            <>
              <Alert
                type="error"
                message={
                  <>
                    An error ocurred:{' '}
                    <pre>{JSON.stringify((error as any)?.errors, null, 2)}</pre>
                  </>
                }
              />
            </>
          )}
        </Modal>
      )}

      <Button
        style={{ width: '100%', marginBottom: '5px' }}
        icon="Add"
        type="primary"
        onClick={() => setVisible(true)}
        disabled={!hasWriteAccess}
      >
        Create Table
      </Button>
    </>
  );
}
