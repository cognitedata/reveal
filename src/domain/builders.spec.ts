import { AdvancedFilterBuilder } from './builders';

describe('builder', () => {
  describe('AdvanceFilterBuilder', () => {
    it('Returns undefined when leaf nodes are empty', () => {
      const emptyFilter = new AdvancedFilterBuilder();

      const result = new AdvancedFilterBuilder().and(emptyFilter).build();

      expect(result).toBeUndefined();
    });

    it('Returns', () => {
      const filters = new AdvancedFilterBuilder().equals('test', 'hey');
      const result = new AdvancedFilterBuilder().and(filters).build();

      expect(result).toMatchObject({
        and: [{ equals: { property: ['test'], value: 'hey' } }],
      });
    });
  });
});
