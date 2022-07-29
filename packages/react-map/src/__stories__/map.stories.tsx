import { Map } from '../Map';

import { props } from './defaultProps';
import { MapWrapper } from './elements';

export default {
  title: 'Map / Map',
  component: Map,
};

export const basic = () => {
  return (
    <MapWrapper>
      <Map {...props} />
    </MapWrapper>
  );
};
