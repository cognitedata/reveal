import styled from 'styled-components';
import { Icon } from '@cognite/cogs.js';

export const NoAccessPage = (): JSX.Element => (
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
        To use Industry Canvas, <strong>User Profiles</strong> must be activated
        for your project, and you will need read and write capabilities for the
        following Access Control Lists (ACLs):
      </p>
      <ul>
        <li style={{ marginBottom: 5, marginTop: 5 }}>
          <strong>dataModelsAcl:READ</strong> – Access to data models
        </li>
        <li>
          <strong>dataModelInstancesAcl</strong> – Access to data model
          instances
        </li>
      </ul>
    </AccessInfo>
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
