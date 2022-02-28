import { CogniteEvent } from '@cognite/sdk';

import { getDiameterHole } from '../decorators/getDiameterHole';

describe('NDS:Decorators', () => {
  describe('getDiameterHole', () => {
    it('converts the string (number) to 3 digit points', () => {
      const result = getDiameterHole({
        metadata: { diameter_hole: '0.523423423' },
      } as unknown as CogniteEvent);

      expect(result).toBe('0.523');
    });

    it('returns NaN on random string', () => {
      const result = getDiameterHole({
        metadata: { diameter_hole: 'random string' },
      } as unknown as CogniteEvent);

      expect(result).toBe('NaN');
    });
  });
});
