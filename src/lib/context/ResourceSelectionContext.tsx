import React, { useContext, useState } from 'react';
import queryString from 'query-string';
import { ResourceItem } from 'lib/types';
import { useHistory } from 'react-router-dom';

export type ResourceItemState = ResourceItem & {
  state: 'disabled' | 'active' | 'selected';
};

export type ResourceSelectionObserver = {
  allowEdit: boolean;
  setAllowEdit: (newMode: boolean) => void;
  queryKey: string;
};

export const ResourceSelectionContext = React.createContext(
  {} as ResourceSelectionObserver
);
ResourceSelectionContext.displayName = 'ResourceSelectionContext';

export const useResourceEditable = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.allowEdit;
};

export const useQuery: () => [string, (q: string) => void] = () => {
  const history = useHistory();
  const key = useContext(ResourceSelectionContext).queryKey;
  const search = queryString.parse(history?.location?.search);
  const query = (search[key] || '') as string;

  const setQuery = (q?: string) =>
    history.push({
      pathname: history?.location?.pathname,
      search: queryString.stringify({
        ...search,
        [key]: q || undefined,
      }),
    });
  return [query, setQuery];
};

export type ResourceSelectionProps = {
  /**
   * Allow users to have access to editing/creating utilities
   */
  allowEdit?: boolean;
  /**
   * The search param where the currrent query is stored. Default value is 'query'.
   */
  queryKey?: string;

  children?: React.ReactNode;
};

export const ResourceSelectionProvider = ({
  allowEdit: propsAllowEdit,
  queryKey = 'query',
  children,
}: ResourceSelectionProps) => {
  const [allowEdit, setAllowEdit] = useState<boolean>(propsAllowEdit || false);

  return (
    <ResourceSelectionContext.Provider
      value={{
        allowEdit,
        setAllowEdit,
        queryKey,
      }}
    >
      {children}
    </ResourceSelectionContext.Provider>
  );
};
export default ResourceSelectionContext;
