import React, { useEffect, useMemo, SyntheticEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { notification } from 'antd';

import { usePermissions } from '@cognite/sdk-react-query-hooks';

import { getUrlWithQueryParams } from '../utils/config';

type Props = {
  acl: string;
  type: string;
};

export default function MissingPermissionFeedback(props: Props) {
  const { acl, type } = props;
  const navigate = useNavigate();
  const { project } = useParams<{ project: string }>();
  const { data: hasPermission } = usePermissions(acl, type);
  const { data: groupPermission } = usePermissions('groupsAcl', 'WRITE');

  const nav = useMemo(
    () => (event: SyntheticEvent) => {
      event.preventDefault();
      navigate(getUrlWithQueryParams(`/${project}/access-management`));
    },
    [navigate, project]
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
              onClick={nav}
              href={getUrlWithQueryParams(`/${project}/access-management`)}
            >
              Access Management
            </a>{' '}
            and set up any missing permissions or contact your administrator!
          </p>
        ),
      });
    }
  }, [nav, groupPermission, project]);

  useEffect(() => {
    if (groupPermission && !hasPermission) {
      notification.error({
        message: `You are missing access ${acl}:${type}`,
        description: (
          <p>
            Go to{' '}
            <a
              onClick={nav}
              href={getUrlWithQueryParams(`/${project}/access-management`)}
            >
              Access Management
            </a>{' '}
            and set up any missing permissions or contact your administrator!
          </p>
        ),
      });
    }
  }, [nav, groupPermission, hasPermission, acl, type, project]);

  return <></>;
}
