import { curateTableColumns } from 'utils/Table/curate';
import {
  curatedColumns,
  generatedColumns,
  getColumnRules,
} from '__fixtures__/fixtureConfigurations';
import config from 'configs/configurations.config';
import { generatesDataTypesColumnsFromData } from 'pages/DataTransfers/utils/Table/generate';
import { dataTransfersColumnRules } from 'pages/DataTransfers/utils/Table/columnRules';
import { DataTransfersTableData } from 'pages/DataTransfers/types';
import {
  fixtureDataTransferDataTable,
  fixtureInitialSelectedColumnNames,
} from '__fixtures__/fixtureDataTransfers';

describe('utils/Table', () => {
  describe('curate', () => {
    describe('curateTableColumns', () => {
      describe('configurations', () => {
        it('Returns empty list if undefined', () => {
          const result = curateTableColumns(undefined, getColumnRules);
          expect(result).toEqual([]);
        });

        it('Generates the correct columns, as well as, sets the disabled sorting disabled flag', () => {
          const result = curateTableColumns(generatedColumns, getColumnRules);

          expect(result).toMatchObject(curatedColumns);
          expect(result.length).toEqual(generatedColumns.length);
          config.nonSortableColumns.forEach((nonSortableItem) => {
            const item = result.find(
              (item) => item.accessor === nonSortableItem
            );
            expect(item.disableSortBy).toBeTruthy();
          });
        });
      });

      describe('data transfers', () => {
        const columnNames = fixtureInitialSelectedColumnNames;
        const response = fixtureDataTransferDataTable;

        it('Curates the columns with the defined rules to columns used in the Table', () => {
          const mockHandleDetailView = jest.fn();

          const generateColumns = generatesDataTypesColumnsFromData(
            response,
            columnNames
          );

          const result = curateTableColumns<DataTransfersTableData>(
            generateColumns,
            dataTransfersColumnRules({
              handleDetailViewClick: mockHandleDetailView,
            })
          );

          expect(result.length).toBeGreaterThan(0);

          expect(result.length).toBe(generateColumns?.length);

          const detailViewButton = result[result.length - 1];
          expect(detailViewButton.accessor).toMatch('detailViewButton');
        });

        it('returns the empty list if columns are undefined', () => {
          const result = curateTableColumns<DataTransfersTableData>(
            [],
            dataTransfersColumnRules({
              handleDetailViewClick: jest.fn(),
            })
          );

          expect(result).toMatchObject([]);
        });

        it.todo('Test outcome of when rule is undefined');
      });
    });
  });
});
