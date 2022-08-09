import React, { FunctionComponent, PropsWithChildren } from 'react';
import { AclAction } from 'model/AclAction';
import styled from 'styled-components';
import { Loader } from '@cognite/cogs.js';
import { PageTitle, Code } from 'components/styled';
import { useOneOfPermissions } from 'hooks/useOneOfPermissions';
import { ErrorBox } from 'components/error/ErrorBox';

const MissingCapabilityList = styled.ul`
  li {
    margin: 1rem 0;
  }
`;
const defaultHeading =
  'You have insufficient access rights to access this feature';

type MissingCapabilityBoxProps = {
  heading?: string;
  text?: string;
  requiredPermissions: Readonly<AclAction>[];
};

export const MissingCapabilityBox = ({
  heading = defaultHeading,
  text,
  requiredPermissions,
}: MissingCapabilityBoxProps) => (
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
);

const Padded = styled.div`
  padding: 1.5rem;
  grid-column: 2;
`;

export type CapabilityCheckProps = MissingCapabilityBoxProps & {
  topLevelHeading?: string;
};
export const CapabilityCheck: FunctionComponent<CapabilityCheckProps> = ({
  requiredPermissions,
  heading = defaultHeading,
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
      {MissingCapabilityBox({
        heading,
        text,
        requiredPermissions,
      })}
    </Padded>
  ) : (
    <>{children}</>
  );
};
