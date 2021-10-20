import { useState, useEffect } from 'react';
import { Button, Dropdown, Icon, Menu } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import { Asset } from '@cognite/sdk';
import { ShapeConfig } from 'konva/lib/Shape';
import { Marker } from '@cognite/ornate';
import uniq from 'lodash/uniq';
import { NullView } from 'components/NullView/NullView';
import { useMetrics } from '@cognite/metrics';

import ListToolSidebarAsset from './ListToolSidebarAsset';
import { ListToolSidebarWrapper, ListToolItem } from './elements';

export type ListToolStatus = 'CLOSE' | 'OPEN';

export const LIST_TOOL_STATUSES: Record<
  ListToolStatus,
  { display: string; styleOverrides: ShapeConfig }
> = {
  CLOSE: {
    display: 'CLOSE',
    styleOverrides: {
      fill: 'rgba(255, 0, 0, 0.2)',
      stroke: 'red',
      cornerRadius: 5,
    },
  },
  OPEN: {
    display: 'OPEN',
    styleOverrides: {
      fill: 'rgba(0, 255, 0, 0.2)',
      stroke: 'green',
      cornerRadius: 50,
    },
  },
};
export type ListItem = {
  marker: Marker;
  order: number;
  text: string;
  status?: ListToolStatus;
  notes?: string;
  assetId?: number;
};

type ListToolSidebarProps = {
  listItems: ListItem[];
  onItemChange: (nextListItems: ListItem[]) => void;
};

const ListToolSidebar = ({ listItems, onItemChange }: ListToolSidebarProps) => {
  const { client } = useAuthContext();
  const metrics = useMetrics('ListToolSidebar');
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
  }, [listItems]);

  const onChange = (listItem: Partial<ListItem>) => {
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

  const onMove = (listItem: ListItem, movement: number) => {
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

  const onRemove = (listItem: ListItem) => {
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
      .filter(Boolean) as ListItem[];
    onItemChange(nextListItems);
  };
  const renderStatus = (listItem: ListItem) => {
    return (
      <Dropdown
        content={
          <Menu>
            {Object.keys(LIST_TOOL_STATUSES).map((statusKey) => (
              <Menu.Item
                key={statusKey}
                onClick={() =>
                  onChange({
                    ...listItem,
                    status: statusKey as ListToolStatus,
                  })
                }
              >
                {LIST_TOOL_STATUSES[statusKey as ListToolStatus].display}
              </Menu.Item>
            ))}

            <Menu.Item
              onClick={() =>
                onChange({
                  ...listItem,
                  status: undefined,
                })
              }
            >
              EXAMINE
            </Menu.Item>
          </Menu>
        }
      >
        <Button
          unstyled
          className="list-item__status"
          style={{
            color: listItem.status
              ? String(
                  LIST_TOOL_STATUSES[listItem.status].styleOverrides.stroke
                )
              : 'var(--cogsr-greyscale-grey6',
          }}
        >
          {listItem.status || 'EXAMINE'}
        </Button>
      </Dropdown>
    );
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
              assetData[item.assetId].description?.replaceAll(',', ' ') || ''
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
      return (
        <ListToolItem>
          <NullView type="listItems" />
        </ListToolItem>
      );
    }
    return listItems
      .sort((a, b) => a.order - b.order)
      .map((listItem) => (
        <ListToolItem key={listItem.order}>
          <div className="list-item__reorder">
            <Button
              className="caret-up"
              unstyled
              icon="CaretUp"
              disabled={listItem.order === 1}
              onClick={() => onMove(listItem, 1)}
            />

            <Button
              className="caret-up"
              unstyled
              icon="CaretDown"
              disabled={listItem.order === listItems.length}
              onClick={() => onMove(listItem, -1)}
            />
          </div>
          <div className="list-item__number">
            {listItem.order <= 9 ? `0${listItem.order}` : listItem.order}
          </div>
          <ListToolSidebarAsset
            canChangeAsset={!listItem.marker.shape.attrs?.metadata?.resourceId}
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
          {renderStatus(listItem)}
          <Icon
            className="list-item__remove"
            onClick={() => onRemove(listItem)}
            type="LargeClose"
            style={{ width: 12 }}
          />
        </ListToolItem>
      ));
  };
  return (
    <ListToolSidebarWrapper>
      <div style={{ maxHeight: '600px', overflow: 'auto' }}>
        {renderListItems()}
      </div>
      {listItems.length > 0 && (
        <ListToolItem style={{ justifyContent: 'right' }}>
          <Button onClick={onExport}>Export</Button>
        </ListToolItem>
      )}
    </ListToolSidebarWrapper>
  );
};

export default ListToolSidebar;
