import * as React from 'react';
import { Story, Meta } from '@storybook/react';
import { MapWrapper } from '__stories__/elements';
import { props as defaultProps } from '__stories__/defaultProps';

import { Actions } from '../../Actions';
import { Map } from '../../Map';
import { MapAddedProps } from '../../types';
import { usePortalRef } from '../../hooks/usePortalRef';

export default {
  title: 'Map / Unmount',
  component: Map,
} as Meta;

type PropsForExtras = React.PropsWithChildren<MapAddedProps>;
const ExtraContent: React.FC<PropsForExtras> = ({ children }) => {
  //   console.log('Props in story:', rest);
  return (
    <>
      <div>Click up here to trigger the unmount check</div>
      <div>(Should only fire when there is a polygon being drawn)</div>
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
                  return <Actions.Polygon {...props} />;
                }}
              />
            );
          }}
        />
      </MapWrapper>
    </>
  );
};

export const Simple = BaseComponent.bind({});
Simple.args = {};
