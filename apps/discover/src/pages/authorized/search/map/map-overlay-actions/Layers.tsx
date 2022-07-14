import React from 'react';
import { useDispatch } from 'react-redux';

import { Body, Checkbox, Menu } from '@cognite/cogs.js';
import { SelectableLayer } from '@cognite/react-map';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { toggleLayer } from 'modules/map/actions';
import { useCategoryLayers } from 'modules/map/hooks/useCategoryLayers';

import { LayerItem, LayerWrapper } from './elements';

const Item = ({ item }: { item: SelectableLayer }) => {
  const dispatch = useDispatch();
  const metrics = useGlobalMetrics('map');
  const handleOnChange = () => {
    dispatch(toggleLayer(item));
    metrics.track(`click-${item.selected ? 'enable' : 'disable'}-layer-toggle`);
  };

  return (
    <LayerItem>
      <Checkbox
        name={item.id}
        data-testid={`layer-${item.id}`}
        checked={item.selected}
        disabled={item.disabled || false}
        onChange={handleOnChange}
        color={item.color === 'transparent' ? 'black' : item.color}
      >
        <Body level={2} as="span">
          {item.name}
        </Body>
      </Checkbox>
    </LayerItem>
  );
};

export interface Props {
  layers: SelectableLayer[];
}
export const LayerSelector: React.FC<Props> = React.memo(({ layers = [] }) => {
  const categoryLayers = useCategoryLayers();

  const topLayers: SelectableLayer[] = [];
  const bottomLayers: SelectableLayer[] = [];

  layers.forEach((layer) => {
    const isStatic = categoryLayers
      .map((staticLayer) => staticLayer.id)
      .includes(layer.id);

    if (isStatic) {
      topLayers.push(layer);
    } else {
      bottomLayers.push(layer);
    }
  });

  return (
    <LayerWrapper>
      {topLayers.map((item) => {
        return (
          <Menu.Item
            key={`mapLayerselector-menu-${item.id}`}
            style={{ textAlign: 'left' }}
          >
            <Item key={`mapLayerselector-${item.id}`} item={item} />
          </Menu.Item>
        );
      })}

      {bottomLayers.length > 0 && <Menu.Divider />}

      {bottomLayers.map((item) => {
        return (
          <Menu.Item
            key={`mapLayerselector-menu-${item.id}`}
            style={{ textAlign: 'left' }}
          >
            <Item key={`mapLayerselector-${item.id}`} item={item} />
          </Menu.Item>
        );
      })}
    </LayerWrapper>
  );
});

export default LayerSelector;
