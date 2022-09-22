import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';
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
