import React from 'react';
import { useDispatch } from 'react-redux';

import { Body, Checkbox, Menu } from '@cognite/cogs.js';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { toggleLayer } from 'modules/map/actions';
import { useStaticSelectableLayers } from 'modules/map/hooks/useStaticSelectableLayers';
import { SelectableLayer } from 'modules/map/types';
import { Layer } from 'tenants/types';

import { LayerItem, LayerWrapper } from './elements';

const Item = ({
  item,
  allLayers,
}: {
  item: SelectableLayer;
  allLayers: Record<string, Layer>;
}) => {
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
        color={allLayers[item.id]?.color}
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
  allLayers: Record<string, Layer>;
}
export const LayerSelector: React.FC<Props> = React.memo(
  ({ layers = [], allLayers }) => {
    const staticLayers = useStaticSelectableLayers();

    const dynamicLayers = layers.filter(
      (layer) =>
        !staticLayers.map((staticLayer) => staticLayer.id).includes(layer.id)
    );

    return (
      <LayerWrapper>
        {layers
          .filter((layer) =>
            staticLayers.map((staticLayer) => staticLayer.id).includes(layer.id)
          )
          .map((item) => {
            return (
              <Menu.Item
                key={`mapLayerselector-${item.id}`}
                style={{ textAlign: 'left' }}
              >
                <Item
                  key={`mapLayerselector-${item.id}`}
                  item={item}
                  allLayers={allLayers}
                />
              </Menu.Item>
            );
          })}

        {dynamicLayers.length > 0 && <Menu.Divider />}
        {dynamicLayers.map((item) => {
          return (
            <Menu.Item
              key={`mapLayerselector-${item.id}`}
              style={{ textAlign: 'left' }}
            >
              <Item
                key={`mapLayerselector-${item.id}`}
                item={item}
                allLayers={allLayers}
              />
            </Menu.Item>
          );
        })}
      </LayerWrapper>
    );
  }
);

export default LayerSelector;
