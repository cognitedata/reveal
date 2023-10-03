import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import styled from 'styled-components';

import { useTranslation } from '@access-management/common/i18n';
import { useGroups, useUpdateGroup } from '@access-management/hooks';
import { useQueryClient } from '@tanstack/react-query';
import { Drawer, Form, Input, notification } from 'antd';

import { Button as CogsButton } from '@cognite/cogs.js';
import { Group, GroupSpec } from '@cognite/sdk';

import CapabilitiesSelector from './CapabilitiesSelector';

const Button = styled(CogsButton)`
  margin-right: 8px;
`;

type Props = {
  group?: Group;
  onClose: () => void;
  onUpdate?: (_: Group) => Promise<void>;
  onCreate?: (_: GroupSpec) => Promise<void>;
};
export default function GroupDrawer({ group, onClose }: Props) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const { data: groups = [] } = useGroups(true);
  const [caps, setCaps] = useState(group?.capabilities || []);
  const tenant = useParams<{ tenant: string }>().tenant;

  const { mutateAsync: updateGroup, isLoading } = useUpdateGroup({
    onMutate() {
      notification.info({
        key: 'group-update',
        message: group ? t('group-update') : t('group-create'),
      });
    },
    onSuccess() {
      client.invalidateQueries(['groups']);
      notification.success({
        key: 'group-update',
        message: group ? t('group-update-success') : t('group-create-success'),
      });
      onClose();
    },
    onError(error) {
      notification.error({
        key: 'group-update',
        message: group ? t('group-update-fail') : t('group-create-fail'),
        description: (
          <>
            <p>{group ? t('group-update-error') : t('group-create-error')}</p>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </>
        ),
      });
    },
  });

  return (
    <Drawer open onClose={onClose} width={720} title="Create new group">
      <Form
        layout="vertical"
        onFinish={(g: Group) => {
          if (tenant) {
            updateGroup({
              ...g,
              capabilities: caps,
            });
          }
        }}
        initialValues={{
          id: group?.id,
          name: group?.name,
          capabilities: group?.capabilities,
          sourceId: group?.sourceId,
          // @ts-ignore
          metadata: group?.metadata,
        }}
      >
        <Form.Item
          hasFeedback={isLoading}
          name="name"
          label={t('group-name-label')}
          rules={[
            { required: true, message: t('group-name-placeholder') },
            {
              validator: (_, value) => {
                const isDuplicate = groups.some(
                  ({ name }) => name === value && name !== group?.name
                );
                if (isDuplicate) {
                  return Promise.reject(new Error(t('group-name-error')));
                }
                return Promise.resolve();
              },
            },
          ]}
          extra={t('group-name-info')}
        >
          <Input
            disabled={isLoading}
            data-testid="access-management-create-group-name-input"
          />
        </Form.Item>

        <Form.Item name="id" hidden>
          <Input disabled />
        </Form.Item>
        <Form.Item
          hasFeedback={isLoading}
          validateStatus="validating"
          label={t('capability')}
          extra={
            <>
              {t('capability-info')}{' '}
              <a
                href="https://docs.cognite.com/dev/guides/iam/authorization.html#capabilities"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('learn-more')}
              </a>
            </>
          }
        >
          <>
            <CapabilitiesSelector value={caps} onChange={(c) => setCaps(c)} />
          </>
        </Form.Item>

        <Form.Item
          hasFeedback={isLoading}
          validateStatus="validating"
          name="sourceId"
          label={t('source-id')}
          extra={t('source-id-info')}
        >
          <Input
            data-testid="access-management-group-source-id-input"
            disabled={isLoading}
            placeholder={t('source-id-placeholder')}
          />
        </Form.Item>
        <Form.Item>
          <Button
            disabled={isLoading}
            type="primary"
            htmlType="submit"
            data-testid="access-management-create-group-submit-button"
          >
            {group ? t('update') : t('create')}
          </Button>
          <Button onClick={onClose}>{t('cancel')}</Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
