import React from 'react';

import { Icons } from '@cognite/cogs.js';
import styled from 'styled-components';

const NoAccessPage = (): JSX.Element => {
  return (
    <NoAccessContent>
      <Warning>
        <Icons.WarningFilled />
        <div>You have insufficient access rights to access this feature</div>
      </Warning>
      <Instructions>
        Check the access rights needed below and ask the person responsible for
        access management in your organization to grant them to you.
      </Instructions>
      <AccessInfoWrapper className="z-4">
        <AccessInfo>
          <p>
            It is a prerequisite to have <strong>groups:list</strong> scoped at
            least for the current user to access any feature.
          </p>
          <p>
            To view tables and databases in RAW, you need the capabilities{' '}
            <strong>raw:read</strong> and <strong>raw:list</strong>. To create,
            update, or delete tables and databases in RAW, you additionally need
            the capability <strong>raw:write</strong>.
          </p>
        </AccessInfo>
      </AccessInfoWrapper>
    </NoAccessContent>
  );
};

export default NoAccessPage;

const NoAccessContent = styled.div`
  margin: 80px 50px;
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

const AccessInfoWrapper = styled.div`
  background-color: white;
  padding: 14px;
  margin: 14px;
  border-radius: 4px;
`;

const AccessInfo = styled.div`
  color: var(--cogs-text-color);
  padding: 7px 14px;
  width: 100%;
  p:last-child {
    margin-bottom: 0;
  }
  strong {
    font-weight: bold;
  }
`;
