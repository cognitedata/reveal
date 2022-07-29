import * as React from 'react';
import { getSelectableLayer } from '__fixtures/getSelectableLayer';

import { SelectableLayer } from '../layers/types';
import { Actions } from '../Actions';
import { Map } from '../Map';

import { props } from './defaultProps';
import { MapWrapper } from './elements';

export default {
  title: 'Map / Actions',
  component: Map,
};

export const SelectableLayers = () => {
  const [on, setOn] = React.useState<Record<string, boolean>>({});
  const handleToggle = (layer: SelectableLayer) => {
    setOn({ ...on, [layer.id]: !on[layer.id] });
  };
  const layers = [
    getSelectableLayer({ id: '1', name: 'Test Layer One', selected: on['1'] }),
    getSelectableLayer({ id: '2', name: 'Test Layer Two', selected: on['2'] }),
  ];

  return (
    <MapWrapper>
      <Map {...props}>
        <Actions.Wrapper>
          <Actions.LayersButton layers={layers} onChange={handleToggle} />
        </Actions.Wrapper>
      </Map>
    </MapWrapper>
  );
};

export const LayerWithGroups = () => {
  const layers = [
    getSelectableLayer({ id: '1', name: 'Test Layer One' }),
    getSelectableLayer({ id: '2', name: 'Test Layer Two' }),
    false,
    getSelectableLayer({ id: '3', name: 'Bottom group One' }),
    getSelectableLayer({ id: '4', name: 'Bottom group Two' }),
  ];

  return (
    <MapWrapper>
      <Map {...props}>
        <Actions.Wrapper>
          <Actions.LayersButton layers={layers} />
        </Actions.Wrapper>
      </Map>
    </MapWrapper>
  );
};
