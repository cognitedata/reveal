import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import ResourceSelectionContext from '@interactive-diagrams-app/context/ResourceSelectionContext';
import isMatch from 'lodash/isMatch';

import { createLink } from '@cognite/cdf-utilities';
import { ResourceType, ResourceItem } from '@cognite/data-exploration';

import { RelatedResources } from './RelatedResources';

export const ResourceDetailTabContent = ({
  resource,
  type,
}: {
  resource: ResourceItem;
  type: ResourceType;
}) => {
  const navigate = useNavigate();

  const { mode, onSelect, resourcesState } = useContext(
    ResourceSelectionContext
  );

  const isSelected = (item: ResourceItem) => {
    return resourcesState.some((el) =>
      isMatch(el, { state: 'selected', id: item.id, type: item.type })
    );
  };

  return (
    <RelatedResources
      type={type}
      parentResource={resource}
      onItemClicked={(id: number) => {
        navigate(createLink(`/explore/${type}/${id}`));
      }}
      selectionMode={mode}
      onSelect={onSelect}
      isSelected={isSelected}
    />
  );
};
