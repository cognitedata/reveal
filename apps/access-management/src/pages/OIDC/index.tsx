import styled from 'styled-components';

import {
  TranslationKeys,
  useTranslation,
} from '@access-management/common/i18n';
import { StyledHelpIcon } from '@access-management/pages/components/CustomInfo';
import { OIDCConfigurationWarning } from '@access-management/pages/components/OIDCConfigurationWarning';
import { getContainer } from '@access-management/utils/utils';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Checkbox, Form, Input, Select, notification } from 'antd';
import InputNumber from 'antd/lib/input-number';

import { getProject } from '@cognite/cdf-utilities';
import { Icon, Button, Tooltip } from '@cognite/cogs.js';
import { OidcConfiguration } from '@cognite/sdk';
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

const urlRules = (_t: (key: TranslationKeys) => string, required = true) => [
  {
    required,
    message: _t('valid-url-info'),
  },
  () => ({
    validator(_: any, value: string) {
      if (!required && !value) {
        return Promise.resolve();
      }

      const invalidUrlErrMessage = _t('valid-url-error');
      return isValidURL(value, invalidUrlErrMessage);
    },
  }),
];

const noLabelItemLayout = {
  wrapperCol: {
    xs: { span: 24 },
    sm: { offset: 4, span: 8 },
  },
};

export default function OIDCConfigContainer() {
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
          key: 'oidc-settings',
          message: t('oidc-settings-update'),
        });
      },
      onSuccess() {
        notification.success({
          key: 'oidc-settings',
          message: t('oidc-settings-update-success'),
        });
      },
      onError(error) {
        notification.error({
          key: 'oidc-settings',
          message: t('oidc-settings-update-fail'),
          description: (
            <>
              <p>{t('oidc-settings-update-error')}</p>
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </>
          ),
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
      isOidcEnabled: {
        set: values.isOidcEnabled,
      },
      oidcConfiguration: {
        set: {
          jwksUrl: values.jwksUrl || null,
          tokenUrl: values.tokenUrl || null,
          issuer: values.issuer || null,
          audience: values.audience || null,
          scopeClaims:
            values.scopeClaims?.map((claimName: string) => ({
              claimName,
            })) || [],
          logClaims:
            values.logClaims?.map((claimName: string) => ({
              claimName,
            })) || [],
          accessClaims:
            values.accessClaims?.map((claimName: string) => ({
              claimName,
            })) || [],
          skewMs: values.skewMs,
          isGroupCallbackEnabled: values.isGroupCallbackEnabled ?? null,
        },
      },
    });
  };

  if (!areProjectSettingsFetched) {
    return <Icon type="Loader" />;
  }

  return (
    <>
      <OIDCConfigurationWarning />
      <Form
        {...formItemLayout}
        data-testid="access-management-openid-connect-form"
        onFinish={handleSubmit}
        initialValues={{
          ...projectSettings?.oidcConfiguration,
          accessClaims: projectSettings?.oidcConfiguration?.accessClaims?.map(
            (o) => o.claimName
          ),
          scopeClaims: projectSettings?.oidcConfiguration?.scopeClaims?.map(
            (o) => o.claimName
          ),
          logClaims: projectSettings?.oidcConfiguration?.logClaims?.map(
            (o) => o.claimName
          ),
          isOidcEnabled: true,
          isGroupCallbackEnabled: (
            projectSettings?.oidcConfiguration as OidcConfiguration & {
              isGroupCallbackEnabled?: boolean;
            }
          )?.isGroupCallbackEnabled,
        }}
      >
        <Form.Item
          name="isOidcEnabled"
          label={t('enabled')}
          valuePropName="checked"
        >
          <Checkbox disabled={updating} />
        </Form.Item>

        <Form.Item
          label={t('jwks-url')}
          name="jwksUrl"
          hasFeedback
          rules={urlRules(t)}
        >
          <Input disabled={updating} />
        </Form.Item>

        <Form.Item
          label={t('token-url')}
          name="tokenUrl"
          required={false}
          hasFeedback
          rules={urlRules(t, false)}
        >
          <Input disabled={updating} />
        </Form.Item>

        <Form.Item
          label={t('issuer')}
          name="issuer"
          hasFeedback
          rules={urlRules(t)}
        >
          <Input disabled={updating} />
        </Form.Item>

        <Form.Item
          label={t('audience')}
          name="audience"
          hasFeedback
          rules={urlRules(t)}
        >
          <Input disabled={updating} />
        </Form.Item>

        <Form.Item label={t('access-claims')} name="accessClaims" required>
          <Select
            getPopupContainer={getContainer}
            mode="tags"
            tokenSeparators={[',', ' ']}
            disabled={updating}
          />
        </Form.Item>

        <Form.Item label={t('scope-claims')} name="scopeClaims">
          <Select
            mode="tags"
            tokenSeparators={[',', ' ']}
            getPopupContainer={getContainer}
            disabled={updating}
          />
        </Form.Item>

        <Form.Item label={t('log-claims')} name="logClaims">
          <Select
            mode="tags"
            tokenSeparators={[',', ' ']}
            getPopupContainer={getContainer}
            disabled={updating}
          />
        </Form.Item>

        <Form.Item label={t('permitted-time-skew')} name="skewMs">
          <InputNumber min={0} disabled={updating} />
        </Form.Item>

        <Form.Item
          label={
            <StyledFormItemLabel>
              {t('group-callback-enabled')}
              <Tooltip content={t('group-callback-enabled-info')} wrapped>
                <StyledHelpIcon size={20} type="HelpFilled" />
              </Tooltip>
            </StyledFormItemLabel>
          }
          name="isGroupCallbackEnabled"
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

const StyledFormItemLabel = styled.div`
  align-items: center;
  display: flex;
`;

function isValidURL(url: string, errMessage: string) {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return Promise.resolve();
  } catch {
    return Promise.reject(new Error(errMessage));
  }
}
