import React, { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { AppContext } from '@data-exploration-lib/core';
import { notification } from 'antd';

import { usePermissions } from '@cognite/sdk-react-query-hooks';

type Props = {
  key: string;
  type: string;
};

export default function MissingPermissionFeedback(props: Props) {
  const { key, type } = props;
  const { tenant } = useParams<{ tenant: string }>();

  const context = useContext(AppContext);
  const { data: groupPermission } = usePermissions(
    context?.flow! as any,
    'groupAcl',
    undefined,
    undefined,
    { enabled: !!context?.flow }
  );
  const { data: hasPermission } = usePermissions(
    context?.flow! as any,
    key,
    type,
    undefined,
    { enabled: !!context?.flow }
  );

  useEffect(() => {
    if (!groupPermission) {
      notification.error({
        key: 'group-acl-warning',
        message: `You are missing access to Group:ACL to read permissions`,
        description: (
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
        ),
      });
    }
  }, [groupPermission, tenant]);

  useEffect(() => {
    if (groupPermission && !hasPermission) {
      notification.error({
        message: `You are missing access ${key}:${type}`,
        description: (
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
        ),
      });
    }
  }, [groupPermission, hasPermission, key, type, tenant]);

  return <></>;
}
