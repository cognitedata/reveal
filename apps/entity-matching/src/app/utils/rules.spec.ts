import { nameToPattern, toRule } from './rules';

describe('Rules', () => {
  describe('nameToPattern', () => {
    it('returns the correct pattern', () => {
      const [groups, groupTypes] = nameToPattern('23-XF-12345');

      expect(groups).toMatchObject(['23', '-', 'XF', '-', '12345']);
      expect(groupTypes).toMatchObject(['D', 'S', 'L', 'S', 'D']);
    });
  });

  describe('toRule', () => {
    it('returns a simple rule', () => {
      const rule = toRule(
        'name',
        'VAL_23_XF_12345:foo.bar',
        'name',
        '23-XF-12345'
      );

      expect(rule.conditions.length).toBe(3);
      expect(rule.conditions[0].arguments).toMatchObject([
        [0, 1],
        [1, 0],
      ]);
      expect(rule.conditions[1].arguments).toMatchObject([
        [0, 2],
        [1, 1],
      ]);
      expect(rule.conditions[2].arguments).toMatchObject([
        [0, 3],
        [1, 2],
      ]);

      expect(rule.extractors.length).toBe(2);
      expect(rule.extractors[0].entitySet).toBe('sources');
      expect(rule.extractors[0].pattern).toBe(
        '^(\\p{L}+)_([0-9]+)_(\\p{L}+)_([0-9]+)(.*)$'
      );
      expect(rule.extractors[1].entitySet).toBe('targets');
      expect(rule.extractors[1].pattern).toBe('^([0-9]+)-(\\p{L}+)-([0-9]+)$');
    });

    it('can handle different group orders', () => {
      const rule = toRule('name', 'XF_12345:foo23.bar', 'name', '23-XF-12345');

      expect(rule.conditions.length).toBe(3);
      expect(rule.conditions[0].arguments).toMatchObject([
        [0, 0],
        [1, 1],
      ]);
      expect(rule.conditions[1].arguments).toMatchObject([
        [0, 1],
        [1, 2],
      ]);
      expect(rule.conditions[2].arguments).toMatchObject([
        [0, 3],
        [1, 0],
      ]);
    });
  });
});
