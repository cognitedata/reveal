import React, { useEffect, useMemo, SyntheticEvent } from 'react';

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { usePermissions } from '@cognite/sdk-react-query-hooks';
import { notification } from 'antd';
import { useParams, useHistory } from 'react-router-dom';

type Props = {
  acl: string;
  type: string;
};

export default function MissingPermissionFeedback(props: Props) {
  const { acl, type } = props;
  const history = useHistory();
  const { tenant } = useParams<{ tenant: string }>();
  const { flow } = getFlow();
  const { data: hasPermission } = usePermissions(flow, acl, type);
  const { data: groupPermission } = usePermissions(flow, 'groupsAcl', 'WRITE');

  const navigate = useMemo(
    () => (event: SyntheticEvent) => {
      event.preventDefault();
      history.push(`/${tenant}/access-management`);
    },
    [history, tenant]
  );

  useEffect(() => {
    if (!groupPermission) {
      notification.error({
        key: 'group-acl-warning',
        message: `You are missing access to Group:ACL to read permissions`,
        description: (
          <p>
            Go to{' '}
            <a onClick={navigate} href={`/${tenant}/access-management`}>
              Access Management
            </a>{' '}
            and set up any missing permissions or contact your administrator!
          </p>
        ),
      });
    }
  }, [navigate, groupPermission, tenant]);

  useEffect(() => {
    if (groupPermission && !hasPermission) {
      notification.error({
        message: `You are missing access ${acl}:${type}`,
        description: (
          <p>
            Go to{' '}
            <a onClick={navigate} href={`/${tenant}/access-management`}>
              Access Management
            </a>{' '}
            and set up any missing permissions or contact your administrator!
          </p>
        ),
      });
    }
  }, [navigate, groupPermission, hasPermission, acl, type, tenant]);

  return <></>;
}
