import { ColumnRules } from '../Table/ColumnRule';

describe('Configurations/Table', () => {
  describe('Columns', () => {
    it('... WIP', () => {
      const columns = ColumnRules({
        handleNameChange: jest.fn(),
        handleStopStart: jest.fn,
      });

      expect(columns).toBeTruthy();
    });

    it.todo('Render function for "business_tags"');
  });
});
