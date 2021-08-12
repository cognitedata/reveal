import {
  fixtureDataTransferDataTable,
  fixtureInitialSelectedColumnNames,
} from '__fixtures__/fixtureDataTransfers';

import { dataTransfersColumnRules } from '../Table/columnRules';
import { generatesDataTypesColumnsFromData } from '../Table/generate';

const columnNames = fixtureInitialSelectedColumnNames;
const response = fixtureDataTransferDataTable;

describe('datatransfers/utils', () => {
  describe('generate', () => {
    it('Transforms the response to column name with correct structure', () => {
      const result = generatesDataTypesColumnsFromData(response, columnNames);

      expect(result).toHaveLength(3);

      const name = result?.find((item) => item.key === 'name');
      expect(name?.title).toMatch('Name');
      expect(name?.sorter).toBeFalsy();

      const status = result?.find((item) => item.key === 'status');
      expect(status?.title).toMatch('');
      expect(status?.sorter).toBeTruthy();

      const detailViewButton = result?.find(
        (item) => item.key === 'detailViewButton'
      );
      expect(detailViewButton?.title).toMatch('');
      expect(detailViewButton?.sorter).toBeTruthy();
    });

    it('Returns undefined if response is empty', () => {
      const result = generatesDataTypesColumnsFromData([], columnNames);
      expect(result).toBeUndefined();
    });

    it('Ignores the columns that are configured to be ignored', () => {
      const result = generatesDataTypesColumnsFromData(response, [
        'source.revisions',
      ]);

      // 1 because detailViewButton is always present
      expect(result).toHaveLength(1);
    });

    /**
     * NOTE: I expected the result from passing the empty list for columnName to
     * just return the detailViewButton. However, it returns all the columns.
     * Is this the intended behavior?
     */
    it.todo(
      'Returns (all the columns)/(the detailViewButton) if columnNames are empty'
    );
  });

  describe('columnRules', () => {
    it.todo(
      'Checks that the various custom column rules (and wildcard) are rendered expectedly'
    );
    it('Ensure that the wildcard of column rules are defined and at the end of the list', () => {
      const mockHandleDetailView = jest.fn();

      const result = dataTransfersColumnRules({
        handleDetailViewClick: mockHandleDetailView,
      });
      expect(result.length).toBeGreaterThan(0);

      /**
       * This test will ensure that the structure of the array is correct.
       * As described in {@link dataTransfersColumnRules}, the wild card has
       * to be at the end of the list to prevent any misc. bugs.
       */
      const wildcard = result[result.length - 1];
      expect(wildcard.key).toMatch('*');
    });
  });
});
