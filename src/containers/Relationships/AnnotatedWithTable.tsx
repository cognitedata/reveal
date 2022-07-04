import React, { useMemo } from 'react';
import { SelectableItemsProps } from 'CommonProps';
import { ResourceItem } from 'types';
import { FileInfo, IdEither } from '@cognite/sdk';
import { useFilesAnnotatedWithResource } from 'hooks/RelationshipHooks';
import { uniqBy } from 'lodash';
import { ANNOTATION_METADATA_PREFIX as PREFIX } from '@cognite/annotations';
import { Alert } from 'antd';
import { Loader } from 'components';
import { FileTable } from 'containers';
import { useUniqueCdfItems } from 'hooks';

export const AnnotatedWithTable = ({
  resource,
  onItemClicked,
  ...props
}: {
  resource: ResourceItem;
  onItemClicked: (id: number) => void;
} & SelectableItemsProps) => {
  const {
    data: annotations,
    isFetched,
    isError,
  } = useFilesAnnotatedWithResource(resource);

  const ids = useMemo(
    () =>
      uniqBy(
        annotations.map(({ metadata = {} }) => {
          if (metadata[`${PREFIX}file_external_id`]) {
            return {
              externalId: metadata[`${PREFIX}file_external_id`],
            };
          }
          if (metadata[`${PREFIX}file_id`]) {
            return { id: parseInt(metadata[`${PREFIX}file_id`], 10) };
          }
          return undefined;
        }),
        (
          i:
            | { id: number; externalId: undefined }
            | { id: undefined; externalId: string }
            | undefined
        ) => i?.externalId || i?.id
      ).filter(Boolean) as IdEither[],
    [annotations]
  );

  const itemsEnabled = ids && ids.length > 0;

  const {
    data: items = [],
    isLoading: itemsLoading,
    isError: itemsError,
  } = useUniqueCdfItems<FileInfo>('files', ids, true);

  if (isError || itemsError) {
    return <Alert type="warning" message="Error fetching files" />;
  }

  if (!isFetched || (itemsLoading && itemsEnabled)) {
    return <Loader />;
  }

  return (
    <FileTable
      data={items}
      onRowClick={el => onItemClicked(el.id)}
      {...props}
    />
  );
};
