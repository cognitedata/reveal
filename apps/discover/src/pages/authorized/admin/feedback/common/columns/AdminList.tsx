import { getProcessedAdminList } from 'dataLayers/userManagementService/selectors/getProcessedAdminList';
import { getUmsUserName } from 'dataLayers/userManagementService/selectors/getUmsUserName';

import { Input, Menu } from '@cognite/cogs.js';
import { UMSUser } from '@cognite/user-management-service-types';

import { INFO_MESSAGE } from '../../constants';
import {
  AdminListMenu,
  AdminListMenuFooter,
  AdminUsersWrapper,
  MenuItemAssigned,
} from '../../elements';

interface Props {
  assign: (user: UMSUser) => void;
  adminList?: UMSUser[];
  currentUserId?: string;
  assigneeId?: string;
}

export const AdminList = ({
  assign,
  adminList,
  currentUserId,
  assigneeId,
}: Props) => {
  const users = getProcessedAdminList(adminList, currentUserId);

  return (
    <AdminListMenu>
      <Menu.Item>
        <Input
          type="search"
          size="default"
          placeholder="Search"
          icon="Search"
          fullWidth
        />
      </Menu.Item>
      <AdminUsersWrapper>
        {users.length &&
          users.map((user: UMSUser) => {
            const userName = getUmsUserName(user, currentUserId);
            return user.id === assigneeId ? (
              <MenuItemAssigned key={user.id} appendIcon="Checkmark">
                {userName}
              </MenuItemAssigned>
            ) : (
              <Menu.Item key={user.id} onClick={() => assign(user)}>
                {userName}
              </Menu.Item>
            );
          })}
      </AdminUsersWrapper>
      <Menu.Divider />
      <AdminListMenuFooter>{INFO_MESSAGE}</AdminListMenuFooter>
    </AdminListMenu>
  );
};
