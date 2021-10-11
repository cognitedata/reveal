import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import debounce from 'lodash/debounce';

import { AutoComplete, OptionsType, OptionTypeBase } from '@cognite/cogs.js';
import { getTenantInfo } from '@cognite/react-container';

import { discoverAPI, getJsonHeaders } from 'modules/api/service';
import { User } from 'modules/user/types';

export interface UserOption {
  value: string;
  label: string;
}

export const SHARED_USER_INPUT_PLACEHOLDER =
  'Type names or emails to invite users...';

export interface Props {
  selectedOptions: UserOption[];
  onUsersSelectedChange: (users: UserOption[] | null) => void;
}

export const SearchUsers: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const headers = getJsonHeaders();
  const [tenant] = getTenantInfo();

  const searchUsers = (
    keyword: string,
    callback: (users: { value: string; label: string }[]) => void
  ) =>
    discoverAPI.user.search(keyword, headers, tenant).then((users: User[]) => {
      callback(
        users
          .filter((user) => user.firstname || user.lastname)
          .map((user) => ({
            value: user.id,
            label: `${user.firstname || ''} ${user.lastname || ''}`,
          }))
      );
    });

  const debouncedSearch = useCallback(
    debounce((input, callback) => {
      searchUsers(input, callback);
    }, 300),
    []
  );

  const loadOptions = (
    input: string,
    callback: (options: OptionsType<OptionTypeBase>) => void
  ) => {
    debouncedSearch(input, callback);
  };

  return (
    <div data-testid="shared-user-autocomplete">
      <AutoComplete
        isMulti
        mode="async"
        placeholder={t(SHARED_USER_INPUT_PLACEHOLDER)}
        loadOptions={loadOptions}
        onChange={props.onUsersSelectedChange}
        value={props.selectedOptions}
      />
    </div>
  );
};
