import { useTranslation } from '@access-management/common/i18n';
import { UserProfilesConfigurationWarning } from '@access-management/pages/components/UserProfilesConfigurationWarning';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Checkbox, Form, notification } from 'antd';

import { getProject } from '@cognite/cdf-utilities';
import { Icon, Button } from '@cognite/cogs.js';
import { useSDK } from '@cognite/sdk-provider';

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
  const project = getProject();

  const { mutate, isLoading: updating } = useMutation(
    (update: any) =>
      sdk.post(`/api/v1/projects/${project}/update`, {
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
      return sdk.projects.retrieve(project!);
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
        data-testid="access-management-user-profiles-form"
        onFinish={handleSubmit}
        initialValues={{
          isUserProfilesEnabled:
            // SDK needs updating
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            projectSettings?.userProfilesConfiguration.enabled,
        }}
      >
        <Form.Item
          name="isUserProfilesEnabled"
          label={t('enable-user-profiles')}
          valuePropName="checked"
        >
          <Checkbox disabled={updating} />
        </Form.Item>

        <Form.Item {...noLabelItemLayout}>
          <Button type="primary" htmlType="submit" disabled={updating}>
            {t('save')}
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
