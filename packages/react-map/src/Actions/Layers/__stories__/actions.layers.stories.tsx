import * as React from 'react';
import { getSelectableLayer } from '__fixtures/getSelectableLayer';
import { Story, ComponentMeta } from '@storybook/react';

import { SelectableLayer } from '../../../layers/types';
import { Actions } from '../../Actions';
import { Map } from '../../../Map';
import { props as defaultProps } from '../../../__stories__/defaultProps';
import { MapWrapper } from '../../../__stories__/elements';

export default {
  title: 'Map / Action Bar / Layers',
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
} as ComponentMeta<typeof Actions.LayersButton>;

type LayerProps = React.ComponentProps<typeof Actions.LayersButton>;

const useHandleToggle = () => {
  const [on, setOn] = React.useState<Record<string, boolean>>({});
  const handleToggle = (layer: SelectableLayer) => {
    setOn({ ...on, [layer.id]: !on[layer.id] });
  };

  return { handleToggle, on };
};
const getLayers = (on: Record<string, boolean>): LayerProps['layers'] => [
  getSelectableLayer({ id: '1', name: 'Test Layer One', selected: on['1'] }),
  getSelectableLayer({ id: '2', name: 'Test Layer Two', selected: on['2'] }),
];

const BaseComponent: Story<LayerProps> = (props) => {
  const { handleToggle, on } = useHandleToggle();

  return (
    <Actions.LayersButton
      {...props}
      layers={getLayers(on)}
      onChange={handleToggle}
    />
  );
};

export const Simple = BaseComponent.bind({});

export const WithMapWrapper = (props: LayerProps) => {
  const { handleToggle, on } = useHandleToggle();

  return (
    <MapWrapper>
      <Map
        {...defaultProps}
        {...props}
        renderChildren={(props) => (
          <Actions.Wrapper
            {...props}
            renderChildren={() => (
              <BaseComponent
                {...props}
                onChange={handleToggle}
                layers={getLayers(on)}
              />
            )}
          />
        )}
      />
    </MapWrapper>
  );
};

export const WithMapGrouped = () => {
  const { handleToggle, on } = useHandleToggle();
  const layers: LayerProps['layers'] = [
    getSelectableLayer({ id: '1', name: 'Test Layer One', selected: on['1'] }),
    getSelectableLayer({ id: '2', name: 'Test Layer Two', selected: on['2'] }),
    false,
    getSelectableLayer({ id: '3', name: 'Bottom One', selected: on['3'] }),
    getSelectableLayer({ id: '4', name: 'Bottom Two', selected: on['4'] }),
  ];

  return <WithMapWrapper layers={layers} onChange={handleToggle} />;
};
