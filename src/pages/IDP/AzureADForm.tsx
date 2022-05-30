import React from 'react';

import { Form, Input } from 'antd';

import { Value } from './common';

import { AZURE_APP_RESOURCE_ID } from 'utils/constants';
import { useTranslation } from 'common/i18n';

export type AzureADState = {
  appId: Value<string>;
  appSecret: Value<string>;
  tenantId: Value<string>;
};

export type AzureADConfiguration = {
  appId: string;
  appSecret: string;
  tenantId: string;
  appResourceId: string;
};

type AzureADFormProps = {
  state: AzureADState;
  onUpdate(state: AzureADState): void;
  disabled?: boolean;
};

const AzureADForm = (props: AzureADFormProps) => {
  const { appId, appSecret, tenantId } = props.state;
  const { t } = useTranslation();

  const setAppId = (value: Value<string>) =>
    props.onUpdate({ ...props.state, appId: value });
  const setAppSecret = (value: Value<string>) =>
    props.onUpdate({ ...props.state, appSecret: value });
  const setTenantId = (value: Value<string>) =>
    props.onUpdate({ ...props.state, tenantId: value });

  return (
    <>
      <Form.Item
        label={t('app-id')}
        required
        validateStatus={appId.validateStatus}
        extra={t('app-id-desc')}
        help={appId.errorMsg}
      >
        <Input
          value={appId.value}
          disabled={props.disabled}
          onChange={(e) => setAppId({ value: e.target.value })}
        />
      </Form.Item>
      <Form.Item
        label={t('app-secret')}
        required
        validateStatus={appSecret.validateStatus}
        extra={t('app-secret-desc')}
        help={appSecret.errorMsg}
      >
        <Input
          value={appSecret.value}
          disabled={props.disabled}
          onChange={(e) => setAppSecret({ value: e.target.value })}
        />
      </Form.Item>
      <Form.Item
        label={t('tenant-id')}
        required
        validateStatus={tenantId.validateStatus}
        extra={t('tenant-id-desc')}
        help={tenantId.errorMsg}
      >
        <Input
          value={tenantId.value}
          disabled={props.disabled}
          onChange={(e) => setTenantId({ value: e.target.value })}
        />
      </Form.Item>
    </>
  );
};

export const getAzureConfiguration = (
  state: AzureADState
): AzureADConfiguration => {
  return {
    appId: state.appId.value,
    appSecret: state.appSecret.value,
    tenantId: state.tenantId.value,
    appResourceId: AZURE_APP_RESOURCE_ID,
  };
};

// TODO CDFUX-1572 - figure out translation
export const validateAzureState = (
  state: AzureADState,
  setState: (value: AzureADState) => void
): boolean => {
  let failure = false;
  let newState = state;

  if (state.appId.value === '') {
    failure = true;
    newState = {
      ...newState,
      appId: {
        ...newState.appId,
        validateStatus: 'error',
        errorMsg: 'App ID is required.',
      },
    };
  }

  if (state.appSecret.value === '') {
    failure = true;
    newState = {
      ...newState,
      appSecret: {
        ...newState.appSecret,
        validateStatus: 'error',
        errorMsg: 'App secret is required.',
      },
    };
  }

  if (state.tenantId.value === '') {
    failure = true;
    newState = {
      ...newState,
      tenantId: {
        ...newState.tenantId,
        validateStatus: 'error',
        errorMsg: 'Tenant ID is required.',
      },
    };
  }

  setState(newState);
  return failure;
};

export default AzureADForm;
