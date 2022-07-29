import * as React from 'react';
import { Menu } from '@cognite/cogs.js';
import { SelectableLayer } from '@cognite/react-map';

import { LayerWrapper } from './elements';
import { LayersDropdownItem } from './LayersDropdownItem';

export interface Props {
  layers: (SelectableLayer | false)[];
  onChange: (layer: SelectableLayer) => void;
}
export const LayersDropdown: React.FC<Props> = React.memo(
  ({ layers = [], onChange }) => {
    return (
      <LayerWrapper>
        {layers.map((item, index) => {
          if (!item) {
            // eslint-disable-next-line react/no-array-index-key
            return <Menu.Divider key={`empty-index-${index}`} />;
          }

          return (
            <Menu.Item
              key={`mapLayerSelector-menu-${item.id}`}
              style={{ textAlign: 'left' }}
            >
              <LayersDropdownItem onChange={onChange} item={item} />
            </Menu.Item>
          );
        })}
      </LayerWrapper>
    );
  }
);
