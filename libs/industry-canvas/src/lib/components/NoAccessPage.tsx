import styled from 'styled-components';

import { Icon } from '@cognite/cogs.js';

type NoAccessPageProps = {
  hasDataModelReadAcl?: boolean;
  hasDataModelInstancesReadAcl?: boolean;
  hasDataModelInstancesWrite?: boolean;
  isUserProfileApiActivated?: boolean;
  requiredScopes?: string[];
};

const getRequiredScopesString = (scopes: string[] | undefined): string =>
  scopes?.join(', ') ?? '';

export const NoAccessPage: React.FC<NoAccessPageProps> = ({
  hasDataModelInstancesReadAcl,
  hasDataModelInstancesWrite,
  hasDataModelReadAcl,
  isUserProfileApiActivated,
  requiredScopes,
}) => (
  <NoAccessContent>
    <Warning>
      <Icon type="WarningFilled" />
      <h3>Insufficient Access Rights</h3>
    </Warning>
    <div>You do not have sufficient access rights to use this application.</div>
    <Instructions>
      Please check the access rights required below and ask the contact person
      responsible for access management in your organization to grant them to
      you.
    </Instructions>
    <AccessInfo className="z-4">
      <p>
        To use Industrial Canvas, <strong>User Profiles</strong> must be
        activated for your project, and you will need capabilities the{' '}
        <strong>Access Control Lists (ACLs) </strong> listed below. Please ask
        your IT admin to help you with this.
      </p>
      <ul>
        <li style={{ marginBottom: 5, marginTop: 5 }}>
          <strong>datamodels:read</strong> – Access to read data models.
          <ul>
            <li>
              Required scopes:{' '}
              <samp>[{getRequiredScopesString(requiredScopes)}]</samp>
            </li>
          </ul>
        </li>
        <li>
          <strong>datamodelinstances:read</strong> – Access to read data model
          instances.
          <ul>
            <li>
              Required scopes:{' '}
              <samp>[{getRequiredScopesString(requiredScopes)}]</samp>
            </li>
          </ul>
        </li>
        <li>
          <strong>datamodelinstances:write</strong> – Access to write data model
          instances.
          <ul>
            <li>
              Required scopes:{' '}
              <samp>[{getRequiredScopesString(requiredScopes)}]</samp>
            </li>
          </ul>
        </li>
      </ul>
    </AccessInfo>

    <Instructions>
      The following capabilities and features are missing and need to be
      activated:
      <ul>
        {isUserProfileApiActivated === false && (
          <li>
            <strong>User Profiles API</strong> is not enabled.
          </li>
        )}
        {hasDataModelReadAcl === false && (
          <li>
            <strong>datamodels:read</strong>
          </li>
        )}
        {hasDataModelInstancesReadAcl === false && (
          <li>
            <strong>datamodelinstances:read</strong>
          </li>
        )}
        {hasDataModelInstancesWrite === false && (
          <li>
            <strong>datamodelinstances:write</strong>
          </li>
        )}
      </ul>
    </Instructions>
  </NoAccessContent>
);

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
  margin-top: 10px;
  margin-bottom: 20px;
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
