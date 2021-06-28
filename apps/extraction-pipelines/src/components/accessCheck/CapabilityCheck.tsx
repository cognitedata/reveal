import React, { FunctionComponent, PropsWithChildren } from 'react';
import { AclAction } from 'model/AclAction';
import styled from 'styled-components';
import { Colors, Icon, Loader } from '@cognite/cogs.js';
// eslint-disable-next-line
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { Code } from 'styles/StyledText';
import { StyledTitle2 } from 'styles/StyledHeadings';

export interface CapabilityCheckProps {
  requiredAccess: Readonly<AclAction>;
  heading?: string;
  text?: string;
}

export const CapabilityCheck: FunctionComponent<CapabilityCheckProps> = ({
  requiredAccess,
  heading = 'You have insufficient access rights to access this feature',
  text = 'To access this page you must have the following capability:',
  children,
}: PropsWithChildren<CapabilityCheckProps>) => {
  const { data: hasAccess, isLoading } = usePermissions(
    requiredAccess.acl,
    requiredAccess.action
  );

  if (isLoading) {
    return <Loader />;
  }
  return !hasAccess ? (
    <ErrorDialog
      requiredAccess={requiredAccess}
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

const StyledErrorHeader = styled(StyledTitle2)`
  display: flex;
  align-items: center;
  &&& {
    color: ${Colors['yellow-1'].hex()};
  }
`;
const ErrorDialog = ({
  requiredAccess,
  text,
  heading,
}: CapabilityCheckProps) => {
  return (
    <Wrapper className="z-4 error-dialog">
      <StyledErrorHeader>
        <Icon type="Warning" css="margin-right: 0.5rem" />
        {heading}
      </StyledErrorHeader>
      <p>
        {text}
        <Code>
          {requiredAccess.acl}:{requiredAccess.action}
        </Code>
      </p>
    </Wrapper>
  );
};
