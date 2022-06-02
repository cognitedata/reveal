import React from 'react';
import { Checkbox, Form, Input, Select, notification } from 'antd';
import InputNumber from 'antd/lib/input-number';
import { OidcConfiguration } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { Icon, Button, Tooltip } from '@cognite/cogs.js';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getContainer } from 'utils/utils';
import { useRouteMatch } from 'react-router';
import { useAuthConfiguration } from 'hooks';
import { StyledHelpIcon } from 'pages/components/CustomInfo';
import styled from 'styled-components';
import { TranslationKeys, useTranslation } from 'common/i18n';

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
      onError() {
        notification.error({
          key: 'oidc-settings',
          message: t('oidc-settings-update-fail'),
          description: t('oidc-settings-update-error'),
        });
      },
      onSettled() {
        cache.invalidateQueries('project-settings');
        cache.invalidateQueries('auth-configuration');
      },
    }
  );

  const { data: projectSettings, isFetched: areProjectSettingsFetched } =
    useQuery('project-settings', () => {
      return sdk.projects.retrieve(match?.params.tenant!);
    });
  const { data: authConfiguration, isFetched: isAuthConfigurationFetched } =
    useAuthConfiguration();

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

  if (!(areProjectSettingsFetched && isAuthConfigurationFetched)) {
    return <Icon type="Loader" />;
  }

  return (
    <Form
      {...formItemLayout}
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
        isOidcEnabled: authConfiguration?.isOidcEnabled,
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
