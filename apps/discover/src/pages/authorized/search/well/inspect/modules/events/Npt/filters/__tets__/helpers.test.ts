import { isDurationEmpty } from 'pages/authorized/search/well/inspect/modules/events/Npt/filters/helpers';

describe('helpers', () => {
  describe('isDurationEmpty', () => {
    it('should return correct result', () => {
      expect(isDurationEmpty([])).toBeFalsy();
      expect(isDurationEmpty([1])).toBeFalsy();
      expect(isDurationEmpty([1, 4])).toBeFalsy();
      expect(isDurationEmpty([0, 0])).toBeTruthy();
    });
  });
});
