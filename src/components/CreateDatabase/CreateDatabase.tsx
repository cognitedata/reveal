import React, { useEffect, useState } from 'react';

import { notification, Col, Input, Row, Modal, Alert } from 'antd';
import { Button, Icon } from '@cognite/cogs.js';
import { useCreateDatabase } from 'hooks/sdk-queries';
import { getContainer } from 'utils/utils';
import { useUserCapabilities } from 'hooks/useUserCapabilities';
import { trackEvent } from '@cognite/cdf-route-tracker';
import { useHistory, useParams } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';

export default function CreateDatabase() {
  const { appPath } = useParams<{ appPath: string }>();
  const history = useHistory();
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState('');

  const { data: hasWriteAccess } = useUserCapabilities('rawAcl', 'WRITE');
  const { mutate, isSuccess, isLoading, isError, error, reset } =
    useCreateDatabase();

  useEffect(() => {
    if (isSuccess) {
      reset();
      notification.success({
        message: `Database was created!`,
        key: 'create-database',
      });
      history.push(createLink(`/${appPath}/${name}`));
      setName('');
      trackEvent('RAW.Explorer.Database.Create');
      setVisible(false);
    }
  }, [name, isSuccess, reset, history, appPath]);

  return (
    <>
      {visible && (
        <Modal
          title={
            isLoading ? (
              <>
                Creating database <Icon type="Loading" />
              </>
            ) : (
              'Create database'
            )
          }
          visible
          onCancel={() => setVisible(false)}
          okText="Create"
          onOk={() => mutate({ name })}
          okButtonProps={{ disabled: isLoading }}
          cancelButtonProps={{ disabled: isLoading }}
          getContainer={getContainer}
        >
          <Row>
            <Col span={6}> Unique name</Col>
            <Col span={16}>
              <div>
                <Input
                  aria-label="Searched database name"
                  value={name}
                  autoFocus
                  onChange={(e) => setName(e.currentTarget.value)}
                  placeholder="Please enter database name"
                  onPressEnter={() => mutate({ name })}
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
        icon="PlusCompact"
        type="primary"
        onClick={() => setVisible(true)}
        disabled={!hasWriteAccess}
      >
        Create Database
      </Button>
    </>
  );
}
