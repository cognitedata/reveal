import React from 'react';
import { Checkbox, Form, notification } from 'antd';
import { useSDK } from '@cognite/sdk-provider';
import { Icon, Button } from '@cognite/cogs.js';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouteMatch } from 'react-router';
import { UserProfilesConfigurationWarning } from 'pages/components/UserProfilesConfigurationWarning';
import { useTranslation } from 'common/i18n';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
};

const noLabelItemLayout = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { offset: 4, span: 8 },
  },
};

export default function UserProfilesConfigContainer() {
  const { t } = useTranslation();
  const cache = useQueryClient();
  const sdk = useSDK();
  const match = useRouteMatch<{ tenant: string }>('/:tenant');

  const { mutate, isLoading: updating } = useMutation(
    (update: any) =>
      sdk.post(`/api/v1/projects/${sdk.project}/update`, {
        data: {
          update,
        },
      }),
    {
      onMutate() {
        notification.info({
          key: 'user-profiles-settings',
          message: t('user-profiles-settings-update'),
        });
      },
      onSuccess() {
        notification.success({
          key: 'user-profiles-settings',
          message: t('user-profiles-settings-update-success'),
        });
      },
      onError() {
        notification.error({
          key: 'user-profiles-settings',
          message: t('user-profiles-settings-update-fail'),
          description: t('user-profiles-settings-update-error'),
        });
      },
      onSettled() {
        cache.invalidateQueries(['project-settings']);
      },
    }
  );

  const { data: projectSettings, isFetched: areProjectSettingsFetched } =
    useQuery(['project-settings'], () => {
      return sdk.projects.retrieve(match?.params.tenant!);
    });

  const handleSubmit = (values: any) => {
    mutate({
      userProfilesConfiguration: {
        set: {
          enabled: values.isUserProfilesEnabled,
        },
      },
    });
  };

  if (!areProjectSettingsFetched) {
    return <Icon type="Loader" />;
  }

  return (
    <>
      <UserProfilesConfigurationWarning />
      <Form
        {...formItemLayout}
        onFinish={handleSubmit}
        initialValues={{
          isUserProfilesEnabled:
            projectSettings?.userProfilesConfiguration.enabled,
        }}
      >
        <Form.Item
          name="isUserProfilesEnabled"
          label={t('enabled')}
          valuePropName="checked"
        >
          <Checkbox disabled={updating} />
        </Form.Item>

        <Form.Item {...noLabelItemLayout}>
          <Button type="primary" htmlType="submit" disabled={updating}>
            {t('save-configuration')}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
