import * as React from 'react';

import { Actions } from '../Actions';
import { Map } from '../Map';

import { props } from './defaultProps';
import { MapWrapper } from './elements';

export default {
  title: 'Map / Buttons / Polygon',
  component: Actions.Polygon,
};

const BaseComponent = (props: React.ComponentProps<typeof Actions.Status>) => (
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
