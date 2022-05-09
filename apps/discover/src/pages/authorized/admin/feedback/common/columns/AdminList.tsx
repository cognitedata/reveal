import { useCallback, useState } from 'react';

import { getProcessedAdminList } from 'dataLayers/userManagementService/selectors/getProcessedAdminList';
import debounce from 'lodash/debounce';
import { useJsonHeaders } from 'services/service';
import { userManagement } from 'services/userManagementService/endpoints';

import { Input, Menu } from '@cognite/cogs.js';
import { UMSUser } from '@cognite/user-management-service-types';

import { showErrorMessage } from 'components/Toast';

import { INFO_MESSAGE, NO_OPTIONS } from '../../constants';
import {
  AdminListMenu,
  AdminListMenuFooter,
  AdminUsersWrapper,
  MenuItemAssigned,
} from '../../elements';
import { NoOption } from '../elements';

import { UserNameSubtitle } from './UserNameSubtitle';

interface Props {
  assign: (user: UMSUser) => void;
  adminList?: UMSUser[];
  currentUserId?: string;
  assigneeId?: string;
}

export const AdminList: React.FC<Props> = ({
  assign,
  adminList,
  currentUserId,
  assigneeId,
}: Props) => {
  const processedAdminList = getProcessedAdminList(adminList, currentUserId);
  const [users, setUsers] = useState<UMSUser[]>(processedAdminList);
  const headers = useJsonHeaders({}, true);
  const [searchValue, setSearchValue] = useState<string>('');

  const { search } = userManagement(headers);

  const debouncedSearch = useCallback(
    debounce((value) => {
      if (!value) {
        setUsers(processedAdminList);
        return;
      }
      search(value, true)
        .then((results) => {
          setUsers(results);
        })
        .catch(() => {
          showErrorMessage('Error');
        });
    }, 300),
    []
  );

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    debouncedSearch(event.target.value);
  };

  return (
    <AdminListMenu>
      <Input
        type="search"
        variant="default"
        size="default"
        placeholder="Search"
        icon="Search"
        fullWidth
        onChange={onChange}
        value={searchValue}
        data-testid="search-bar"
      />
      <AdminUsersWrapper>
        {users.length ? (
          users.map((user: UMSUser) => {
            return user.id === assigneeId ? (
              <MenuItemAssigned
                key={user.id}
                appendIcon="Checkmark"
                data-testid="assigned-item"
              >
                <UserNameSubtitle user={user} currentUserId={currentUserId} />
              </MenuItemAssigned>
            ) : (
              <Menu.Item key={user.id} onClick={() => assign(user)}>
                <UserNameSubtitle user={user} currentUserId={currentUserId} />
              </Menu.Item>
            );
          })
        ) : (
          <NoOption disabled>{NO_OPTIONS}</NoOption>
        )}
      </AdminUsersWrapper>
      <Menu.Divider />
      <AdminListMenuFooter>{INFO_MESSAGE}</AdminListMenuFooter>
    </AdminListMenu>
  );
};
