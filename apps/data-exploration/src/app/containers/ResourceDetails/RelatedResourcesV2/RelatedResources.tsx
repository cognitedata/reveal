import { useState } from 'react';

import styled from 'styled-components/macro';

import {
  LinkedResourceTable,
  RelationshipTableV2,
  AnnotationTable,
  DirectlyLinkedResourceTable,
} from '@cognite/data-exploration';

import { ResourceType, ResourceItem } from '@data-exploration-lib/core';

import {
  useFlagDocumentsApiEnabled,
  useFlagFileCategorization,
} from '../../../hooks';

import { LinkTypeOptions } from './LinkTypeOptions';
import { LinkType } from './types';

export interface RelatedResourcesProps {
  resource: ResourceItem;
  relatedResourcesType: ResourceType;
  onItemClicked: (id: number) => void;
  onParentAssetClick: (assetId: number) => void;
}

export const RelatedResources: React.FC<RelatedResourcesProps> = ({
  resource,
  relatedResourcesType,
  ...rest
}) => {
  const isGroupingFilesEnabled = useFlagFileCategorization();
  const isDocumentsApiEnabled = useFlagDocumentsApiEnabled();

  const [linkType, setLinkType] = useState<LinkType>();

  const renderContent = () => {
    switch (linkType) {
      case LinkType.AllLinked:
        return (
          <LinkedResourceTable
            parentResource={resource}
            type={relatedResourcesType}
            isGroupingFilesEnabled={isGroupingFilesEnabled}
            isDocumentsApiEnabled={isDocumentsApiEnabled}
            {...rest}
          />
        );

      case LinkType.DirectlyLinked:
        return (
          <DirectlyLinkedResourceTable
            parentResource={resource}
            type={relatedResourcesType}
            isGroupingFilesEnabled={isGroupingFilesEnabled}
            isDocumentsApiEnabled={isDocumentsApiEnabled}
            {...rest}
          />
        );

      case LinkType.Relationships:
        return (
          <RelationshipTableV2
            parentResource={resource}
            type={relatedResourcesType}
            isGroupingFilesEnabled={isGroupingFilesEnabled}
            isDocumentsApiEnabled={isDocumentsApiEnabled}
            {...rest}
          />
        );

      case LinkType.Annotations:
        return (
          <AnnotationTable
            parentResource={resource}
            type={relatedResourcesType}
            {...rest}
          />
        );

      default:
        return <></>;
    }
  };

  return (
    <RelatedResourcesWrapper>
      <LinkTypeOptions
        resource={resource}
        relatedResourcesType={relatedResourcesType}
        onChange={setLinkType}
      />

      <ContentWrapper>{renderContent()}</ContentWrapper>
    </RelatedResourcesWrapper>
  );
};

const RelatedResourcesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ContentWrapper = styled.div`
  height: 100%;
  overflow-y: auto;
`;
