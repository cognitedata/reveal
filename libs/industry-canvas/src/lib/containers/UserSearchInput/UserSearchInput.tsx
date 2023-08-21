import React, { useState } from 'react';

import styled from 'styled-components';

import { useDebounce } from 'use-debounce';

import { Avatar, Dropdown, InputExp, Menu } from '@cognite/cogs.js';

import { useAuth2Users } from '../../hooks/use-query/useAuth2Users';
import { useUserProfilesSearch } from '../../hooks/use-query/useUserProfilesSearch';
import { UserProfile } from '../../UserProfileProvider';

const SEARCH_DEBOUNCE_MS = 200;

type Props = {
  onUserSelected: (user: UserProfile) => void;
  placeholder?: string;
  enableAuth2Users?: boolean; // Selects which API to use to fetch users.
};

export const UserSearchInput = ({
  onUserSelected,
  placeholder = 'Search...',
  enableAuth2Users = false,
}: Props) => {
  const [searchString, setSearchString] = useState<string>('');
  const [debouncedSearchString] = useDebounce(searchString, SEARCH_DEBOUNCE_MS);

  // Use profiles api for charts
  const { userProfiles: profilesApiUsers, isLoading } = useUserProfilesSearch({
    name: debouncedSearchString,
    isEnabled: !enableAuth2Users,
  });

  // Use new auth api's for canvas to list users.
  const { orgUsers: orgApiUsers } = useAuth2Users({
    name: debouncedSearchString,
    isEnabled: enableAuth2Users,
  });

  const userProfiles = enableAuth2Users ? orgApiUsers : profilesApiUsers;

  const handleUserItemClick = (user: UserProfile) => {
    onUserSelected(user);
    setSearchString('');
  };

  return (
    <InputWrapper>
      <Dropdown
        visible={searchString.length > 0 && userProfiles.length > 0}
        content={
          <Menu loading={isLoading && debouncedSearchString.length === 0}>
            {userProfiles.map((user) => {
              return (
                <Menu.Item
                  key={`user-search-item-${user.userIdentifier}`}
                  onClick={() => {
                    handleUserItemClick(user);
                  }}
                >
                  <MenuItemContentWrapper>
                    <Avatar size="small" text={user.displayName} />
                    <span>{user.displayName}</span>
                  </MenuItemContentWrapper>
                </Menu.Item>
              );
            })}
          </Menu>
        }
      >
        <InputExp
          onChange={(ev) => setSearchString(ev.target.value)}
          onFocus={(ev) => setSearchString(ev.target.value)}
          value={searchString}
          variant="solid"
          icon="Search"
          placeholder={placeholder}
        />
      </Dropdown>
    </InputWrapper>
  );
};

const InputWrapper = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 10px;
  border-radius: 6px;

  .cogs-dropdown {
    width: 100%;

    .cogs-menu {
      max-height: 110px;
      overflow: auto;
    }
  }

  .cogs-inputexp-container {
    width: 100%;

    .cogs-inputexp {
      width: 100%;
    }
  }
`;

const MenuItemContentWrapper = styled.div`
  display: flex;
  align-items: center;

  .cogs-avatar {
    margin-right: 10px;
  }
`;
