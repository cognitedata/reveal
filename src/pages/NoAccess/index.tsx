import React from 'react';
import { Icon } from '@cognite/cogs.js';
import {
  Warning,
  Instructions,
  AccessInfoWrapper,
  AccessInfo,
} from './components';

type Props = {
  missingPermissions: string[];
};

export default function NoAccessPage(props: Props): JSX.Element {
  const { missingPermissions } = props;

  return (
    <div>
      <Warning>
        <Icon type="Warning" />
        <div>
          You have insufficient access rights to access Interactive Engineering
          Diagrams
        </div>
      </Warning>
      <Instructions>
        Check the access rights needed below and ask the person responsible for
        access management in your organization to grant them to you.
      </Instructions>
      <AccessInfoWrapper className="z-4">
        <AccessInfo>
          {missingPermissions.map((permission: string) => (
            <p key={`permission-${permission}`}>
              <strong>{permission}</strong>
            </p>
          ))}
        </AccessInfo>
      </AccessInfoWrapper>
    </div>
  );
}
