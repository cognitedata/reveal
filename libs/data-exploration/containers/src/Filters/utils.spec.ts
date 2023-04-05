import { transformOptionsForMultiselectFilter } from './utils';

describe('utils', () => {
  describe('transformTypeOptionsForMultiselectFilter', () => {
    test('should return a single obj array if the value is a string', () => {
      const testOpt = 'test';
      const multiselectOpts = transformOptionsForMultiselectFilter(testOpt);
      expect(multiselectOpts.length).toBe(1);
      expect(multiselectOpts[0]).toMatchObject({
        label: testOpt,
        value: testOpt,
      });
    });
    test('should return an obj array if the value is a string string array', () => {
      const testOpt = ['test1', 'test2'];
      const multiselectOpts = transformOptionsForMultiselectFilter(testOpt);
      expect(multiselectOpts.length).toBe(2);
    });
  });
});
