import { useEffect } from 'react';

import styled from 'styled-components';

import { Icon } from '@cognite/cogs.js';

import config from '../../config/config';
import { useMixpanel } from '../../hooks/useMixpanel';

const NoAccessPage = (): JSX.Element => {
  const { track } = useMixpanel();
  useEffect(() => {
    track('DataModel.NoPermission');
  }, [track]);
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
  p:last-child {
    margin-bottom: 0;
  }
  strong {
    font-weight: bold;
  }
`;
