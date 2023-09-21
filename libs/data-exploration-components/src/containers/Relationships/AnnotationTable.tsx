import { Loader } from '@data-exploration/components';
import {
  AssetTable,
  EventTable,
  FileTable,
  SequenceTable,
  TimeseriesTable,
} from '@data-exploration/containers';
import { Alert } from 'antd';

import { useTranslation } from '@data-exploration-lib/core';
import { useFileAnnotationsResourceIds } from '@data-exploration-lib/domain-layer';

import { useUniqueCdfItems } from '../../hooks';
import {
  convertResourceType,
  ResourceType,
  SelectableItemsProps,
} from '../../types';

type Props = {
  fileId: number;
  resourceType: ResourceType;
  onItemClicked: (id: number) => void;
  onParentAssetClick: (assetId: number) => void;
};
export function AnnotationTable({
  fileId,
  resourceType,
  onItemClicked,
  onParentAssetClick,
}: Props & SelectableItemsProps) {
  const { t } = useTranslation();

  const {
    data,
    isInitialLoading: isTaggedAnnotationsInitialLoading,
    isError,
  } = useFileAnnotationsResourceIds({ id: fileId });

  function onRowClick<T extends { id: number }>({ id }: T) {
    onItemClicked(id);
  }

  const ids = data[resourceType];
  const itemsEnabled = ids && ids.length > 0;
  const {
    data: items = [],
    isInitialLoading: isUniqueCdfItemsInitialLoading,
    isError: itemsError,
  } = useUniqueCdfItems<any>(
    convertResourceType(resourceType),
    ids.map((id) => ({ id })),
    true
  );

  if (isError || itemsError) {
    return (
      <Alert
        type="warning"
        message={t('ERROR_FETCHING_DATA', 'Error fetching annotations', {
          type: t('ANNOTATIONS', 'annotations'),
        })}
      />
    );
  }

  if (
    isTaggedAnnotationsInitialLoading &&
    isUniqueCdfItemsInitialLoading &&
    itemsEnabled
  ) {
    return <Loader />;
  }

  switch (resourceType) {
    case 'asset': {
      return (
        <AssetTable
          data={items}
          hideColumnToggle
          onRowClick={onRowClick}
          id="asset-annotations-table"
        />
      );
    }
    case 'file': {
      return (
        <FileTable
          id="file-annotation-table"
          data={items}
          onRowClick={onRowClick}
          onDirectAssetClick={(directAsset) => {
            onParentAssetClick(directAsset.id);
          }}
        />
      );
    }
    case 'timeSeries': {
      return (
        <TimeseriesTable
          hideColumnToggle
          id="timeseries-annotation-table"
          data={items}
          onRowClick={onRowClick}
        />
      );
    }
    case 'event': {
      return (
        <EventTable
          id="event-annotatio-table"
          data={items}
          onRowClick={onRowClick}
        />
      );
    }
    case 'sequence': {
      return (
        <SequenceTable
          id="sequence-annotation-table"
          data={items}
          hideColumnToggle
          onRowClick={onRowClick}
        />
      );
    }
    default:
      return null;
  }
}
