import { ReactNode } from 'react';

import { Icons, Loader } from '@cognite/cogs.js';
import styled from 'styled-components';
import { getFlow } from '@cognite/cdf-sdk-singleton';
import { usePermissions } from '@cognite/sdk-react-query-hooks';

type AccessCheckProps = {
  children: ReactNode;
};

const AccessCheck = ({ children }: AccessCheckProps): JSX.Element => {
  const { flow } = getFlow();
  const { data: hasReadAccess, isFetched } = usePermissions(
    flow,
    'datasetsAcl',
    'READ'
  );

  if (!isFetched) {
    return <Loader />;
  }

  if (!hasReadAccess) {
    return (
      <NoAccessContent>
        <Warning>
          <Icons.WarningFilled />
          <div>You have insufficient access rights to access this feature</div>
        </Warning>
        <Instructions>
          Check the access rights needed below and ask the person responsible
          for access management in your organization to grant them to you.
        </Instructions>
        <AccessInfoWrapper className="z-4">
          <AccessInfo>
            <p>
              It is a prerequisite to have <strong>groups:list</strong> scoped
              at least for the current user to access any feature.
            </p>
            <p>
              To view data sets, you need the capability{' '}
              <strong>data-sets:read</strong>. To create new data sets or edit
              existing data sets, you also need the capability{' '}
              <strong>data-sets:write</strong>.
            </p>
          </AccessInfo>
        </AccessInfoWrapper>
      </NoAccessContent>
    );
  }

  return <>{children}</>;
};

export default AccessCheck;

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
