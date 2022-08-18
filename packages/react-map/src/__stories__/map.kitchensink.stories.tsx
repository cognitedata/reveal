import * as React from 'react';
import { Story, Meta } from '@storybook/react';

import { Actions } from '../Actions';
import { Map } from '../Map';
import { MapAddedProps } from '../types';
import { usePortalRef } from '../hooks/usePortalRef';

import { props as defaultProps } from './defaultProps';
import { MapWrapper } from './elements';

export default {
  title: 'Map / Map',
  component: Map,
} as Meta;

type PropsForExtras = React.PropsWithChildren<MapAddedProps>;
const ExtraContent: React.FC<PropsForExtras> = ({ children, ...rest }) => {
  //   console.log('Props in story:', rest);
  return (
    <>
      <div>Click up here to trigger the unmount check</div>
      <div>(Should only fire when there is a polygon being drawn)</div>
      <div>
        Polygon:{' '}
        {rest.drawnFeatures ? JSON.stringify(rest.drawnFeatures) : 'None yet!'}
      </div>
      <div>
        Selected:{' '}
        {rest.selectedFeatures
          ? JSON.stringify(rest.selectedFeatures)
          : 'None yet!'}
      </div>
      {children}
    </>
  );
};

const BaseComponent: Story<React.ComponentProps<typeof Map>> = (props) => {
  const { ref, isRefReady } = usePortalRef();

  return (
    <>
      <div ref={ref} />
      <MapWrapper>
        <Map
          {...defaultProps}
          {...props}
          extrasRef={isRefReady && ref.current}
          ExtraContent={ExtraContent}
          renderChildren={(props: MapAddedProps) => {
            return (
              <Actions.Wrapper
                {...props}
                renderChildren={(props: MapAddedProps) => {
                  return (
                    <>
                      <Actions.Status {...props} />
                      <Actions.Polygon {...props} />
                    </>
                  );
                }}
              />
            );
          }}
        />
      </MapWrapper>
    </>
  );
};

export const KitchenSink = BaseComponent.bind({});
KitchenSink.args = {};
