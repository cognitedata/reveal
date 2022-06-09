import React, { useState } from 'react';
import { Button as CogsButton } from '@cognite/cogs.js';
import { Drawer, Form, Input, notification } from 'antd';
import styled from 'styled-components';
import { Group, GroupSpec } from '@cognite/sdk';
import { useQueryClient } from 'react-query';
import { useRouteMatch } from 'react-router';
import { useGroups, useUpdateGroup } from 'hooks';
import CapabilitiesSelector from './CapabilitiesSelector';
import { useTranslation } from 'common/i18n';

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
  const tenant = useRouteMatch<{ tenant: string }>('/:tenant')?.params.tenant;

  const { mutateAsync: updateGroup, isLoading } = useUpdateGroup(tenant!, {
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
    <Drawer visible onClose={onClose} width={720} title="Create new group">
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
          source: group?.source,
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
          <Input disabled={isLoading} />
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
            disabled={isLoading}
            placeholder={t('source-id-placeholder')}
          />
        </Form.Item>
        <Form.Item
          hasFeedback={isLoading}
          validateStatus="validating"
          name="source"
          label={t('source-name')}
          extra={t('source-name-info')}
        >
          <Input
            disabled={isLoading}
            placeholder={t('source-name-placeholder')}
          />
        </Form.Item>
        <Form.Item>
          <Button disabled={isLoading} type="primary" htmlType="submit">
            {group ? t('update') : t('create')}
          </Button>
          <Button onClick={onClose}>{t('cancel')}</Button>
        </Form.Item>
      </Form>
    </Drawer>
  );
}
