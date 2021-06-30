import React, { FunctionComponent, PropsWithChildren } from 'react';
import { AclAction } from 'model/AclAction';
import styled from 'styled-components';
import { Colors, Icon, Loader } from '@cognite/cogs.js';
import { Code } from 'styles/StyledText';
import { StyledTitle2 } from 'styles/StyledHeadings';
import { useOneOfPermissions } from 'hooks/useOneOfPermissions';

export interface CapabilityCheckProps {
  requiredPermissions: Readonly<AclAction>[];
  heading?: string;
  text?: string;
}

export const CapabilityCheck: FunctionComponent<CapabilityCheckProps> = ({
  requiredPermissions,
  heading = 'You have insufficient access rights to access this feature',
  text = 'To access this page you must have one of the following capabilities:',
  children,
}: PropsWithChildren<CapabilityCheckProps>) => {
  const permissions = useOneOfPermissions(requiredPermissions);

  if (permissions.isLoading) {
    return <Loader />;
  }
  return !permissions.data ? (
    <ErrorDialog
      requiredPermissions={requiredPermissions}
      heading={heading}
      text={text}
    />
  ) : (
    <>{children}</>
  );
};

const Wrapper = styled.div`
  padding: 2rem;
`;

const MissingCapabilityList = styled.ul`
  li {
    margin: 1em 0;
  }
`;

const StyledErrorHeader = styled(StyledTitle2)`
  display: flex;
  align-items: center;
  &&& {
    color: ${Colors['yellow-1'].hex()};
  }
`;
const ErrorDialog = ({
  requiredPermissions,
  text,
  heading,
}: CapabilityCheckProps) => {
  return (
    <Wrapper className="z-4 error-dialog">
      <StyledErrorHeader>
        <Icon type="Warning" css="margin-right: 0.5rem" />
        {heading}
      </StyledErrorHeader>
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
    </Wrapper>
  );
};
