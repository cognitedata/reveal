import * as React from 'react';
import { Story, Meta } from '@storybook/react';

import { Actions } from '../../Actions';
import { Map } from '../../../Map';
import { props } from '../../../__stories__/defaultProps';
import { MapWrapper } from '../../../__stories__/elements';

export default {
  title: 'Map / Buttons / Polygon',
  component: Actions.Polygon,
} as Meta;

const BaseComponent: Story<React.ComponentProps<typeof Actions.Polygon>> = (
  props
) => (
  <Actions.Wrapper>
    <Actions.Polygon {...props} />
  </Actions.Wrapper>
);

export const Simple = BaseComponent.bind({});

export const WithMap = () => {
  const [isActive, setIsActive] = React.useState(false);
  const handleToggle = () => {
    setIsActive(!isActive);
  };

  return (
    <MapWrapper>
      <Map {...props}>
        <Actions.Wrapper>
          <Actions.Polygon isActive={isActive} onToggle={handleToggle} />
        </Actions.Wrapper>
      </Map>
    </MapWrapper>
  );
};
