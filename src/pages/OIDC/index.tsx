import React from 'react';
import { Checkbox, Form, Input, Select, notification } from 'antd';
import InputNumber from 'antd/lib/input-number';
import { useSDK } from '@cognite/sdk-provider';
import { Icon, Button } from '@cognite/cogs.js';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getContainer } from 'utils/utils';
import { useRouteMatch } from 'react-router';

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

const urlRules = (required = true) => [
  {
    required,
    message: 'Please enter a valid url!',
  },
  () => ({
    validator(_: any, value: string) {
      if (!required && !value) {
        return Promise.resolve();
      }
      return isValidURL(value);
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
          message: 'Updating settings',
        });
      },
      onSuccess() {
        notification.success({
          key: 'oidc-settings',
          message: 'Settings updated',
        });
      },
      onError() {
        notification.error({
          key: 'oidc-settings',
          message: 'An error occurred when updating settings',
        });
      },
      onSettled() {
        cache.invalidateQueries('oidc-settings');
      },
    }
  );

  const { data, isFetched } = useQuery('oidc-settings', () => {
    return Promise.all([
      sdk.projects.retrieve(match?.params.tenant!),
      sdk
        .get<{ isOidcEnabled: boolean }>(
          `/api/playground/projects/${sdk.project}/configuration`
        )
        .then(r => r.data),
    ]);
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
        },
      },
    });
  };

  if (!isFetched) {
    return <Icon type="Loading" />;
  }

  return (
    <Form
      {...formItemLayout}
      onFinish={handleSubmit}
      initialValues={{
        ...data?.[0].oidcConfiguration,
        accessClaims: data?.[0].oidcConfiguration?.accessClaims?.map(
          o => o.claimName
        ),
        scopeClaims: data?.[0].oidcConfiguration?.scopeClaims?.map(
          o => o.claimName
        ),
        logClaims: data?.[0].oidcConfiguration?.logClaims?.map(
          o => o.claimName
        ),
        isOidcEnabled: data?.[1].isOidcEnabled,
      }}
    >
      <Form.Item name="isOidcEnabled" label="Enabled" valuePropName="checked">
        <Checkbox disabled={updating} />
      </Form.Item>

      <Form.Item label="JWKS URL" name="jwksUrl" hasFeedback rules={urlRules()}>
        <Input disabled={updating} />
      </Form.Item>

      <Form.Item
        label="Token URL"
        name="tokenUrl"
        required={false}
        hasFeedback
        rules={urlRules(false)}
      >
        <Input disabled={updating} />
      </Form.Item>

      <Form.Item label="Issuer" name="issuer" hasFeedback rules={urlRules()}>
        <Input disabled={updating} />
      </Form.Item>

      <Form.Item
        label="Audience"
        name="audience"
        hasFeedback
        rules={urlRules()}
      >
        <Input disabled={updating} />
      </Form.Item>

      <Form.Item label="Access claims" name="accessClaims" required>
        <Select
          getPopupContainer={getContainer}
          mode="tags"
          tokenSeparators={[',', ' ']}
          disabled={updating}
        />
      </Form.Item>

      <Form.Item label="Scope claims" name="scopeClaims">
        <Select
          mode="tags"
          tokenSeparators={[',', ' ']}
          getPopupContainer={getContainer}
          disabled={updating}
        />
      </Form.Item>

      <Form.Item label="Log claims" name="logClaims">
        <Select
          mode="tags"
          tokenSeparators={[',', ' ']}
          getPopupContainer={getContainer}
          disabled={updating}
        />
      </Form.Item>

      <Form.Item label="Permitted time skew (ms)" name="skewMs">
        <InputNumber min={0} disabled={updating} />
      </Form.Item>
      <Form.Item {...noLabelItemLayout}>
        <Button type="primary" htmlType="submit" disabled={updating}>
          Save configuration
        </Button>
      </Form.Item>
    </Form>
  );
}

function isValidURL(url: string) {
  try {
    // eslint-disable-next-line no-new
    new URL(url);
    return Promise.resolve();
  } catch {
    return Promise.reject(new Error('Invalid URL'));
  }
}
