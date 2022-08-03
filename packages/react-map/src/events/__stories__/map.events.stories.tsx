import { Story, Meta } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { Map } from '../../Map';
import { props } from '../../__stories__/defaultProps';
import { MapWrapper } from '../../__stories__/elements';

export default {
  title: 'Map / Events',
  component: Map,
} as Meta;

export const Simple: Story = () => {
  const setupEvents: React.ComponentProps<typeof Map>['setupEvents'] = ({
    defaultEvents,
  }) => {
    return [
      ...defaultEvents,
      {
        type: 'click',
        callback: action('Click layer event!'),
      },
    ];
  };

  return (
    <MapWrapper>
      <Map {...props} setupEvents={setupEvents} />
    </MapWrapper>
  );
};
