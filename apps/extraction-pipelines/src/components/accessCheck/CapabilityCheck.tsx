import React, { FunctionComponent, PropsWithChildren } from 'react';
import { AclAction } from 'model/AclAction';
import styled from 'styled-components';
import { Loader } from '@cognite/cogs.js';
import { PageTitle, Code } from 'components/styled';
import { useOneOfPermissions } from 'hooks/useOneOfPermissions';
import { ErrorBox } from 'components/error/ErrorBox';
import { useTranslation } from 'common';

type MissingCapabilityBoxProps = {
  heading?: string;
  text?: string;
  requiredPermissions: Readonly<AclAction>[];
};

export const MissingCapabilityBox = (props: MissingCapabilityBoxProps) => {
  const { t } = useTranslation();
  const { heading = t('no-access'), text, requiredPermissions } = props;

  return (
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
};

export type CapabilityCheckProps = MissingCapabilityBoxProps & {
  topLevelHeading?: string;
};

export const CapabilityCheck: FunctionComponent<CapabilityCheckProps> = (
  props: PropsWithChildren<CapabilityCheckProps>
) => {
  const { t } = useTranslation();
  const {
    requiredPermissions,
    heading = t('no-access'),
    text = t('no-access-desc'),
    topLevelHeading,
    children,
  } = props;
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

const MissingCapabilityList = styled.ul`
  li {
    margin: 1rem 0;
  }
`;

const Padded = styled.div`
  padding: 1.5rem;
  grid-column: 2;
`;
