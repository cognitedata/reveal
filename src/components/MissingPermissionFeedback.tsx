import React, { useEffect } from 'react';
import { checkPermission } from 'modules/app';
import { useSelector } from 'react-redux';
import { notification } from 'antd';
import { RootState } from 'reducers';
import { useParams } from 'react-router-dom';
// @ts-nocheck
import { ids } from 'cogs-variables';

type Props = {
  key: string;
  type: string;
};

export default function MissingPermissionFeedback(props: Props) {
  const { key, type } = props;
  const { tenant } = useParams<{ tenant: string }>();
  const groupPermission = useSelector(
    (state: RootState) => !!state.app.groups.groupAcl
  );
  const hasPermission = useSelector(checkPermission)(key, type);

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
