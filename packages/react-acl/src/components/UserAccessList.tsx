import * as React from 'react';
import { log, getTenantInfo } from '@cognite/react-container';
import { Collapse } from '@cognite/cogs.js';

import {
  InspectResult,
  AccessRequirements,
  AccessCheckResult,
  FCWithChildren,
} from '../types';
import { getInspectedToken } from '../useInspectToken';
import { UserAccessContainer } from '../elements';
import { checkUserAccess } from '../checkUserAccess';

import { AccessGood } from './AccessGood';
import { AccessError } from './AccessError';

export const prepareData = ({
  baseUrl,
  requirements,
}: {
  baseUrl: string;
  requirements: AccessRequirements;
}) => {
  const [access, setAccess] = React.useState<AccessCheckResult>([]);
  const [currentAccess, setCurrentAccess] = React.useState<InspectResult>();
  const [project] = getTenantInfo();
  const userAccess = checkUserAccess(requirements, currentAccess, project);
  const inspectingToken = getInspectedToken(baseUrl);

  const getCheckUserAccess = async () => {
    const currentAccess = await inspectingToken;
    setCurrentAccess(currentAccess);
  };
  const doCheckUserAccess = async () => {
    const result = await userAccess;
    setAccess(result);
  };

  React.useEffect(() => {
    getCheckUserAccess();
  }, []);

  React.useEffect(() => {
    doCheckUserAccess();
  }, [currentAccess]);

  return access;
};

export const UserAccessList: FCWithChildren<{
  requirements: AccessRequirements;
  baseUrl: string;
}> = ({ baseUrl, children, requirements }) => {
  const data = prepareData({ baseUrl, requirements });

  return <UserAccessListView access={data}>{children}</UserAccessListView>;
};

export const UserAccessListView: FCWithChildren<{
  access: AccessCheckResult;
}> = ({ access, children }) => {
  const handleChange = () => {
    log('Processed access:', [access], 1);
  };

  return (
    <UserAccessContainer>
      <Collapse ghost onChange={handleChange}>
        <Collapse.Panel header="Show my access" key="user-access-list">
          <>
            {access.length === 0 && 'Loading...'}
            {access.map((value) => {
              return value.missing.length > 0 ? (
                <AccessError key={value.name} item={value} />
              ) : (
                <AccessGood key={value.name} item={value} />
              );
            })}
            {children}
          </>
        </Collapse.Panel>
      </Collapse>
    </UserAccessContainer>
  );
};
