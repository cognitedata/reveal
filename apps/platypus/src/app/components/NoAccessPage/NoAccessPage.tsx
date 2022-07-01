import React from 'react';
import styled from 'styled-components';
import { Icon, Tabs } from '@cognite/cogs.js';
import config from '@platypus-app/config/config';
const NoAccessPage = (): JSX.Element => {
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
          To use Flexible Data Models, you need to be have the following
          experimental ACLs:
        </p>
        <ul>
          <li>
            <strong>{config.MIXER_API_GROUP_NAME}</strong>
          </li>
          <li>
            <strong>{config.DMS_API_GROUP_NAME}</strong>
          </li>
        </ul>
      </AccessInfo>
      <p>
        To grant this, make sure to contact your admin and link your account
        with a Cognite Group that has these two experimental ACLs. Below are
        some sample code on how you can create a CDF group with these ACLs and
        link it to your IdP group.
      </p>
      <Tabs defaultActiveKey="Postman">
        <Tabs.TabPane key="Postman" tab="Postman (CURL)">
          <pre>{`curl --location --request POST 'https://greenfield.cognitedata.com/api/v1/projects/<cdf project>/groups' 
--header 'Authorization: Bearer <XXX>' 
--data-raw '{
    "items": [
        {
            "name": "FDM",
            "sourceId": "<my AD group UUID>",
            "capabilities": [
                {
                    "experimentAcl": {
                        "actions": [
                            "USE"
                        ],
                        "scope": {
                            "experimentscope": {
                                "experiments": [
                                    "schema",
                                    "datamodelstorage"
                                ]
                            }
                        }
                    }
                }
            ]
        }
    ]
}'`}</pre>
        </Tabs.TabPane>
        <Tabs.TabPane key="Python" tab="Python">
          <pre>{`my_capabilities = [
    {"experimentAcl": 
     {"actions": ["USE"],
      "scope": 
      {"experimentscope": 
       {"experiments": ["schema", "datamodelstorage"]}
      }
     }
    }
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
