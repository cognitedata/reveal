import React, { FunctionComponent, PropsWithChildren } from 'react';
import { AclAction } from 'model/AclAction';
import styled from 'styled-components';
import { Loader } from '@cognite/cogs.js';
import { Code } from 'styles/StyledText';
import { PageTitle } from 'styles/StyledHeadings';
import { useOneOfPermissions } from 'hooks/useOneOfPermissions';
import { ErrorBox } from 'components/error/ErrorBox';

export interface CapabilityCheckProps {
  requiredPermissions: Readonly<AclAction>[];
  heading?: string;
  text?: string;
  topLevelHeading?: string;
}

const Padded = styled.div`
  padding: 1.5em;
`;

const MissingCapabilityList = styled.ul`
  li {
    margin: 1em 0;
  }
`;

export const CapabilityCheck: FunctionComponent<CapabilityCheckProps> = ({
  requiredPermissions,
  heading = 'You have insufficient access rights to access this feature',
  text = 'To access this page you must have one of the following capabilities:',
  topLevelHeading,
  children,
}: PropsWithChildren<CapabilityCheckProps>) => {
  const permissions = useOneOfPermissions(requiredPermissions);

  if (permissions.isLoading) {
    return <Loader />;
  }
  return !permissions.data ? (
    <Padded>
      {topLevelHeading && (
        <>
          <PageTitle>{topLevelHeading}</PageTitle>
          <br />
        </>
      )}
      <ErrorBox heading={heading}>
        <p>{text}</p>
        <MissingCapabilityList>
          {requiredPermissions.map((requiredPermission) => {
            const permissionName = `${requiredPermission.acl}:${requiredPermission.action}`;
            return (
              <li key={permissionName}>
                <Code>{permissionName}</Code>
              </li>
            );
          })}
        </MissingCapabilityList>
      </ErrorBox>
    </Padded>
  ) : (
    <>{children}</>
  );
};
