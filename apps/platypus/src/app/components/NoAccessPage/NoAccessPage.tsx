import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon, Tabs } from '@cognite/cogs.js';
import config from '@platypus-app/config/config';
import { getCogniteSDKClient } from '../../../environments/cogniteSdk';
import { getProject } from '@cognite/cdf-utilities';

const DEFAULT_TOKEN_STR = 'Bearer <xxx>';
const NoAccessPage = (): JSX.Element => {
  const [token, setToken] = useState(DEFAULT_TOKEN_STR);

  useEffect(() => {
    (async () => {
      try {
        setToken(
          (await getCogniteSDKClient().getDefaultRequestHeaders()
            .Authorization) || DEFAULT_TOKEN_STR
        );
      } catch (e) {
        // noop
      }
    })();
  }, []);
  return (
    <NoAccessContent>
      <Warning>
        <Icon type="WarningFilled" />
        <div>You have insufficient access rights to access this feature</div>
      </Warning>
      <Instructions>
        Check the access rights needed below and ask the person responsible for
        access management in your organization to grant them to you.
      </Instructions>
      <AccessInfo className="z-4">
        <p>
          To use Flexible Data Models, you need to be have the following{' '}
          {config.DATA_MODELS_GROUP_NAME} ACLs:
        </p>
        <ul>
          <li>
            <strong>{config.DATA_MODELS_ACL}</strong>
          </li>
          <li>
            <strong>{config.DATA_MODELS_INSTANCES_ACL}</strong>
          </li>
        </ul>
      </AccessInfo>
      <p>
        To grant this, make sure to contact your admin and link your account
        with a Cognite Group that has these two {config.DATA_MODELS_GROUP_NAME}{' '}
        ACLs. You can do this via the "manage access" tool in this UI under the
        "manage" tab, or you can run the sample code belowto create a CDF group
        with these ACLs and link it to your IdP group.
      </p>
      <Tabs defaultActiveKey="Postman">
        <Tabs.TabPane key="Postman" tab="Postman (CURL)">
          <pre>{`curl --location --request POST '${getCogniteSDKClient().getBaseUrl()}/api/v1/projects/${getProject()}/groups' \\
--header 'Authorization: ${token}' \\
--header 'Content-Type: application/json' \\
--data-raw '{
    "items": [
        {
            "name": "FDM",
            "sourceId": "<my AD group UUID>",
            "capabilities": [
              {
                dataModelsAcl: {
                  actions: ['READ', 'WRITE'],
                  scope: {
                    all: {},
                  },
                },
              },
              {
                dataModelInstancesAcl: {
                  actions: ['READ', 'WRITE'],
                  scope: {
                    all: {},
                  },
                },
              },
            ]
      },
    ]
}'`}</pre>
        </Tabs.TabPane>
        <Tabs.TabPane key="Python" tab="Python">
          <pre>{`my_capabilities = [
    {
      "dataModelsAcl": {
        "actions": ['READ', 'WRITE'],
        "scope": {
          "all": {},
        },
      },
    },
    {
      "dataModelInstancesAcl": {
        "actions": ['READ', 'WRITE'],
        "scope": {
          "all": {},
        },
      },
    },
]
my_group = Group(
  name="FDM",
  capabilities=my_capabilities,
  source_id="<my AD group UUID>"
)
client.iam.groups.create(my_group)`}</pre>
        </Tabs.TabPane>
      </Tabs>
    </NoAccessContent>
  );
};

export default NoAccessPage;

const NoAccessContent = styled.div`
  padding: 80px 50px;
  height: 100%;
  overflow: auto;

  pre {
    user-select: text;
  }
`;

const Warning = styled.div`
  font-size: 16px;
  color: var(--cogs-yellow-1);
  font-weight: bold;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  svg {
    margin-right: 1em;
  }
`;

const Instructions = styled.div`
  margin-bottom: 28px;
`;

const AccessInfo = styled.div`
  color: var(--cogs-text-color);
  padding: 14px;
  width: 100%;
  margin-bottom: 14px;
  p:last-child {
    margin-bottom: 0;
  }
  strong {
    font-weight: bold;
  }
`;
