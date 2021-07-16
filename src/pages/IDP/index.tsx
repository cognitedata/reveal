import React, { useState } from 'react';

import {
  Alert,
  Button,
  Checkbox,
  Col,
  Form,
  Radio,
  Row,
  Select,
  Tooltip,
  notification,
} from 'antd';

import { useMutation, useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import AzureADForm, {
  AzureADConfiguration,
  AzureADState,
  getAzureConfiguration,
  validateAzureState,
} from './AzureADForm';

import OAuthForm, {
  OAuth2Configuration,
  OAuthState,
  getOAuth2Configuration,
  validateOAuthState,
} from './OAuthForm';

import { Value, validateDomainInput } from './common';

import {
  Application,
  ALL_APPS_DOMAINS,
  COGNITE_APPLICATIONS,
  FUSION_APPLICATION,
} from './applications';

export const GOOGLE_LOGIN_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
export const GOOGLE_LOGOUT_URL = 'https://accounts.google.com/logout';
export const GOOGLE_TOKEN_URL = 'https://www.googleapis.com/oauth2/v4/token';

export type CurrentAuth = {
  type: string | undefined;
  protocol: string | undefined;
  isAppDomainsSet: boolean;
};

export type UpdateBody = {
  azureADConfiguration?: {
    set: AzureADConfiguration;
  };
  oAuth2Configuration?: {
    set: OAuth2Configuration;
  };
  validDomains?: {
    set: string[];
  };
  applicationDomains?: {
    set: string[];
  };
};

type IdentityProvider = 'current' | 'azureAd' | 'googleOauth2' | 'oauth2';

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

const LegacyIdentityProviderForm = () => {
  const sdk = useSDK();
  const { mutate } = useMutation(
    (update: UpdateBody) =>
      sdk.post(`/api/playground/projects/${sdk.project}/update`, {
        data: {
          update,
        },
      }),
    {
      onMutate() {
        notification.info({
          key: 'project-update',
          message: 'Updating project settings',
        });
      },
      onSuccess() {
        notification.success({
          key: 'project-update',
          message: 'Project settings updated',
        });
      },
      onError() {
        notification.error({
          key: 'project-update',
          message: 'Project not updated!',
          description: 'An error occured when updating the project',
        });
      },
    }
  );
  const { data: project } = useQuery(['project'], () =>
    sdk.projects.retrieve(sdk.project)
  );
  const { data: writeOk } = usePermissions('projectsAcl', 'UPDATE');

  const [identityProvider, setIdentityProvider] =
    useState<IdentityProvider>('current');

  const [azureState, setAzureState] = useState<AzureADState>({
    appId: { value: '' },
    appSecret: { value: '' },
    tenantId: { value: '' },
  });

  const [googleState, setGoogleState] = useState<OAuthState>({
    clientId: { value: '' },
    clientSecret: { value: '' },
    loginUrl: { value: '' },
    logoutUrl: { value: '' },
    tokenUrl: { value: '' },
  });

  const [oauthState, setOAuthState] = useState<OAuthState>({
    clientId: { value: '' },
    clientSecret: { value: '' },
    loginUrl: { value: '' },
    logoutUrl: { value: '' },
    tokenUrl: { value: '' },
  });

  const [validDomains, setValidDomains] = useState<Value<string[] | null>>({
    value: null,
  });

  const [useAppDomains, setUseAppDomains] = useState<Value<boolean>>({
    value: false,
  });

  const [appDomains, setAppDomains] = useState<Value<string[] | null>>({
    value: null,
  });

  let providerItems: React.ReactNode;

  switch (identityProvider) {
    case 'azureAd':
      providerItems = (
        <AzureADForm
          disabled={!writeOk}
          state={azureState}
          onUpdate={setAzureState}
        />
      );
      break;

    case 'googleOauth2':
      providerItems = (
        <OAuthForm
          disabled={!writeOk}
          state={googleState}
          onUpdate={setGoogleState}
          loginUrl={GOOGLE_LOGIN_URL}
          logoutUrl={GOOGLE_LOGOUT_URL}
          tokenUrl={GOOGLE_TOKEN_URL}
        />
      );
      break;

    case 'oauth2':
      providerItems = (
        <OAuthForm
          disabled={!writeOk}
          state={oauthState}
          onUpdate={setOAuthState}
        />
      );
      break;

    case 'current':
      providerItems = <></>;
  }

  const isAppDomainsSet = project?.authentication?.applicationDomains !== null;
  const defaultAppDomains =
    project?.authentication?.applicationDomains || ([] as string[]);
  const defaultValidDomains =
    project?.authentication?.validDomains || ([] as string[]);

  const handleSubmit = () => {
    let failure = false;

    const validDomainsResult = validateDomainInput(
      validDomains.value || defaultValidDomains
    );
    if (validDomainsResult.failure) {
      failure = true;
      setValidDomains(validDomainsResult);
    }

    if (useAppDomains.value || isAppDomainsSet) {
      const appDomainsResult = validateDomainInput(
        appDomains.value || defaultAppDomains,
        true
      );
      if (appDomainsResult.failure) {
        failure = true;
        setAppDomains(appDomainsResult);
      }
    }

    let innerFailure;
    let updateBody: UpdateBody;
    switch (identityProvider) {
      case 'azureAd':
        innerFailure = validateAzureState(azureState, setAzureState);
        failure = failure || innerFailure;

        updateBody = {
          azureADConfiguration: {
            set: getAzureConfiguration(azureState),
          },
        };
        break;

      case 'oauth2':
        innerFailure = validateOAuthState(oauthState, setOAuthState);
        failure = failure || innerFailure;

        updateBody = {
          oAuth2Configuration: {
            set: getOAuth2Configuration(oauthState),
          },
        };
        break;

      case 'googleOauth2':
        innerFailure = validateOAuthState(googleState, setGoogleState, false);
        failure = failure || innerFailure;

        updateBody = {
          oAuth2Configuration: {
            set: getOAuth2Configuration(googleState, {
              loginUrl: GOOGLE_LOGIN_URL,
              logoutUrl: GOOGLE_LOGOUT_URL,
              tokenUrl: GOOGLE_TOKEN_URL,
            }),
          },
        };
        break;

      case 'current':
        updateBody = {};
        break;
    }

    if (!failure) {
      if (validDomains.value != null) {
        updateBody.validDomains = { set: validDomains.value };
      }

      if (useAppDomains.value || isAppDomainsSet) {
        updateBody.applicationDomains = {
          set: appDomains.value || defaultAppDomains,
        };
      }

      mutate(updateBody);
    }
  };

  return (
    <Form {...formItemLayout} onFinish={handleSubmit}>
      <Row style={{ marginBottom: '16px' }}>
        <Col {...noLabelItemLayout.wrapperCol}>
          <div className="cogs-title-3">Identity provider</div>
        </Col>
      </Row>

      <Form.Item label="Identity provider">
        <Radio.Group
          disabled={!writeOk}
          buttonStyle="solid"
          value={identityProvider}
          onChange={e => setIdentityProvider(e.target.value)}
        >
          <Radio.Button value="current">Use current</Radio.Button>
          &nbsp;
          <Radio.Button value="azureAd">Azure AD</Radio.Button>
          &nbsp;
          <Radio.Button value="googleOauth2">Google</Radio.Button>
          &nbsp;
          <Radio.Button value="oauth2">OAuth 2</Radio.Button>
        </Radio.Group>
      </Form.Item>

      {providerItems}

      <Form.Item
        label="Valid user domains"
        validateStatus={validDomains.validateStatus}
        extra="List of allowed user domains, like cognite.com. If the list is empty, all domains will be accepted."
        help={validDomains.errorMsg}
      >
        <Select
          disabled={!writeOk}
          mode="tags"
          tokenSeparators={[',', ' ']}
          value={validDomains.value || defaultValidDomains}
          onChange={(values: string[]) =>
            setValidDomains(validateDomainInput(values))
          }
        />
      </Form.Item>

      <Row style={{ marginBottom: '16px' }}>
        <Col {...noLabelItemLayout.wrapperCol}>
          <div className="cogs-title-3">Applications</div>
        </Col>
      </Row>

      {!isAppDomainsSet ? (
        <Row style={{ marginBottom: '16px' }}>
          <Col {...noLabelItemLayout.wrapperCol}>
            <Alert
              type="warning"
              showIcon
              message="Notice"
              description={
                <>
                  <div>
                    This project does not currently have any allowed application
                    domains enabled. For improved security we strongly encourage
                    all projects to enable application domains by Aug. 15, 2020.
                    The current behavior will be deprecated after this date.
                  </div>

                  <br />

                  <div>
                    Enabling project-specific application domains will take
                    effect upon saving the configuration. Once enabled, it
                    cannot be disabled.
                  </div>

                  <br />

                  <div>
                    <Button
                      type="primary"
                      disabled={useAppDomains.value}
                      onClick={() => {
                        setUseAppDomains({ value: true });
                        if (FUSION_APPLICATION != null) {
                          setAppDomains({
                            value: [
                              ...ALL_APPS_DOMAINS,
                              ...FUSION_APPLICATION.domains,
                            ],
                          });
                        }
                      }}
                    >
                      Enable project-specific application domains
                    </Button>
                  </div>
                </>
              }
            />
          </Col>
        </Row>
      ) : undefined}

      <Row style={{ marginBottom: '16px' }}>
        <Col {...noLabelItemLayout.wrapperCol}>
          Users can only log in to CDF through applications on allowed domains.
          It is important that the list is accurate and up-to-date.
        </Col>
      </Row>

      <Form.Item label="Allowed Cognite applications">
        {renderApplicationCheckboxes(
          appDomains.value || defaultAppDomains,
          domains => setAppDomains({ value: domains }),
          !useAppDomains.value && !isAppDomainsSet
        )}
      </Form.Item>

      <Form.Item
        label="Allowed application domains"
        validateStatus={appDomains.validateStatus}
        extra="List of allowed application domains. Users can only log in to CDF through applications on allowed domains."
        help={appDomains.errorMsg}
      >
        <Select
          mode="tags"
          tokenSeparators={[',', ' ']}
          value={appDomains.value || defaultAppDomains}
          disabled={!useAppDomains.value && !isAppDomainsSet}
          onChange={(values: string[]) =>
            setAppDomains(validateDomainInput(values, true))
          }
        />
      </Form.Item>

      <Form.Item {...noLabelItemLayout}>
        <Button type="primary" htmlType="submit" disabled={!writeOk}>
          Save configuration
        </Button>
      </Form.Item>
    </Form>
  );
};

function isApplicationEnabled(
  application: Application,
  domains: string[] = []
): boolean {
  return [...application.domains, ...ALL_APPS_DOMAINS].every(
    domain => domains.indexOf(domain) >= 0
  );
}

function isApplicationPartiallyEnabled(
  application: Application,
  domains: string[]
): boolean {
  return application.domains.some(domain => domains.indexOf(domain) >= 0);
}

function renderApplicationCheckboxes(
  domains: string[],
  setDomains: (newDomains: string[]) => void,
  disabled: boolean
): React.ReactNode {
  return COGNITE_APPLICATIONS.map(application => {
    const containsAll = isApplicationEnabled(application, domains);
    const containsSome = isApplicationPartiallyEnabled(application, domains);

    const disableUnchecked = containsAll && application.disableUncheck;

    return (
      <div>
        <Tooltip
          placement="right"
          title={application.domains.map(item => (
            <div>{item}</div>
          ))}
          overlayStyle={{ maxWidth: '400px' }}
        >
          <Checkbox
            checked={containsAll}
            indeterminate={containsSome && !containsAll}
            disabled={disabled || disableUnchecked}
            onChange={e => {
              if (e.target.checked) {
                setDomains(
                  removeDuplicates([
                    ...domains,
                    ...ALL_APPS_DOMAINS,
                    ...application.domains.filter(
                      domain => domains.indexOf(domain) < 0
                    ),
                  ])
                );
              } else {
                setDomains(
                  removeDuplicates(
                    domains.filter(
                      domain => application.domains.indexOf(domain) < 0
                    )
                  )
                );
              }
            }}
          >
            {application.name}
          </Checkbox>
        </Tooltip>
      </div>
    );
  });
}

function removeDuplicates<T>(array: T[]): T[] {
  return array.filter((item, i) => array.indexOf(item) === i);
}

export default LegacyIdentityProviderForm;
