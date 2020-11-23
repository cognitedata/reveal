import React, { useEffect } from 'react';
import { notification } from 'antd';
import { useParams } from 'react-router-dom';

import { ids } from 'cogs-variables';
import { usePermissions } from 'lib/hooks/CustomHooks';

type Props = {
  key: string;
  type: string;
};

export default function MissingPermissionFeedback(props: Props) {
  const { key, type } = props;
  const { tenant } = useParams<{ tenant: string }>();

  const { data: groupPermission } = usePermissions('groupAcl');
  const { data: hasPermission } = usePermissions(key, type);

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
        getContainer: () =>
          document
            .getElementsByClassName(ids.styleScope)
            .item(0)! as HTMLElement,
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
        getContainer: () =>
          document
            .getElementsByClassName(ids.styleScope)
            .item(0)! as HTMLElement,
      });
    }
  }, [groupPermission, hasPermission, key, type, tenant]);

  return <></>;
}
