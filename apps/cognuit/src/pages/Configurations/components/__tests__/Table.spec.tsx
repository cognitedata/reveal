import { columnRules } from '../Table/columnRules';

describe('Configurations/Table', () => {
  describe('Columns', () => {
    it('... WIP', () => {
      const columns = columnRules({
        handleNameChange: jest.fn(),
        handleStopStart: jest.fn,
      });

      expect(columns).toBeTruthy();
    });

    it.todo('Render function for "business_tags"');
  });
});
