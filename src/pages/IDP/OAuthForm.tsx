import React from 'react';

import { Form, Input } from 'antd';

import { Value } from './common';
import { useTranslation } from 'common/i18n';

export type OAuthState = {
  clientId: Value<string>;
  clientSecret: Value<string>;
  loginUrl: Value<string>;
  logoutUrl: Value<string>;
  tokenUrl: Value<string>;
};

export type OAuth2Configuration = {
  clientId: string;
  clientSecret: string;
  loginUrl: string;
  logoutUrl: string;
  tokenUrl: string;
};

type OAuthFormProps = {
  state: OAuthState;
  onUpdate(state: OAuthState): void;
  disabled?: boolean;

  loginUrl?: string;
  logoutUrl?: string;
  tokenUrl?: string;
};

const OAuthForm = (props: OAuthFormProps) => {
  const { clientId, clientSecret, loginUrl, logoutUrl, tokenUrl } = props.state;
  const { t } = useTranslation();

  const setClientId = (value: Value<string>) =>
    props.onUpdate({ ...props.state, clientId: value });
  const setClientSecret = (value: Value<string>) =>
    props.onUpdate({ ...props.state, clientSecret: value });
  const setLoginUrl = (value: Value<string>) =>
    props.onUpdate({ ...props.state, loginUrl: value });
  const setLogoutUrl = (value: Value<string>) =>
    props.onUpdate({ ...props.state, logoutUrl: value });
  const setTokenUrl = (value: Value<string>) =>
    props.onUpdate({ ...props.state, tokenUrl: value });
  return (
    <>
      <Form.Item
        label={t('client-id')}
        required
        validateStatus={clientId.validateStatus}
        extra={t('client-id-desc')}
        help={clientId.errorMsg}
      >
        <Input
          value={clientId.value}
          disabled={props.disabled}
          onChange={(e) => setClientId({ value: e.target.value })}
        />
      </Form.Item>
      <Form.Item
        label={t('client-secret')}
        required
        validateStatus={clientSecret.validateStatus}
        extra={t('client-secret-desc')}
        help={clientSecret.errorMsg}
      >
        <Input
          value={clientSecret.value}
          disabled={props.disabled}
          onChange={(e) => setClientSecret({ value: e.target.value })}
        />
      </Form.Item>
      <Form.Item
        label={t('login-url')}
        required
        validateStatus={loginUrl.validateStatus}
        extra={t('login-url-desc')}
        help={loginUrl.errorMsg}
      >
        <Input
          value={props.loginUrl || loginUrl.value}
          disabled={props.disabled || props.loginUrl != null}
          onChange={(e) => setLoginUrl({ value: e.target.value })}
        />
      </Form.Item>
      <Form.Item
        label={t('logout-url')}
        required
        validateStatus={logoutUrl.validateStatus}
        extra={t('logout-url-desc')}
        help={logoutUrl.errorMsg}
      >
        <Input
          value={props.logoutUrl || logoutUrl.value}
          disabled={props.disabled || props.logoutUrl != null}
          onChange={(e) => setLogoutUrl({ value: e.target.value })}
        />
      </Form.Item>
      <Form.Item
        label={t('token-url')}
        required
        validateStatus={tokenUrl.validateStatus}
        extra={t('token-url-desc')}
        help={tokenUrl.errorMsg}
      >
        <Input
          value={props.tokenUrl || tokenUrl.value}
          disabled={props.disabled || props.tokenUrl != null}
          onChange={(e) => setTokenUrl({ value: e.target.value })}
        />
      </Form.Item>
    </>
  );
};

export const getOAuth2Configuration = (
  state: OAuthState,
  overrides?: { loginUrl?: string; logoutUrl?: string; tokenUrl?: string }
): OAuth2Configuration => {
  return {
    clientId: state.clientId.value,
    clientSecret: state.clientSecret.value,
    loginUrl: overrides?.loginUrl || state.loginUrl.value,
    logoutUrl: overrides?.logoutUrl || state.logoutUrl.value,
    tokenUrl: overrides?.tokenUrl || state.tokenUrl.value,
  };
};

// TODO CDFUX-1572 - figure out translation
export const validateOAuthState = (
  state: OAuthState,
  setState: (value: OAuthState) => void,
  validateUrls: boolean = true
): boolean => {
  let failure = false;
  let newState = state;

  if (state.clientId.value === '') {
    failure = true;
    newState = {
      ...newState,
      clientId: {
        ...newState.clientId,
        validateStatus: 'error',
        errorMsg: 'Client ID is required.',
      },
    };
  }

  if (state.clientSecret.value === '') {
    failure = true;
    newState = {
      ...newState,
      clientSecret: {
        ...newState.clientSecret,
        validateStatus: 'error',
        errorMsg: 'Client secret is required.',
      },
    };
  }

  if (validateUrls && state.loginUrl.value === '') {
    failure = true;
    newState = {
      ...newState,
      loginUrl: {
        ...newState.loginUrl,
        validateStatus: 'error',
        errorMsg: 'Login URL is required.',
      },
    };
  }

  if (validateUrls && state.logoutUrl.value === '') {
    failure = true;
    newState = {
      ...newState,
      logoutUrl: {
        ...newState.logoutUrl,
        validateStatus: 'error',
        errorMsg: 'Logout URL is required.',
      },
    };
  }

  if (validateUrls && state.tokenUrl.value === '') {
    failure = true;
    newState = {
      ...newState,
      tokenUrl: {
        ...newState.tokenUrl,
        validateStatus: 'error',
        errorMsg: 'Token URL is required.',
      },
    };
  }

  setState(newState);
  return failure;
};
export default OAuthForm;
