import * as React from 'react';
import { Story, Meta } from '@storybook/react';

import { usePortalRef } from '../hooks/usePortalRef';
import { Map } from '../Map';
import { MapAddedProps } from '../types';

import { props as defaultProps } from './defaultProps';
import { MapWrapper } from './elements';

export default {
  title: 'Map / Map',
  component: Map,
} as Meta;

type PropsForExtras = React.PropsWithChildren<MapAddedProps>;
const ExtraContent: React.FC<PropsForExtras> = ({
  map,
  children,
  drawMode,
}) => {
  return (
    <>
      <div>Here you can access map state outside of the main component</div>
      <div>
        <strong>Current draw mode:</strong> {drawMode}
      </div>
      {map && (
        <div>
          <strong>Zoom level:</strong> {map.getZoom()}
        </div>
      )}
      <div>Note: this does not re-render automatically</div>
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
        />
      </MapWrapper>
    </>
  );
};

export const WithExtraContent = BaseComponent.bind({});
WithExtraContent.args = {};
