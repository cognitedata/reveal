import * as React from 'react';
import { Menu } from '@cognite/cogs.js';

import { getHeaders } from '../../utils/getHeaders';
import { useFindUsers } from '../../queries/useFindUsers';

import { DisplayName, Email, Loading } from './elements';

export const UserList: React.FC<{
  search?: string;
  userManagementServiceBaseUrl: string;
  onSelect: (id: string, display: string) => (event: any) => void;
  fasAppId?: string;
  idToken?: string;
}> = ({
  search,
  onSelect,
  userManagementServiceBaseUrl,
  fasAppId,
  idToken,
}) => {
  const headers = getHeaders(fasAppId, idToken);

  const { data, isLoading } = useFindUsers({
    headers,
    userManagementServiceBaseUrl,
    query: search,
  });

  if (!search) {
    return null;
  }

  if (isLoading) {
    return (
      <Menu>
        <Loading>Loading...</Loading>
      </Menu>
    );
  }

  if (!data) {
    return (
      <Menu>
        <Loading>No users found.</Loading>
      </Menu>
    );
  }

  return (
    <Menu>
      {data.map((item) => {
        if (!item.id) {
          return null;
        }

        const displayName = item.displayName || item.email || item.id;

        return (
          <Menu.Item
            onClick={onSelect(item.id, displayName)}
            key={`mention-${item.id}`}
            style={{
              flexDirection: 'column',
              alignItems: 'start',
            }}
          >
            <DisplayName>{displayName}</DisplayName>
            <Email>{item.email}</Email>
          </Menu.Item>
        );
      })}
    </Menu>
  );
};
