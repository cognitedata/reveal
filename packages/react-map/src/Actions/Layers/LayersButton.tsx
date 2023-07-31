import * as React from 'react';
import { Button, Dropdown, Tooltip } from '@cognite/cogs.js';

import { SelectableLayer } from '../../layers/types';
import { LAYER_BUTTON_TEXT, LAYER_TOOLTIP_TEXT } from '../../constants';

import { LayersDropdown } from './LayersDropdown';
import { LayerOnChange, Layers } from './types';

export interface Props {
  layers: Layers;
  onChange?: LayerOnChange;
}
export const LayersButton: React.FC<Props> = React.memo(
  ({ layers, onChange }) => {
    const [selected, setSelected] = React.useState<'Layers' | null>(null);

    const handleChange = (layer: SelectableLayer) => {
      if (onChange) {
        onChange(layer);
      }
    };

    const handleClose = () => {
      if (selected !== null) {
        setSelected(null);
      }
    };

    const handleSelectLayers = () => {
      if (selected === 'Layers') {
        setSelected(null);
      } else {
        setSelected('Layers');
      }
    };

    const isSelected = selected === 'Layers';

    return (
      <Dropdown
        content={<LayersDropdown layers={layers} onChange={handleChange} />}
        visible={isSelected}
        onClickOutside={handleClose}
      >
        <Tooltip content={LAYER_TOOLTIP_TEXT}>
          <Button
            type={isSelected ? 'primary' : 'ghost'}
            icon={isSelected ? 'ChevronUp' : 'ChevronDown'}
            iconPlacement="right"
            data-testid="map-button-layers"
            onClick={handleSelectLayers}
            aria-label="Layers"
            toggled={isSelected}
          >
            {LAYER_BUTTON_TEXT}
          </Button>
        </Tooltip>
      </Dropdown>
    );
  }
);
