import React from 'react';
import styled from 'styled-components';
import { Alert } from 'antd';
import { useList } from '@cognite/sdk-react-query-hooks';
import { Loader } from 'lib/components/Loader/Loader';
import { ResourceType, convertResourceType } from 'lib/types';

type Props = {
  api: ResourceType;
  children?: React.ReactNode;
};

const ResourceAlert = styled(Alert)`
  margin-top: 50px;
`;

/*
 * This component will try to fetch a single item through the list api of the resource and render an
 * alert on error or if the list call is empty.
 */
export default function EnsureNonEmptyResource({ api, children }: Props) {
  const { data, isFetched, isError } = useList(convertResourceType(api), {
    limit: 1,
  });

  if (isError) {
    return (
      <ResourceAlert
        type="error"
        message="Error"
        description="An error occurred retrieving the resource. Make sure you have access to this resource type."
      />
    );
  }
  if (!isFetched) {
    return <Loader />;
  }

  if (data && data.length === 0) {
    return (
      <ResourceAlert
        type="info"
        message="No resources found"
        description="No resources of this type were found in this project."
      />
    );
  }

  return <>{children}</>;
}
