import { Map } from '../Map';

import { props } from './defaultProps';

export default {
  title: 'Map / Default',
  component: Map,
};

export const basic = () => {
  return (
    <div style={{ display: 'flex' }}>
      <Map {...props} />
    </div>
  );
};
