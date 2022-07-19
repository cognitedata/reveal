import { example } from './index';

describe('index', () => {
  describe('example', () => {
    it('does the right thing', () => {
      expect(example()).toBe(true);
    });
  });
});
