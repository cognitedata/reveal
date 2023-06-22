import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import isMatch from 'lodash/isMatch';

import { createLink } from '@cognite/cdf-utilities';
import { ResourceType, ResourceItem } from '@cognite/data-exploration';

import ResourceSelectionContext from '../../../context/ResourceSelectionContext';

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
      onParentAssetClick={(assetId) => {
        navigate(createLink(`/explore/asset/${assetId}`));
      }}
      selectionMode={mode}
      onSelect={onSelect}
      isSelected={isSelected}
    />
  );
};
