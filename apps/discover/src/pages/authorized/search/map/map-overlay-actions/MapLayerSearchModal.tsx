import * as React from 'react';

import { Menu } from '@cognite/cogs.js';

import { MapLayerGeoJsonFilter } from '../../../../../modules/sidebar/types';

export interface MapLayerSearchModalProps {
  items: MapLayerGeoJsonFilter[];
  onItemSelect: (item: MapLayerGeoJsonFilter) => void;
}

export const MapLayerSearchModal: React.FC<MapLayerSearchModalProps> = ({
  items,
  onItemSelect,
}) => {
  return (
    <Menu>
      <Menu.Header>Areas</Menu.Header>
      {items.map((item) => {
        return (
          <Menu.Item onClick={() => onItemSelect(item)} key={item.label}>
            {item.label}
          </Menu.Item>
        );
      })}
    </Menu>
  );
};
