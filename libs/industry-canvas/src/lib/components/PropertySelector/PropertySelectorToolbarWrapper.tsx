import React from 'react';

import styled from 'styled-components';

import { sortBy } from 'lodash';

import { Icon } from '@cognite/cogs.js';
import {
  ContainerType,
  DEFAULT_ASSET_CONTAINER_PROPERTIES,
  DEFAULT_EVENT_CONTAINER_PROPERTIES,
} from '@cognite/unified-file-viewer';

import findApplicableContainerConfigFilter from '../../hooks/utils/findApplicableContainerConfigFilter';
import {
  selectors,
  useIndustrialCanvasStore,
} from '../../state/useIndustrialCanvasStore';
import { Filter, IndustryCanvasContainerConfig } from '../../types';
import zIndex from '../../utils/zIndex';

import useResolveContainerConfigProperties from './hooks/useResolveContainerConfigProperties';
import PropertySelector, { PropertySelectorProps } from './PropertySelector';
import { Property } from './types';

type PropertySelectorToolbarWrapperProps = {
  containerConfig: IndustryCanvasContainerConfig;
  onApplyClick: PropertySelectorProps['onApplyClick'];
};

const shouldPropertyBeSelected = (
  path: string,
  containerConfig: IndustryCanvasContainerConfig,
  filter: Filter | undefined
) => {
  if (filter !== undefined) {
    return filter.properties.includes(path);
  }

  switch (containerConfig.type) {
    case ContainerType.ASSET:
      return DEFAULT_ASSET_CONTAINER_PROPERTIES.includes(path);
    case ContainerType.EVENT:
      return DEFAULT_EVENT_CONTAINER_PROPERTIES.includes(path);
    default:
      throw new Error(`Unsupported container type: ${containerConfig.type}`);
  }
};

const getPropertySortOrderByContainerConfig = (
  containerConfig: IndustryCanvasContainerConfig,
  path: string
): number => {
  if (
    containerConfig.type !== ContainerType.ASSET &&
    containerConfig.type !== ContainerType.EVENT
  ) {
    return Number.POSITIVE_INFINITY;
  }

  if (containerConfig.properties === undefined) {
    return Number.POSITIVE_INFINITY;
  }

  const index = containerConfig.properties.findIndex(
    (property) => property === path
  );

  return index >= 0 ? index : Number.POSITIVE_INFINITY;
};

const getPropertiesFromFilters = (
  containerConfig: IndustryCanvasContainerConfig,
  allProperties: Property[],
  filters: Filter[]
): Property[] => {
  const applicableFilter = findApplicableContainerConfigFilter(
    containerConfig,
    filters
  );

  return sortBy(
    allProperties.map((property) => ({
      ...property,
      isSelected: shouldPropertyBeSelected(
        property.path,
        containerConfig,
        applicableFilter
      ),
    })),
    (property) =>
      getPropertySortOrderByContainerConfig(containerConfig, property.path)
  );
};

const PropertySelectorToolbarWrapper: React.FC<
  PropertySelectorToolbarWrapperProps
> = ({ containerConfig, onApplyClick }) => {
  const { data = [], isLoading } =
    useResolveContainerConfigProperties(containerConfig);

  const { filters } = useIndustrialCanvasStore((state) => ({
    filters: selectors.canvasState(state).filters,
  }));

  const properties = getPropertiesFromFilters(containerConfig, data, filters);

  if (isLoading) {
    return (
      <AlignmentWrapper>
        <Icon type="Loader" />
      </AlignmentWrapper>
    );
  }

  return (
    <AlignmentWrapper>
      <PropertySelector
        propertiesList={[properties]}
        onApplyClick={onApplyClick}
      />
    </AlignmentWrapper>
  );
};

const AlignmentWrapper = styled.div`
  position: absolute;
  bottom: 100%;
  z-index: ${zIndex.POPUP};
`;

export default PropertySelectorToolbarWrapper;
