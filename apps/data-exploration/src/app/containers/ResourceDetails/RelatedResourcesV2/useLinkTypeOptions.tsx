import { useMemo } from 'react';

import {
  ResourceItem,
  ResourceType,
  convertResourceType,
  useTranslation,
} from '@data-exploration-lib/core';
import { useRelatedResourcesCount } from '@data-exploration-lib/domain-layer';

import { useFlagDocumentsApiEnabled } from '../../../hooks';

import { LinkType, LinkTypeOption } from './types';

export const useLinkTypeOptions = ({
  resource,
  relatedResourcesType,
}: {
  resource: ResourceItem;
  relatedResourcesType: ResourceType;
}) => {
  const isDocumentsApiEnabled = useFlagDocumentsApiEnabled();

  const { data: count } = useRelatedResourcesCount({
    resource,
    resourceType: relatedResourcesType,
    isDocumentsApiEnabled,
  });

  const { t } = useTranslation();

  const sdkResourceType = convertResourceType(relatedResourcesType);
  const sdkResourceTypeTranslationKey = `RESOURCE_TYPE_${sdkResourceType.toUpperCase()}`;
  const relatedResourcesTypeTranslated = t(
    sdkResourceTypeTranslationKey,
    sdkResourceType
  );

  const options: LinkTypeOption[] = useMemo(() => {
    return [
      {
        key: LinkType.AllLinked,
        label: t(
          'LINKED_RESOURCE_TYPE',
          `${LinkType.AllLinked} ${relatedResourcesTypeTranslated} (${count.linkedResourcesCount})`,
          {
            resourceType: relatedResourcesTypeTranslated,
            count: count.linkedResourcesCount,
          }
        ),
        count: count.linkedResourcesCount,
      },
      {
        key: LinkType.DirectlyLinked,
        label: t(
          'DIRECTLY_LINKED_RESOURCE_TYPE',
          `${LinkType.DirectlyLinked} ${relatedResourcesTypeTranslated} (${count.directlyLinkedResourcesCount})`,
          {
            resourceType: relatedResourcesTypeTranslated,
            count: count.directlyLinkedResourcesCount,
          }
        ),
        count: count.directlyLinkedResourcesCount,
        enabled: resource.type === 'asset' || relatedResourcesType === 'asset',
      },
      {
        key: LinkType.Relationships,
        label: `${t('RELATIONSHIPS', LinkType.Relationships)} (${
          count.relationshipsCount
        })`,
        count: count.relationshipsCount,
      },
      {
        key: LinkType.Annotations,
        label: `${t('ANNOTATIONS', LinkType.Annotations)} (${
          count.annotationsCount
        })`,
        count: count.annotationsCount,
        enabled: isAnnotationsVisible(resource, relatedResourcesType),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relatedResourcesType, relatedResourcesTypeTranslated, count]);

  return options;
};

export const isAnnotationsVisible = (
  resource: ResourceItem,
  relatedResourcesType: ResourceType
) => {
  if (resource.type === 'file') {
    return relatedResourcesType === 'asset' || relatedResourcesType === 'file';
  }
  return resource.type === 'asset' && relatedResourcesType === 'file';
};
