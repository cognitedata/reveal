import { useEffect, useState } from 'react';
import { Button, Icon } from '@cognite/cogs.js';
import { useMetrics } from '@cognite/metrics';
import { Asset, CogniteClient } from '@cognite/sdk';
import uniq from 'lodash/uniq';

import { truthy } from '../../../utils/types';
import { CogniteOrnate } from '../../../ornate';
import { OrnateListToolItem } from '../../../tools';

import { ListToolItem, ListToolPopupWrapper } from './elements';
import { ListToolPopupAsset } from './list-tool-popup-asset';
import { Task } from './list-tool-task';
import { ListStatus } from './types';

type ListToolPopupProps = {
  listItems: OrnateListToolItem[];
  listStatuses: ListStatus[];
  onItemChange: (nextListItems: OrnateListToolItem[]) => void;
  client: CogniteClient;
  noDataView?: React.ReactElement;
  ornateInstance?: CogniteOrnate;
  onStatusChange: (item: OrnateListToolItem, status?: ListStatus) => void;
};

export const ListToolPopup = ({
  listItems,
  onItemChange,
  client,
  noDataView,
  listStatuses,
  ornateInstance,
  onStatusChange,
}: ListToolPopupProps) => {
  const metrics = useMetrics('ListToolPopup');
  const [assetData, setAssetData] = useState<Record<string, Asset>>({});

  useEffect(() => {
    const assetIds = uniq(
      listItems.map((item) => item.assetId).filter(Boolean)
    ) as number[];
    if (assetIds && assetIds.length <= 0) {
      return;
    }

    client?.assets
      .retrieve(
        assetIds.map((id) => ({ id })),
        { ignoreUnknownIds: true }
      )
      .then((assets) => {
        setAssetData(
          assets.reduce(
            (acc, asset) => ({
              ...acc,
              [asset.id]: asset,
            }),
            {}
          )
        );
      });
  }, [listItems, client]);

  const onChange = (listItem: Partial<OrnateListToolItem>) => {
    if (!listItem.order) {
      return;
    }
    const nextListItems = listItems.map((x) => {
      if (x.order === listItem.order) {
        return {
          ...x,
          ...listItem,
        };
      }
      return x;
    });
    onItemChange(nextListItems);
  };

  const onMove = (listItem: OrnateListToolItem, movement: number) => {
    metrics.track('onMove', { movement });
    const { order } = listItem;
    if (movement < 0 && order === listItems.length) {
      return;
    }
    if (movement > 0 && order === 1) {
      return;
    }
    const nextListItems = listItems.map((item) => {
      if (item.order === order) {
        return {
          ...item,
          order: order - movement,
        };
      }
      if (item.order === order + -movement) {
        return {
          ...item,
          order,
        };
      }
      return item;
    });
    onItemChange(nextListItems);
  };

  const onRemove = (listItem: OrnateListToolItem) => {
    metrics.track('onRemove');
    let hasBeenRemoved = false;
    const nextListItems = listItems
      .map((item) => {
        if (item.order === listItem.order) {
          hasBeenRemoved = true;
          return null;
        }
        return {
          ...item,
          order: hasBeenRemoved ? item.order - 1 : item.order,
        };
      })
      .filter(truthy);
    onItemChange(nextListItems);
  };

  const onExport = () => {
    metrics.track('onExport');
    const rows = [
      ['Order', 'Task', 'Equipment'],
      ...listItems.map((item) => [
        item.order,
        item.status || 'EXAMINE',
        item.assetId
          ? `${assetData[item.assetId].name} - ${
              assetData[item.assetId].description?.replace(/,/g, ' ') || ''
            }`
          : item.text,
      ]),
    ];

    const csvContent = `data:text/csv;charset=utf-8,${rows
      .map((e) => e.join(','))
      .join('\n')}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Workspace-list.csv');
    document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".
    link.remove();
  };

  const renderListItems = () => {
    if (listItems.length <= 0) {
      return <ListToolItem>{noDataView || 'No data'}</ListToolItem>;
    }
    return listItems
      .sort((a, b) => a.order - b.order)
      .map((listItem) => (
        <ListToolItem key={listItem.order}>
          <div className="list-item__reorder">
            <Button
              className="caret-up"
              type="ghost"
              icon="CaretUp"
              disabled={listItem.order === 1}
              onClick={() => onMove(listItem, 1)}
            />

            <Button
              className="caret-down"
              type="ghost"
              icon="CaretDown"
              disabled={listItem.order === listItems.length}
              onClick={() => onMove(listItem, -1)}
            />
          </div>
          <div className="list-item__number">
            <Button
              type="ghost"
              onClick={() => {
                ornateInstance?.zoomToID(listItem.shapeId);
              }}
            >
              {listItem.order <= 9 ? `0${listItem.order}` : listItem.order}
            </Button>
          </div>
          <ListToolPopupAsset
            client={client}
            canChangeAsset={
              ornateInstance?.stage.findOne(`#${listItem.shapeId}`).attrs
                ?.metadata?.resourceId
            }
            asset={listItem.assetId ? assetData[listItem.assetId] : undefined}
            text={listItem.text}
            onAssetChange={(nextAsset) => {
              if (!nextAsset) {
                onChange({
                  ...listItem,
                  text: '',
                  assetId: undefined,
                });
                return;
              }
              setAssetData((prev) => ({
                ...prev,
                [nextAsset.id]: nextAsset,
              }));
              onChange({
                ...listItem,
                text: nextAsset.name,
                assetId: nextAsset.id,
              });
            }}
            onTextChange={(nextString) => {
              onChange({
                ...listItem,
                text: nextString,
              });
            }}
          />
          <Task
            listStatuses={listStatuses}
            listItem={listItem}
            onChange={(nextItem, status) => {
              onChange(nextItem);
              onStatusChange({ ...listItem, ...nextItem }, status);
            }}
          />
          <Icon
            className="list-item__remove"
            onClick={() => onRemove(listItem)}
            type="CloseLarge"
            style={{ width: 12 }}
          />
        </ListToolItem>
      ));
  };
  return (
    <ListToolPopupWrapper>
      <div style={{ maxHeight: '600px', overflow: 'auto' }}>
        {renderListItems()}
      </div>
      {listItems.length > 0 && (
        <ListToolItem style={{ justifyContent: 'right' }}>
          <Button onClick={onExport}>Export</Button>
        </ListToolItem>
      )}
    </ListToolPopupWrapper>
  );
};
