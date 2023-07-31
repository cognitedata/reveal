import { StampGroup } from '../react/components/stamp-tool-popup';

import atlas from './atlas.png';
import maintain from './maintain-logo.png';

const STAMP_GROUP: StampGroup = {
  name: 'Example symbols',
  stamps: [
    {
      name: 'Atlas',
      url: atlas,
    },
    {
      name: 'Maintain Logo',
      url: maintain,
    },
  ],
};

export const STAMP_GROUPS: StampGroup[] = [STAMP_GROUP];
