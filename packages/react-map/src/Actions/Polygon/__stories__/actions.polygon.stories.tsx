import * as React from 'react';
import { Story, Meta } from '@storybook/react';

import { Actions } from '../../Actions';
import { Map } from '../../../Map';
import { props } from '../../../__stories__/defaultProps';
import { MapWrapper } from '../../../__stories__/elements';
import { AddActionWrapper } from '../../Wrapper';

export default {
  title: 'Map / Action Bar / Polygon',
  component: Actions.Polygon,
  argTypes: {
    onToggle: { action: 'clicked' },
    setDrawMode: { action: 'clicked' },
  },
} as Meta;

const BaseComponent: Story<React.ComponentProps<typeof Actions.Polygon>> = (
  props
) => <AddActionWrapper renderChildren={Actions.Polygon} {...props} />;

export const Simple = BaseComponent.bind({});
export const InitiallyActive = BaseComponent.bind({});
InitiallyActive.args = {};

export const WithMap = () => {
  const [isActive, setIsActive] = React.useState(false);
  const handleToggle = () => {
    setIsActive(!isActive);
  };

  const BaseComponentWithToggle = React.useCallback(
    (props: React.ComponentProps<typeof Actions.Polygon>) => (
      <BaseComponent onToggle={handleToggle} {...props} />
    ),
    [handleToggle]
  );

  return (
    <MapWrapper>
      <Map {...props} renderChildren={BaseComponentWithToggle} />
    </MapWrapper>
  );
};
