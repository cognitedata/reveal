import * as React from 'react';
import { getSelectableLayer } from '__fixtures/getSelectableLayer';
import { Story, Meta } from '@storybook/react';

import { SelectableLayer } from '../../../layers/types';
import { Actions } from '../..';
import { Map } from '../../../Map';
import { props } from '../../../__stories__/defaultProps';
import { MapWrapper } from '../../../__stories__/elements';

export default {
  title: 'Map / Buttons / Layers',
  component: Actions.LayersButton,
  argTypes: {
    layers: {
      name: 'Layers',
      options: ['Simple', 'Grouped'],
      mapping: {
        Simple: [
          getSelectableLayer({
            id: '1',
            name: 'Test Layer One',
            selected: true,
          }),
          getSelectableLayer({
            id: '2',
            name: 'Test Layer Two',
            selected: false,
          }),
        ],
        Grouped: [],
      },
      control: { type: 'radio' },
    },
  },
} as Meta;

const useHandleToggle = () => {
  const [on, setOn] = React.useState<Record<string, boolean>>({});
  const handleToggle = (layer: SelectableLayer) => {
    setOn({ ...on, [layer.id]: !on[layer.id] });
  };

  return { handleToggle, on };
};
const getLayers = (on: Record<string, boolean>) => [
  getSelectableLayer({ id: '1', name: 'Test Layer One', selected: on['1'] }),
  getSelectableLayer({ id: '2', name: 'Test Layer Two', selected: on['2'] }),
];

const BaseComponent: Story<
  React.ComponentProps<typeof Actions.LayersButton>
> = (props) => {
  const { handleToggle, on } = useHandleToggle();
  return (
    <Actions.Wrapper>
      <Actions.LayersButton
        {...props}
        layers={getLayers(on)}
        onChange={handleToggle}
      />
    </Actions.Wrapper>
  );
};

export const Simple = BaseComponent.bind({});

export const WithMap = () => {
  const { handleToggle, on } = useHandleToggle();
  return (
    <MapWrapper>
      <Map {...props}>
        <Actions.Wrapper>
          <Actions.LayersButton
            layers={getLayers(on)}
            onChange={handleToggle}
          />
        </Actions.Wrapper>
      </Map>
    </MapWrapper>
  );
};

export const WithMapGrouped = () => {
  const { handleToggle, on } = useHandleToggle();
  const layers = [
    getSelectableLayer({ id: '1', name: 'Test Layer One', selected: on['1'] }),
    getSelectableLayer({ id: '2', name: 'Test Layer Two', selected: on['2'] }),
    false,
    getSelectableLayer({ id: '3', name: 'Bottom One', selected: on['3'] }),
    getSelectableLayer({ id: '4', name: 'Bottom Two', selected: on['4'] }),
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
