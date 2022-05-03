import React from 'react';
import styled from 'styled-components';
import { Infobox } from '@cognite/cogs.js';
import { useList } from '@cognite/sdk-react-query-hooks';
import { Loader } from 'components/Loader/Loader';
import { ResourceType, convertResourceType } from 'types';

type Props = {
  api: ResourceType;
  children?: React.ReactNode;
};

const ResourceAlert = styled(Infobox)`
  margin-top: 50px;
`;

/*
 * This component will try to fetch a single item through the list api of the resource and render an
 * alert on error or if the list call is empty.
 */
export function EnsureNonEmptyResource({ api, children }: Props) {
  const { data, isLoading, isError } = useList(convertResourceType(api), {
    limit: 1,
  });

  if (isError) {
    return (
      <ResourceAlert type="danger" title="Error">
        An error occurred retrieving the resource. Make sure you have access to
        this resource type.
      </ResourceAlert>
    );
  }
  if (isLoading) {
    return <Loader />;
  }

  if (data && data.length === 0) {
    return (
      <ResourceAlert type="default" title="No resources found">
        No resources of this type were found in this project.
      </ResourceAlert>
    );
  }

  return <>{children}</>;
}
