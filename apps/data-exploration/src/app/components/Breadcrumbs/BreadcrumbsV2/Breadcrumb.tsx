import React from 'react';

import { useCdfItem } from '@cognite/sdk-react-query-hooks';

import {
  Resource,
  convertResourceType,
  ResourceType,
} from '@data-exploration-components';

import { BreadcrumbItem } from './BreadcrumbItem';
import { BreadcrumbItemIcon } from './BreadcrumbItemIcon';
import { getBreadcrumbTitle } from './getBreadcrumbTitle';

export const Breadcrumb = React.memo(
  ({
    type,
    id,
    onClick,
  }: {
    type: ResourceType;
    id: number;
    onClick: () => void;
  }) => {
    const sdkResourceType = convertResourceType(type);
    const { data, isFetched } = useCdfItem<Resource>(sdkResourceType, { id });

    if (!isFetched) {
      return null;
    }

    return (
      <BreadcrumbItem onClick={onClick}>
        <span style={{ display: 'flex', marginRight: '8px' }}>
          <BreadcrumbItemIcon type={type!} />
        </span>
        <span style={{ whiteSpace: 'nowrap' }}>
          {getBreadcrumbTitle(type, data)}
        </span>
      </BreadcrumbItem>
    );
  }
);
