import * as React from 'react';
import { Button, Dropdown, Tooltip } from '@cognite/cogs.js';

import { SelectableLayer } from '../../layers/types';
import { LAYER_BUTTON_TEXT, LAYER_TOOLTIP_TEXT } from '../../constants';

import { LayersDropdown } from './LayersDropdown';

interface Props {
  layers: SelectableLayer[];
}
export const LayersButton: React.FC<Props> = React.memo(({ layers }) => {
  const [selected, setSelected] = React.useState<'Layers' | null>(null);

  const onChange = (layer: SelectableLayer) => {
    // eslint-disable-next-line no-console
    console.log('onChange not implemented yet', layer);
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
      content={<LayersDropdown layers={layers} onChange={onChange} />}
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
});
