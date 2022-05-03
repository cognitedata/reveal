import React, { useContext, useEffect } from 'react';
import { toast } from '@cognite/cogs.js';
import { useParams } from 'react-router-dom';

import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { AppContext } from 'context/AppContext';

type Props = {
  key: string;
  type: string;
};

export default function MissingPermissionFeedback(props: Props) {
  const { key, type } = props;
  const { tenant } = useParams<{ tenant: string }>();

  const context = useContext(AppContext);
  const { data: groupPermission } = usePermissions(
    context?.flow!,
    'groupAcl',
    undefined,
    undefined,
    { enabled: !!context?.flow }
  );
  const { data: hasPermission } = usePermissions(
    context?.flow!,
    key,
    type,
    undefined,
    { enabled: !!context?.flow }
  );

  useEffect(() => {
    if (!groupPermission) {
      toast.error(
        <div>
          <h3>You are missing access to Group:ACL to read permissions</h3>
          <p>
            Go to{' '}
            <a
              href={`https://console.cognitedata.com/${tenant}/access-management`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Console
            </a>{' '}
            and set up any missing permissions or contact your administrator!
          </p>
        </div>
      );
    }
  }, [groupPermission, tenant]);

  useEffect(() => {
    if (groupPermission && !hasPermission) {
      toast.error(
        <div>
          <h3>
            You are missing access {key}:{type}
            <p>
              Go to{' '}
              <a
                href={`https://console.cognitedata.com/${tenant}/access-management`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Console
              </a>{' '}
              and set up any missing permissions or contact your administrator!
            </p>
          </h3>
        </div>
      );
    }
  }, [groupPermission, hasPermission, key, type, tenant]);

  return <></>;
}
