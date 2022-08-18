import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { getFeatureTwo } from '__fixtures/getFeature';
import { action } from '@storybook/addon-actions';

import { FloatingActionsPopup } from '../FloatingActionsPopup';
import { MapWrapper } from '../../__stories__/elements';
import { Map } from '../../Map';
import { props as defaultProps } from '../../__stories__/defaultProps';
import { MapAddedProps } from '../../types';

export default {
  title: 'Map / Floating Actions',
  component: FloatingActionsPopup,
  argTypes: {
    // onSearchClicked: { action: 'onSearchClicked' },
  },
} as Meta;

type Props = React.ComponentProps<typeof FloatingActionsPopup>;

const BaseComponent: Story<Props> = (props) => (
  <FloatingActionsPopup {...props} />
);

const WithMapWrapper = (props: Props) => {
  return (
    <MapWrapper>
      <Map
        {...defaultProps}
        {...props}
        renderChildren={(props: MapAddedProps) => (
          <BaseComponent
            map={props.map!}
            {...props}
            onSearchClicked={() => {
              action('onSearchClicked');
            }}
            selectedFeatures={[getFeatureTwo()]}
            setSelectedFeatures={() => {
              action('setSelectedFeatures');
            }}
            setDrawnFeatures={() => {
              action('setDrawnFeatures');
            }}
          />
        )}
      />
    </MapWrapper>
  );
};

export const Popup = {
  render: WithMapWrapper,
  args: {},
};
